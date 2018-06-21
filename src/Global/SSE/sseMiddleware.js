import * as constants from './sseConstants';
import { selectActivePref, selectPreferenceByName } from '../../Global/Preferences/preferencesSelector';
import URLSearchParams from 'url-search-params'; // polyfill
import get from 'lodash/get';

const BASE_URL = 'http://stream.pushshift.io/';

const middleware = store => next => action =>{
  switch(action.type) {
	case constants.SSE_START:
	  
	  // close if the source is already open so we can restart with new options
	  if(window.redditSource !== undefined && window.redditSource.readyState !== 2) {
		window.redditSource.close();
	  }
	  
	  const prefsToUse = action.payload.name === undefined ? selectActivePref( store.getState() ) : selectPreferenceByName(action.payload.name)(store.getState());
	  let qs           = buildQSFromPreferences( prefsToUse );
	  if(qs.length > 1) {
		qs = `?${qs}`;
	  }
	  const url = BASE_URL + qs;
	  
	  // Configure the object
	  window.redditSource = new EventSource( url );
	  
	  window.redditSource.onopen  = () => store.dispatch( { type: constants.SSE_OPEN } );
	  window.redditSource.onerror = ( e ) =>{
		console.log( e );
		store.dispatch( { type: constants.SSE_ERROR, payload: e } );
	  };
	  window.redditSource.addEventListener( 'rc', ( event ) =>{
		store.dispatch( { type: constants.SSE_MESSAGE_COMMENT, payload: event } );
	  } );
	  window.redditSource.addEventListener( 'rs', ( event ) =>{
		store.dispatch( { type: constants.SSE_MESSAGE_SUBMISSION, payload: event } );
	  } );
	  window.redditSource.addEventListener( 'rr', ( event ) =>{
		store.dispatch( { type: constants.SSE_MESSAGE_SUBREDDIT, payload: event } );
	  } );
	  window.redditSource.addEventListener( 'keepalive', ( event ) =>{
		store.dispatch( { type: constants.SSE_MESSAGE_KEEPALIVE, payload: event } );
	  } );
	  
	  break;
	
	case constants.SSE_STOP:
	  
	  if(window.redditSource !== undefined) {
		window.redditSource.close();
	  }

	  store.dispatch( { type: constants.SSE_CLOSE } );
	  break;
	
	default:
	  break;
  };
  
  return next( action );
};

function buildQSFromPreferences( prefs ){
  const params = new URLSearchParams();
  if(get( prefs, [ 'activeEvents' ], [] ).length > 0) {
	params.append( 'type', prefs.activeEvents.join( ',' ) );
  }
  params.append( 'is_self', get( prefs, [ 'self' ], false ) );
  params.append( 'over_18', get( prefs, [ 'nsfw' ], false ) );
  if(get( prefs, [ 'subreddits' ], [] ).length > 0) {
	params.append( 'subreddit', prefs.filterBySubreddits.join( ',' ) );
  }
  
  return params.toString();
}

export default middleware;