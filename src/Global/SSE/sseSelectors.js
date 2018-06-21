import { simpleSelect } from '../../Utils/selectorUtil';

const sseSelector       = simpleSelect( [ 'sse' ] );
const sseStatusSelector = simpleSelect( [ 'sse', 'status' ] );

export {
  sseSelector,
  sseStatusSelector,
};