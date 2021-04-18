
require('dotenv').config();

const express = require('express');
const axios = require('axios');

// twilio vars
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// mongo vars
const PORT = process.env.PORT || 5000;
const path = require('path');
const {Query} = require('./model/query');
const mongoose = require('mongoose');

// instantiate mongo
const url = process.env.MONGO_URL || 'mongodb://localhost/market-tracker';
mongoose.connect(url, {useNewUrlParser: true,  useFindAndModify: false });
const connection = mongoose.connection;

connection.on('error', () => console.error('connection error: '));
connection.once('open', () => console.log('connection is live! '));
// ----------------------------------------

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);


app.get('/', function (req, res){

    Query.find({}, function(err, queries) {
        res.json(queries);
    });

});

app.post('/query', async (req, res) => {
    console.log(req.body);
    const { symbol, isCrypto, notifyAt, targetValue, notifyIfBelow, isCompleted, toCurrency } = req.body;

    try {
        const query = await Query.create( {symbol, isCrypto, notifyAt, targetValue, notifyIfBelow, isCompleted, toCurrency});
        return res.send(query);
    } catch (error) {
        return res.sendStatus(400);
    }
});

/*
app.post('/api/messages', (req, res) => {
    res.header('Content-Type', 'application/json');
    client.messages
        .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: req.body.to,
            body: req.body.body
        })
        .then(() => {
            res.send(JSON.stringify({ success: true }));
        })
        .catch(err => {
            console.log(err);
            res.send(JSON.stringify({ success: false }));
        });
});
*/



app.get('/*', (req, res) => {

    console.log('unspecified route requested... ');

});


async function sendAlert(data, price) {
    let messageBody = "Hi, market-tracker here \n";
    messageBody += data.symbol + " is " + (data.notifyIfBelow ? "below $" : "at/above $") + (data.targetValue/100) +
        " right now! ------ currently at $" + price;

    console.log(messageBody);
    client.messages
        .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: data.notifyAt,
            body: messageBody
        })
        .then(() => {
            console.log({success:true});
        })
        .catch(err => {
            console.log(err);
            console.log({ success: false });
        });
}

//https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
// https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=CNY&apikey=demo
const baseAddress = 'https://www.alphavantage.co/query?';

async function loopingFunction() {
    console.log('looping');

    let data = await Query.find({isCompleted: false});
    console.log(data);

    // check each one
    for (let i=0; i<data.length; i++) {
        let httpRequestAddress;
        let currentPrice;

        if (data[i].isCrypto) {
            httpRequestAddress = baseAddress + 'function=CURRENCY_EXCHANGE_RATE&from_currency=' + data[i].symbol + '&to_currency=USD&apikey=' +
                process.env.ALPHA_VANTAGE_API_KEY;
            console.log('query: ', httpRequestAddress);
            console.log();

            const alphaApiData = await axios.get(httpRequestAddress).then((response) => {
                console.log('crypto data received');
                currentPrice = response.data['Realtime Currency Exchange Rate']['5. Exchange Rate'];
            });
        }
        else {
            httpRequestAddress = baseAddress + 'function=GLOBAL_QUOTE&symbol=' + data[i].symbol + '&apikey=' + process.env.ALPHA_VANTAGE_API_KEY;
            console.log('query: ', httpRequestAddress);
            console.log();

            const alphaApiData = await axios.get(httpRequestAddress).then((response) => {
                console.log('stock data received');
                currentPrice = response.data['Global Quote']['05. price'];
            });
        }

        const currentMinusTargetPrice = currentPrice - (data[i].targetValue/100);
        if ((data[i].notifyIfBelow && currentMinusTargetPrice<0) || (!(data[i].notifyIfBelow) && currentMinusTargetPrice>=0)) {
            console.log('sendingAlert');
            await sendAlert(data[i], currentPrice);

            const updatedData = data[i];
            updatedData.isCompleted = true;

            // using delete + create because updateOne is bugging out
            await Query.deleteOne(data[i]);
            await Query.create(updatedData);


            // await Query.updateOne(data[i], {$set: {'isCompleted': true}}, function(err, res) {
            //    if (err) {
            //        console.log('unable to update data for: ', data[i]);
            //    }
            //    else {
            //        console.log('records updated');
            //    }
            // });
        }

    }
}

function run () {
    setInterval(loopingFunction, 6000);
    // setInterval(loopingFunction, 60000);
}


app.listen(PORT, () => console.log('Server is up'));

run();