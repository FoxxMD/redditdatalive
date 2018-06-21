import * as constants from './preferencesConstants';

export function setPreferences( name, defaultData = {} ){
  return { type: constants.SET_PREFERENCE, payload: { defaultData, name } };
}

export function setActivePref( name ){
  return { type: constants.SET_ACTIVE_PREFERENCE, payload: name };
}