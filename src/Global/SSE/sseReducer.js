import * as constants from './sseConstants';

const initialSseState = {
  status: 2,
  options: {},
  error: null
};

const sseReducer = ( state = initialSseState, action ) =>{
  switch(action.type) {
	case constants.SSE_START:
	  return { ...state, options: action.payload, status: constants.SSE_STATUS_CONNECTING };
	case constants.SSE_CLOSE:
	  return { ...state, status: constants.SSE_STATUS_CLOSED };
	case constants.SSE_OPEN:
	  return { ...state, status: constants.SSE_STATUS_OPEN };
	case constants.SSE_ERROR:
	  return { ...state, status: constants.SSE_STATUS_CLOSED, error: action.payload };
	case constants.SSE_STOP:
	  return { ...state };
	default:
	  return state;
  }
};

export default sseReducer;