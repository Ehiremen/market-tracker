import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import React from "react";

import {useHistory} from "react-router-dom";

// A React component for just the navigation bar at the top of the screen
export function NavigationBar() {

    // Get a reference to the History object React Router uses through the useHistory hook
    const history = useHistory();


    // Called when the user selects the 'Home' button, pushes the root ('/') location onto the history stack
    function handleHomeNavigation() {

        // React Router will be watching this object in the app.jsx page and will change the page accordingly
        history.push('/');

    }



    return (

        <AppBar>

            <Toolbar>

                <Button
                    color="inherit"
                    onClick={handleHomeNavigation}>

                    Home
                </Button>


            </Toolbar>

        </AppBar>

    )

}