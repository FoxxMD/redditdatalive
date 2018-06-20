import * as constants from './sseConstants';

export function startFeed( options ){
  return { type: constants.SSE_START, payload: options };
}

export function stopFeed(){
  return { type: constants.SSE_STOP };
}