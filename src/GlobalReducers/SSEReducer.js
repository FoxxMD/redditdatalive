import * as constants from '../Utils/SSE/constants';

const initialSseState = {
  starting: false,
  status: 2,
  options: {},
  error: null
};

const sseReducer = ( state = initialSseState, action ) =>{
  switch(action.type) {
	case constants.SSE_START:
	  return { ...state, options: action.payload, starting: true };
	case constants.SSE_CLOSE:
	  return { ...state, status: 2, starting: false };
	case constants.SSE_OPEN:
	  return { ...state, status: 1, starting: false };
	case constants.SSE_ERROR:
	  return { ...state, status: 2, error: action.payload, starting: false };
	case constants.SSE_STOP:
	  return { ...state, starting: false };
	default:
	  return state;
  }
};

export default sseReducer;