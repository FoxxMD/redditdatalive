import { take, call, all, race, select, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import * as sseConstants from '../../Global/SSE/sseConstants';
import * as listenSelectors from './ListenSelectors';
import * as listenActions from './ListenAction';
import { getRandomInt } from '../../Utils/DataUtil';

function* listenForSseChange(){
  while(true) {
	yield take( sseConstants.SSE_START );
	
	yield race( {
	  listenForStop: take( sseConstants.SSE_STOP ),
	  takeSubs: call( takeSubmissions )
	} );
  }
}

export function* takeSubmissions(){
  
  const initialSub = yield take( sseConstants.SSE_MESSAGE_SUBMISSION );
  const startTime  = initialSub.payload.created_utc;
  let currentTime  = startTime;
  
  while(true) {
	console.log( `Processing Time: ${new Date( currentTime * 1000 ).toISOString()}` );
	const rawSubs = yield select( state => listenSelectors.selectRawSubmissions( state ) );
	
	const subsAtMoment = rawSubs.filter( x => x.created_utc === currentTime );
	if(subsAtMoment.length > 0) {
	  yield put( listenActions.addItems( subsAtMoment.map( x => x.id ) ) );
	}
	currentTime++;
	yield  call( delay, 1000 + getRandomInt( 1500 ) );
  }
}

export default function* rootSaga(){
  yield all( [
	call( listenForSseChange )
  ] );
}