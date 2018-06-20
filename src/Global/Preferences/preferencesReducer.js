import * as constants from './preferencesConstants';

const initialState = {};

export const defaultPrefs = {
  autoStart: true,
  availableEvents: [],
  activeEvents: [],
  filterBySubreddits: [],
  filterBySelf: false,
  nsfw: false,
}

const preferencesReducer = ( state = initialState, action ) =>{
  switch(action.type) {
	case constants.INITIALIZE_PREFERENCE:
	  if(state[ action.payload.name ] === undefined) {
		return { ...state, [ action.payload.name ]: action.payload.defaultData };
	  }
	  return state;
	default:
	  return state;
  }
};

export default preferencesReducer;