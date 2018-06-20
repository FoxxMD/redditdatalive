import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createHistory from "history/createBrowserHistory";

import {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
} from "react-router-redux";


import './index.css';
import App from './App';
import rootReducer from './reducers';
import registerServiceWorker from './registerServiceWorker';
import sseMiddleware from './sseMiddle';

const sagaMiddleware    = createSagaMiddleware();
const history           = createHistory();
const historyMiddleware = routerMiddleware( history );

const combinedReducers = combineReducers( {
  ...rootReducer,
  router: routerReducer
} );

const middlewares = [
  historyMiddleware,
  sagaMiddleware,
  sseMiddleware
];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore( combinedReducers, composeEnhancers( applyMiddleware( ...middlewares ) ) );

ReactDOM.render( <Provider store={store}>
  <ConnectedRouter history={history}>
	<App/>
  </ConnectedRouter>
</Provider>, document.getElementById( 'root' ) );
registerServiceWorker();
