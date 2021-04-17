import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

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

    }
});

export function HomePage() {

    const classes = useStyles();

    return (
        <div className={classes.homePage}>
            <li>Homepage content</li>

        </div>
    )
}