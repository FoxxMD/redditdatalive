import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createHistory from "history/createBrowserHistory";

import {
  ConnectedRouter,
  routerMiddleware,
} from "react-router-redux";


import './index.css';
import App from './App';
import createReducer from './reducers';
import registerServiceWorker from './registerServiceWorker';
import sseMiddleware from './Global/SSE/sseMiddleware';

const sagaMiddleware    = createSagaMiddleware();
const history           = createHistory();
const historyMiddleware = routerMiddleware( history );

const middlewares = [
  historyMiddleware,
  sagaMiddleware,
  sseMiddleware
];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore( createReducer(), composeEnhancers( applyMiddleware( ...middlewares ) ) );

store.runSaga          = sagaMiddleware.run;
store.injectedReducers = {}; // Reducer registry
store.injectedSagas    = {}; // Saga registry

ReactDOM.render( <Provider store={store}>
  <ConnectedRouter history={history}>
	<App/>
  </ConnectedRouter>
</Provider>, document.getElementById( 'root' ) );
registerServiceWorker();
