import { createSelector } from 'reselect';
import { get } from 'lodash';

export const simpleSelect = path => createSelector(
	state => get( state, path ),
	val => val
);