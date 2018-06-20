// import * as constants from './constants';
import { combineReducers } from 'redux';
import {
  routerReducer,
} from "react-router-redux";

import preferences from './Global/Preferences/preferencesReducer';
import sse from './Global/SSE/sseReducer';

export default function createReducer( injectedReducers ){
  return combineReducers( {
	route: routerReducer,
	preferences,
	sse,
	...injectedReducers,
  } );
}