import * as sseConstants from '../../Global/SSE/sseConstants';
import * as listenConstants from './ListenConstants';
import { getRandomInt } from '../../Utils/DataUtil';

const initialState = {
  activeSubmissions: [],
  rawSubmissions: [],
};

function reducer( state = initialState, action ){
  switch(action.type) {
	case sseConstants.SSE_MESSAGE_SUBMISSION:
	  const addedSubmissions = [ ...state.rawSubmissions ];
	  addedSubmissions.push( action.payload );
	  return { ...state, rawSubmissions: addedSubmissions };
		// addedSubmissions.unshift( action.payload );
		// // only keep last 100
		// return {...state, rawSubmissions: addedSubmissions.slice(0, 100)};
	case listenConstants.LIST_ITEM_REMOVE:
	  const index              = state.activeSubmissions.findIndex( x => x.id === action.payload );
	  const removedSubmissions = [ ...state.activeSubmissions ];
	  removedSubmissions.splice( index, 1 );
	  return { ...state, activeSubmissions: removedSubmissions };
	case sseConstants.SSE_START:
	case sseConstants.SSE_STOP:
	  return { ...state, rawSubmissions: [] };
	case listenConstants.ADD_SUBMISSIONS:
	
	  let newSubmissions   = state.rawSubmissions.filter( x => action.payload.includes( x.id ) );
	  const maxSubmissions = Math.max( 1, getRandomInt( 3 ) );
	
	  if(newSubmissions.length > maxSubmissions) {
		const candidates = [];
		const picked     = [];
		while(candidates.length < maxSubmissions) {
		  const pick = getRandomInt( newSubmissions.length - 1 );
		  if(picked.includes( pick )) {
			continue;
		  }
		  picked.push( pick );
		  candidates.push( newSubmissions[ pick ] );
		}
		newSubmissions = candidates;
	  }
	
	  const rawWithoutNewSubs = state.rawSubmissions.filter( x => !action.payload.includes( x.id ) );
	
	  return {
		...state,
		activeSubmissions: state.activeSubmissions.concat( newSubmissions ),
		rawSubmissions: rawWithoutNewSubs
	  };
	default:
	  return state;
  }
}

export default reducer;
