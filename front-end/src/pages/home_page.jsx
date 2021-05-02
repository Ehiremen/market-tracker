import React, { Fragment } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import {Typography} from "@material-ui/core";
import axios from 'axios';
import Button from "@material-ui/core/Button";

// JSS style hook to provide CSS style classes to React code
const useStyles = makeStyles({

    homePage: {
        // not setting minHeight to 100vh to avoid being forced a scroll bar
        minHeight: '80vh',

        // setting paddingTop to make sure text at top of page doesn't initially
        // render behind navigation bar
        paddingTop: '6rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',

        // setting bottom  margin to be more than footer height (3rem) so that text
        // at the bottom of the page isn't permanently covered by the footer
        marginBottom: '4rem'
    },

    phoneNumFlexRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flexStart',
        alignItems: 'center'
    },

    formTextField: {

        maxWidth: '25rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        marginLeft: '2rem'

    },

    submitButton: {

        backgroundColor: 'pink',
        color: 'black',

        padding: '1rem',
        marginTop: '2rem',

        // set a maxWidth to avoid having a button that spans the entire view width
        maxWidth: '10rem'

    },

    queryFlexRow: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'flexStart',
        alignItems: 'center'
    },

    selector: {
        minWidth: '8rem',
        marginLeft: '1rem'
    }
});


export function HomePage() {

    const classes = useStyles();

    const defaultAlert = {symbol: '', isCrypto: false, notifyIfBelow: true, price: 0};
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [requestedAlerts, setRequestedAlert] = React.useState([defaultAlert]);


    function capturePhoneNum(e) {
        if (e) {

            // adding .trim() prevents the user from typing whitespace.
            setPhoneNumber(e.target.value.trim());

        }
    }

    function handleAddAlert() {
        const values = [...requestedAlerts];
        values.push(defaultAlert);
        setRequestedAlert(values);
    }

    function handleRemoveAlert(index) {
        const values = [...requestedAlerts];
        if (values.length > 1) {
            values.splice(index, 1);
            setRequestedAlert(values);
        }
    }

    function handleIsCrypto(event, index) {
        const values = [...requestedAlerts];
        values[index].isCrypto = event.target.value;
        setRequestedAlert(values);
    }

    function handleNotifyIfBelow(event, index) {
        const values = [...requestedAlerts];
        values[index].notifyIfBelow = event.target.value;
        setRequestedAlert(values);
    }

    function handlePrice(event, index) {
        const values = [...requestedAlerts];
        values[index].price = event.target.valueAsNumber;
        setRequestedAlert(values);
    }

    function handleSymbol(event, index) {
        const values = [...requestedAlerts];
        values[index].symbol = event.target.value.toUpperCase();
        setRequestedAlert(values);
    }

    function validateFields(req) {
       if (req.symbol === '' || req.price <= 0) return false;
        return true;
    }


    function handleSubmitButton() {

        console.log(phoneNumber);

        if ( phoneNumber === '' || phoneNumber.length < 10 ) {
            alert('Invalid phone number');
            return;
        }

        console.log(requestedAlerts);

        const numRequested = requestedAlerts.length;
        let numSuccesses = 0;
        // async/await version
        requestedAlerts.map( (req) => {
            if (validateFields(req)) {
                axios
                    .post('/query', {
                        symbol: req.symbol,
                        isCrypto: req.isCrypto,
                        notifyAt: phoneNumber,
                        targetValue: req.price,
                        notifyIfBelow: req.notifyIfBelow,
                        isCompleted: false,
                        toCurrency: "USD"
                    })
                    .then((res) => {
                        console.log('Query added!')
                        console.log(res.data)
                    })
                    .catch(err => {
                        console.error(err);
                    });

                numSuccesses++;
            }
            else {
                alert('Faulty data!');
                console.log('Faulty data at: ', req);
            }

        });


        // reset/clear text fields
        setPhoneNumber('');
        setRequestedAlert([defaultAlert]);

        alert(numSuccesses + ' out of ' + numRequested + ' alert(s) queued!');


    }


    return (
        <div className={classes.homePage}>
            <Typography variant={'h4'}>

                Fill out this form for market movement notifications!

            </Typography>

            <div className={classes.phoneNumFlexRow}>
                <Typography variant={'h5'}>
                    Send text notification(s) to:
                </Typography>

                <TextField
                    className={classes.formTextField}
                    required
                    value={phoneNumber}
                    label={'phone number'}
                    variant={'outlined'}
                    onChange={capturePhoneNum}
                />
            </div>

            <div >
                {requestedAlerts.map((req, index) => (
                    <Fragment key={`${req}~${index}`}>
                        <div className={classes.queryFlexRow}>

                            {/*symbol to look for*/}
                            <TextField
                                className={classes.formTextField}
                                required
                                value={req.symbol}
                                label={'symbol'}
                                helperText={'stock/crypto to watch'}
                                variant={'outlined'}
                                onChange={(event) => handleSymbol(event, index)}
                            />

                            {/* isCrypto*/}
                            <FormControl className={classes.selector}>
                                <InputLabel htmlFor="age-native-simple">is crypto?</InputLabel>
                                <Select
                                    native
                                    value={req.isCrypto}
                                    onChange={(event) => handleIsCrypto(event, index)}
                                >
                                    <option value={false}>no</option>
                                    <option value={true}>yes</option>
                                </Select>
                            </FormControl>

                             {/*check for price above/below?*/}
                            <FormControl className={classes.selector}>
                                <InputLabel htmlFor="age-native-simple">watch for price</InputLabel>
                                <Select
                                    native
                                    value={req.notifyIfBelow}
                                    onChange={(event) => handleNotifyIfBelow(event, index)}
                                >
                                    <option value={true}>below</option>
                                    <option value={false}>at/over</option>
                                </Select>
                            </FormControl>

                            {/*price*/}
                            <TextField
                                className={classes.formTextField}
                                required
                                value={req.price}
                                label={'price in cents'}
                                variant={'outlined'}
                                type={'number'}
                                onChange={(event) => handlePrice(event, index)}
                            />

                            <Button
                                onClick={() => handleRemoveAlert(index)}>
                                -
                            </Button>

                            <Button
                                onClick={handleAddAlert}>
                                +
                            </Button>

                        </div>
                    </Fragment>
                    )
                )}
            </div>

            <div>
                {/*<Typography variant={'h3'}>*/}
                {/*    SITE DOWN FOR MAINTENANCE UNTIL 4/21*/}
                {/*</Typography>*/}
            </div>

            <Button
                className={classes.submitButton}
                onClick={handleSubmitButton}>

                Notify Me!
            </Button>

        </div>
    )
}