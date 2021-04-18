import makeStyles from "@material-ui/core/styles/makeStyles";
import {Typography} from "@material-ui/core";
import React from "react";

const usesStyles = makeStyles({

    fixedHeader: {

        marginLeft: '0',
        paddingLeft: '2rem',
        paddingRight: '2rem',

        // want my footer to always be at the bottom of the page
        top: '0',
        position: 'fixed',

        width: '100%',
        height: '5rem',

        backgroundColor: 'royalblue',
        color: 'white',

        // flexBox
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'

    }

});

// A React component for just the navigation bar at the top of the screen
export function NavigationBar() {

    const classes = usesStyles();

    return (

        <div className={classes.fixedHeader}>

            <Typography variant={'h4'}>

                MARKET TRACKER

            </Typography>

        </div>

    )

}