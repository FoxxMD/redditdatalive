import * as constants from './sseConstants';

const middleware = store => next => action =>{
  switch(action.type) {
	  // User request to connect
	case constants.SSE_START:
	  // Configure the object
	  window.redditSource = new EventSource( 'http://stream.pushshift.io/?type=comments' );
	  
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

export default middleware;