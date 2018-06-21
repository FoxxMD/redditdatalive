import * as constants from './preferencesConstants';

const initialState = {
  activePref: null
};

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
	case constants.SET_PREFERENCE:
	  if(state[ action.payload.name ] !== undefined) {
		return { ...state, [ action.payload.name ]: action.payload.data };
	  }
	  else if(state.activePref !== null) {
		return { ...state, [ state.activePref ]: action.payload.data };
	  }
	  throw new Error( 'No preference name given and no active pref, cannot set preference data' );
	case constants.SET_ACTIVE_PREFERENCE:
	  return { ...state, activePref: action.payload };
	default:
	  return state;
  }
};

export default preferencesReducer;