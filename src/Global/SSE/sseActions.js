import * as constants from './sseConstants';

export function startFeed( name = undefined ){
  return { type: constants.SSE_START, payload: { name } };
}

export function stopFeed(){
  return { type: constants.SSE_STOP };
}

// for debugging
export function createSubmissionEvent( data = {} ){
  return {
	type: constants.SSE_MESSAGE_SUBMISSION,
	payload: { id: Date.now().toString() + 'id', created: Date.now(), permalink: '/r/all/new', title: 'Test', url: 'https://reddit.com/all/new', ...data }
  };
}