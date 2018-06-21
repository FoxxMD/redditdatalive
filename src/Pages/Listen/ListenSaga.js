import { take, call, all } from 'redux-saga/effects';

import * as prefConstants from '../../Global/Preferences/preferencesConstants';

export function* takeInit(){
  yield take( prefConstants.SET_PREFERENCE );
  console.log( 'saga good' );
}

export default function* rootSaga(){
  yield all( [
	call( takeInit )
  ] );
}