import * as constants from './ListenConstants';

export function removeItem( id ){
  return { type: constants.LIST_ITEM_REMOVE, payload: id };
}