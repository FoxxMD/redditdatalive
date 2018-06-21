import { simpleSelect } from '../../Utils/selectorUtil';
import { createSelector } from 'reselect';

const REDUCER_NAME = 'preferences';

const selectPreferenceByName = ( name ) => simpleSelect( [ REDUCER_NAME, name ] );
const selectActivePrefName   = simpleSelect( [ REDUCER_NAME, 'activePref' ] );
const selectPreferences      = simpleSelect( [ REDUCER_NAME ] );

const selectActivePref = createSelector(
	selectActivePrefName,
	selectPreferences,
	( name, prefs ) => prefs[ name ]
);

export {
  selectPreferenceByName,
  selectActivePrefName,
  selectActivePref,
  selectPreferences
};