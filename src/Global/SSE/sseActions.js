import * as constants from './sseConstants';

export function startFeed( name ){
  return { type: constants.SSE_START, payload: { name } };
}

export function stopFeed(){
  return { type: constants.SSE_STOP };
}