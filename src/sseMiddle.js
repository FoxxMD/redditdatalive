const middleware = store => next => action =>{
  switch(action.type) {
	  // User request to connect
	case 'SSE:START':
	  // Configure the object
	  const redditSource = new EventSource( 'http://stream.pushshift.io/?type=comments' );
	  
	  // Attach the callbacks
	  redditSource.onopen    = () => store.dispatch( { type: 'SSE:OPEN' } );
	  redditSource.onerror   = ( e ) =>{
		console.log( e );
		store.dispatch( { type: 'SSE:CLOSE' } );
	  };
	  redditSource.addEventListener('rc', ( event ) =>{
		store.dispatch( { type: 'SSE:MESSAGE', payload: event } );
	  });
	  
	  break;
	
	case 'SSE:STOP':
	  redditSource.close();
	  break;
	
	default:
	  break;
  };
  
  return next( action );
};

export default middleware;