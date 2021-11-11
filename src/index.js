import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'what-input'


ReactDOM.render(<App />, document.getElementById('root'));

// to work the app offline and load faster,we can change unregister() to register()

serviceWorker.unregister();
