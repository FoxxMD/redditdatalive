import * as constants from './preferencesConstants';

export function setPreferences( data = {}, name = undefined ){
  return { type: constants.SET_PREFERENCE, payload: { data, name } };
}

export function setActivePref( name ){
  return { type: constants.SET_ACTIVE_PREFERENCE, payload: name };
}