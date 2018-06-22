import * as constants from './ListenConstants';

export function removeItem( id ){
  return { type: constants.LIST_ITEM_REMOVE, payload: id };
}

export function addItems( ids ){
  return { type: constants.ADD_SUBMISSIONS, payload: ids };
}