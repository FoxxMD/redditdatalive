import * as constants from './sseConstants';
import { selectActivePref } from '../../Global/Preferences/preferencesSelector';
import URLSearchParams from 'url-search-params'; // polyfill
import get from 'lodash/get';

const BASE_URL = 'http://stream.pushshift.io/';

const middleware = store => next => action =>{
  switch(action.type) {
	  // User request to connect
	case constants.SSE_START:
	  
	  if(window.redditSource !== undefined && window.redditSource.readyState !== 2) {
		window.redditSource.close();
	  }
	  
	  const activePref = selectActivePref( store.getState() );
	  let qs           = buildQSFromPreferences( activePref );
	  if(qs.length > 1) {
		qs = `?${qs}`;
	  }
	  const url = BASE_URL + qs;
	  
	  // Configure the object
	  window.redditSource = new EventSource( url );
	  
	  // Attach the callbacks
	  window.redditSource.onopen  = () => store.dispatch( { type: constants.SSE_OPEN } );
	  window.redditSource.onerror = ( e ) =>{
		console.log( e );
		store.dispatch( { type: constants.SSE_ERROR, payload: e } );
	  };
	  window.redditSource.addEventListener( 'rc', ( event ) =>{
		store.dispatch( { type: constants.SSE_MESSAGE_COMMENT, payload: event } );
	  });
	  
	  break;
	
	case constants.SSE_STOP:
	  window.redditSource.close();
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
  params.append( 'is_self', get( prefs, [ 'filterBySelf' ], false ) );
  params.append( 'over_18', get( prefs, [ 'nsfw' ], false ) );
  if(get( prefs, [ 'filterBySubreddits' ], [] ).length > 0) {
	params.append( 'subreddit', prefs.filterBySubreddits.join( ',' ) );
  }
  
  return params.toString();
}

export default middleware;