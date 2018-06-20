import * as constants from './preferencesConstants';

export function initializePreferences( name, defaultData = {} ){
  return { type: constants.INITIALIZE_PREFERENCE, payload: { defaultData, name } };
}