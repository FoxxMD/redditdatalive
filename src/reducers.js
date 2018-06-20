// import * as constants from './constants';
import { combineReducers } from 'redux';
import {
  routerReducer,
} from "react-router-redux";

import preferences from './GlobalReducers/PreferencesReducer';
import sse from './GlobalReducers/SSEReducer';

export default function createReducer( injectedReducers ){
  return combineReducers( {
	route: routerReducer,
	preferences,
	sse,
	...injectedReducers,
  } );
}