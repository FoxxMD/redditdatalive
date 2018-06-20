import { simpleSelect } from '../../Utils/selectorUtil';

const selectPreferenceByName = ( name ) => simpleSelect( [ 'preferences', name ] );

export {
  selectPreferenceByName
};