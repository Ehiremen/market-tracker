
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const path = require('path');

// twilio setup
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);


// mongo setup
const {Query} = require('./model/query');
const {Watchlist} = require('./model/watchlist');
const mongoose = require('mongoose');

const url = process.env.MONGO_URL || 'mongodb://localhost/market-tracker';
mongoose.connect(url, {useNewUrlParser: true,  useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
    console.log('mongoose connection established');
    })
    .catch(err => {
        console.log(err);
    });

const connection = mongoose.connection;

connection.on('error', () => console.error('connection error: '));
connection.once('open', () => console.log('connection is live! '));


// ----------------------------------------

// misc express-related setup
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);


app.use(express.static(path.resolve(__dirname, '../front-end/build')));


app.get('/', function (req, res){

    res.sendFile(path.resolve(__dirname, '../front-end/build', 'index.html'));

});

app.post('/query', async (req, res) => {
    console.log(req.body);
    const { symbol, isCrypto, notifyAt, targetValue, notifyIfBelow, isCompleted, toCurrency } = req.body;

    try {
        await Watchlist.create( {symbol, isCrypto, price: 0, priceCurrency: 'USD'});
    } catch (error) {
        console.log('some error adding security ', symbol, ' to watchlist');
    }

    try {
        const query = await Query.create( {symbol, isCrypto, notifyAt, targetValue, notifyIfBelow, isCompleted, toCurrency});
        return res.send(query);
    } catch (error) {
        return res.sendStatus(400);
    }
});


app.get('/*', (req, res) => {

    console.log('unspecified route requested... ');
    res.sendFile(path.resolve(__dirname, '../front-end/build', 'index.html'));

});


async function sendAlert(data, price) {
    let messageBody = "Hi, market-tracker here \n";
    messageBody += data.symbol + " is " + (data.notifyIfBelow ? "below $" : "at/above $") + (data.targetValue/100.00) +
        " right now! ------ currently at $" + price;

    console.log('sending message: ', messageBody);
    client.messages
        .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: data.notifyAt,
            body: messageBody
        })
        .then(() => {
            console.log({success: true});
        })
        .catch(err => {
            console.log(err);
            console.log({ success: false });
        });
}

// sample alphavantage get requests for stock and crypto
//https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
// https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=CNY&apikey=demo

async function getMarketData() {
    let securities;

    try {
        securities = await Watchlist.find({});
        console.log('getting market data for ', securities.length, ' items');

        const baseAddress = 'https://www.alphavantage.co/query?';

        for (let i = 0; i < securities.length; i++) {
            let httpRequestAddress;
            let currentPrice;


            if (securities[i].isCrypto) {
                httpRequestAddress = baseAddress + 'function=CURRENCY_EXCHANGE_RATE&from_currency=' + securities[i].symbol + '&to_currency=USD&apikey=' +
                    process.env.ALPHA_VANTAGE_API_KEY;

                try {
                    await axios.get(httpRequestAddress).then((response) => {
                        currentPrice = response.data['Realtime Currency Exchange Rate']['5. Exchange Rate'];
                        console.log('crypto data received', currentPrice);
                    });
                } catch (error) {
                    console.log('error getting crypto price');
                    currentPrice = -1;
                }

            } else {
                httpRequestAddress = baseAddress + 'function=GLOBAL_QUOTE&symbol=' + securities[i].symbol + '&apikey=' + process.env.ALPHA_VANTAGE_API_KEY;


                try {
                    await axios.get(httpRequestAddress).then((response) => {
                        currentPrice = response.data['Global Quote']['05. price'];
                        console.log('stock data received');
                    });
                } catch (error) {
                    console.log('error getting stock price');
                    currentPrice = -1;
                }

            }

            if (currentPrice == -1) {
                console.log('unable to get price for ', securities[i].symbol);
                securities[i].price = -1;
            }
            else {
                securities[i].price = currentPrice; // price in dollars
            }

        }

        return securities;
    } catch (error) {
        console.log('error at getMarketData()');
        return false;
    }

}

// sample alphavantage get requests for stock and crypto
//https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
// https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=DOGE&to_currency=CNY&apikey=demo

async function loopingFunction() {
    try {

        // get all uncompleted requests from db
        const data = await Query.find({isCompleted: false});

        const securities = await getMarketData();
        // console.log(securities);
        // const currentPrice = securities.find(item => item.symbol === data[0].symbol);
        // console.log('find results: ', currentPrice.price);

        if (securities === false) return;

        for (let i = 0; i < data.length; i++) {
            let currentPrice, relevantItem;
            try {
                relevantItem = securities.find(item => {
                    // console.log('quotes: ', item['symbol'], ' dot: ', item.symbol, 'data: ', data[i].symbol);
                    return item.symbol === data[i].symbol
                });
                currentPrice = relevantItem.price;
            } catch (e) {
                console.log('skipping faulty price check for: ', data[i].symbol, 'in:\n', securities);
                // console.log('got: ', relevantItem);
                // console.log('current price btw: ', currentPrice);
                continue;
            }

            if (currentPrice === -1) continue;

            const priceInCents = currentPrice * 100;

            // const currentMinusTargetPrice = currentPrice - (data[i].targetValue/100);
            const sendNotify = data[i].notifyIfBelow ? (priceInCents < data[i].targetValue) : (priceInCents >= data[i].targetValue);

            // if ((data[i].notifyIfBelow && currentMinusTargetPrice<0) || (!(data[i].notifyIfBelow) && currentMinusTargetPrice>=0)) {
            if (sendNotify && (currentPrice > 0)) {
                try {

                    console.log('sendingAlert');
                    await sendAlert(data[i], currentPrice);

                    const updatedData = data[i];
                    updatedData.isCompleted = true;

                    // using delete + create because updateOne is bugging out
                    await Query.deleteOne(data[i]);
                    await Query.create(updatedData);

                } catch (error) {
                    console.log('failed to send alert');
                }

            } else {
                console.log('not sending alert for ', (data[i].notifyIfBelow ? 'below ' : 'at/over '), data[i].targetValue, 'cents to ', data[i].notifyAt);
            }

        }
    } catch (error) {
        console.log('error at loopingFunction():', error);
    }

}

function run () {
    // set loop to run every X time (can do 500 daily alphaVantage get requests on a free account)
    const timeoutInMilliseconds = 172800; // how often should the market data be checked? 1000 = 1 second
    setInterval(loopingFunction, timeoutInMilliseconds);
}


app.listen(PORT, () => console.log('Server is up'));

run();


setInterval(async function() {
    try {

        await axios.get("https://markettracker.herokuapp.com").then((response) => {
            console.log('keeping app awake');
        });

    }  catch (error) {
        console.log('error at setInterval()');
    }
}, 1200000); // every 20 minutes 1200000