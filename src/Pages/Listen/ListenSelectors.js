import { simpleSelect } from '../../Utils/selectorUtil';

const selectSubmissions    = simpleSelect( [ 'listen', 'activeSubmissions' ] );
const selectRawSubmissions = simpleSelect( [ 'listen', 'rawSubmissions' ] );

export { selectSubmissions, selectRawSubmissions };