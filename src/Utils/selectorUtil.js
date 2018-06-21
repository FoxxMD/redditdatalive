import { createSelector } from 'reselect';
import get from 'lodash/get';

export const simpleSelect = ( path, defaultVal = undefined ) => createSelector(
	state => get( state, path, defaultVal ),
	val => val
);