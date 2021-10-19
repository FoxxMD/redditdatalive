import * as constants from './sseConstants';
import { selectActivePref, selectPreferenceByName } from '../../Global/Preferences/preferencesSelector';
import URLSearchParams from 'url-search-params'; // polyfill
import get from 'lodash/get';
import snoostorm, {SubmissionStream} from 'snoostorm';
import Snoowrap from "snoowrap";

const BASE_URL = 'http://stream.pushshift.io/';

var navigator_info = window.navigator;
var screen_info = window.screen;
var uid = navigator_info.mimeTypes.length;
uid += navigator_info.userAgent.replace(/\D+/g, '');
uid += navigator_info.plugins.length;
uid += screen_info.height || '';
uid += screen_info.width || '';
uid += screen_info.pixelDepth || '';

const middleware = store => next => action =>{
	let submissionsStreams;

  switch(action.type) {
	case constants.SSE_START:

		Snoowrap.fromApplicationOnlyAuth({
			userAgent: 'datalive',
			clientId: process.env.CLIENT_ID,
			deviceId: uid.slice(0, 29),
		}).then((client) => {
			client.config({proxies: false});
			submissionsStreams = new SubmissionStream(client, {
				subreddit: "popular",
				limit: 10,
				pollTime: 3000,
			});
			store.dispatch( { type: constants.SSE_OPEN } );

			submissionsStreams.on("item", (item) => {
				store.dispatch( { type: constants.SSE_MESSAGE_SUBMISSION, payload: item  } );
			});
		});
	  
	  // close if the source is already open so we can restart with new options
	  // if(window.redditSource !== undefined && window.redditSource.readyState !== 2) {
		// window.redditSource.close();
	  // }
	  //
	  // const prefsToUse = action.payload.name === undefined ? selectActivePref( store.getState() ) : selectPreferenceByName(action.payload.name)(store.getState());
	  // let qs           = buildQSFromPreferences( prefsToUse );
	  // if(qs.length > 1) {
		// qs = `?${qs}`;
	  // }
	  // const url = BASE_URL + qs;
	  //
	  // // Configure the object
	  // window.redditSource = new EventSource( url );
	  //
	  // window.redditSource.onopen  = () => store.dispatch( { type: constants.SSE_OPEN } );
	  // window.redditSource.onerror = ( e ) =>{
		// console.log( e );
		// store.dispatch( { type: constants.SSE_ERROR, payload: e } );
	  // };
	  // window.redditSource.addEventListener( 'rc', ( event ) =>{
		// store.dispatch( { type: constants.SSE_MESSAGE_COMMENT, payload: JSON.parse(event.data) } );
	  // } );
	  // window.redditSource.addEventListener( 'rs', ( event ) =>{
		// store.dispatch( { type: constants.SSE_MESSAGE_SUBMISSION, payload: JSON.parse( event.data ) } );
	  // } );
	  // window.redditSource.addEventListener( 'rr', ( event ) =>{
		// store.dispatch( { type: constants.SSE_MESSAGE_SUBREDDIT, payload: JSON.parse(event.data) } );
	  // } );
	  // window.redditSource.addEventListener( 'keepalive', ( event ) =>{
		// store.dispatch( { type: constants.SSE_MESSAGE_KEEPALIVE, payload: JSON.parse(event.data) } );
	  // } );
	  
	  break;
	
	case constants.SSE_STOP:
		if(submissionsStreams !== undefined) {
			submissionsStreams.end();
		}
	  // if(window.redditSource !== undefined) {
		// window.redditSource.close();
	  // }

	  store.dispatch( { type: constants.SSE_CLOSE } );
	  break;
	
	default:
	  break;
  }
  
  return next( action );
};

function buildQSFromPreferences( prefs ){
  const params = new URLSearchParams();
  
  const activeEvents = get( prefs, [ 'activeEvents' ], [] );
  if(activeEvents.length > 0) {
	params.append( 'type', activeEvents.join( ',' ) );
  }
  const subBackfill = get( prefs, [ 'subBackfill' ] );
  if(subBackfill !== undefined && subBackfill !== null && subBackfill > 0) {
	params.append( 'submission_backfill', subBackfill );
  }
  
  const self = get( prefs, [ 'self' ], null );
  if(self !== null) {
	params.append( 'is_self', self );
  }
  
  const nsfw = get( prefs, [ 'nsfw' ], null );
  if(nsfw !== null) {
	params.append( 'over_18', nsfw );
  }
  
  const subreddits = get( prefs, [ 'subreddits' ], [] );
  if(subreddits.length > 0) {
	params.append( 'subreddit', subreddits.join( ',' ) );
  }
  
  return params.toString();
}

export default middleware;
