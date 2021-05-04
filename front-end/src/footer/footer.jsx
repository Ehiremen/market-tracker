import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

const usesStyles = makeStyles({

    fixedFooter: {

        marginLeft: '0',
        paddingLeft: '2rem',
        paddingRight: '2rem',

        // want my footer to always be at the bottom of the page
        bottom: '0',
        position: 'fixed',

        width: '100%',
        height: '3rem',

        backgroundColor: 'royalblue',
        color: 'white',

        // flexBox
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'

    }

});


export function Footer() {

    const classes = usesStyles();

    return (

        <div className={classes.fixedFooter}>

            <p>Copyright Ekore 2021</p>
            <p>Market data checked every 173 seconds</p>

        </div>

    )

}
