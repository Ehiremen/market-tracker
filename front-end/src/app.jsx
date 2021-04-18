import React from "react";

import {
    BrowserRouter,
    Switch,
    Route
} from "react-router-dom";

import { HomePage } from "./pages/home_page";

import { NavigationBar } from "./navigation-bar/navigation_bar";
import { Footer } from "./footer/footer";

import CssBaseline from "@material-ui/core/CssBaseline";

export default function App() {

    return (

        <BrowserRouter>

            { /* works like Normalize.css to reset browser CSS differences */ }
            <CssBaseline />

            <div>
                {/* because they're outside the Switch element, NavigationBar and Footer
                    stay the same across different pages */}
                <NavigationBar />

                <Switch>

                    { /* Always render the 'HomePage' component */ }
                    <Route path={'*'}>
                        <HomePage/>
                    </Route>

                </Switch>

                <Footer />

            </div>

        </BrowserRouter>

    );

}