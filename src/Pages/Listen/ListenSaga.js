import { take, call, all } from 'redux-saga/effects';

export function* takeTest(){
  yield take( 'SSE:START' );
  console.log( 'saga good' );
}

export default function* rootSaga(){
  yield all( [
	call( takeTest )
  ] );
}