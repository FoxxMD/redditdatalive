import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import './index.css';
import App from './App';
import rootReducer from './reducers';
import registerServiceWorker from './registerServiceWorker';
import sseMiddleware from './sseMiddle';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [
  sagaMiddleware,
  sseMiddleware
];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore( rootReducer, {}, composeEnhancers( applyMiddleware( ...middlewares ) ) );

ReactDOM.render( <Provider store={store}><App/></Provider>, document.getElementById( 'root' ) );
registerServiceWorker();
