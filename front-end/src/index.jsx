import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import * as serviceWorker from './serviceWorker';

// Replace the div in public/index.html with the ID of root with our React app!
ReactDOM.render(<App />, document.getElementById('root'));

// Ignore the following
serviceWorker.unregister();