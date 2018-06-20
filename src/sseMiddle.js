import * as constants from './Utils/SSE/constants';
import { SSE_START } from './Utils/SSE/constants';
import { SSE_STOP } from './Utils/SSE/constants';
import { SSE_OPEN } from './Utils/SSE/constants';
import { SSE_ERROR } from './Utils/SSE/constants';
import { SSE_MESSAGE_COMMENT } from './Utils/SSE/constants';

const middleware = store => next => action =>{
  switch(action.type) {
	  // User request to connect
	case SSE_START:
	  // Configure the object
	  window.redditSource = new EventSource( 'http://stream.pushshift.io/?type=comments' );
	  
	  // Attach the callbacks
	  window.redditSource.onopen  = () => store.dispatch( { type: SSE_OPEN } );
	  window.redditSource.onerror = ( e ) =>{
		console.log( e );
		store.dispatch( { type: SSE_ERROR, payload: e } );
	  };
	  window.redditSource.addEventListener( 'rc', ( event ) =>{
		store.dispatch( { type: SSE_MESSAGE_COMMENT, payload: event } );
	  });
	  
	  break;
	
	case SSE_STOP:
	  window.redditSource.close();
	  store.dispatch( { type: constants.SSE_CLOSE } );
	  break;
	
	default:
	  break;
  };
  
  return next( action );
};

export default middleware;