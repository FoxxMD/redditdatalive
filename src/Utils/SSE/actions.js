import { SSE_START, SSE_STOP } from './constants';

export function startFeed( options ){
  return { type: SSE_START, payload: options };
}

export function stopFeed(){
  return { type: SSE_STOP };
}