import * as sseConstants from '../../Global/SSE/sseConstants';
import * as listenConstants from './ListenConstants';

const initialState = {
  submissions: []
};

function reducer( state = initialState, action ){
  switch(action.type) {
	case sseConstants.SSE_MESSAGE_SUBMISSION:
	  const addedSubmissions = [ ...state.submissions ];
	  addedSubmissions.push( action.payload );
	  return { ...state, submissions: addedSubmissions };
	case listenConstants.LIST_ITEM_REMOVE:
	  const index              = state.submissions.findIndex( x => x.id === action.payload );
	  const removedSubmissions = [ ...state.submissions ];
	  removedSubmissions.splice( index, 1 );
	  return { ...state, submissions: removedSubmissions };
	default:
	  return state;
  }
}

export default reducer;