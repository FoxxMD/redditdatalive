import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import pageHOC from '../PageHOC';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import injectSaga from '../../Utils/injectSaga';
import injectReducer from '../../Utils/injectReducer';
import saga from './ListenSaga';
import reducer from './ListenReducer';

const EXPERIMENT_KEY = 'listen';

class Listen extends Component {
  
  render(){
	return 'Listen Page';
  }
}

const mapDispatchToProps = ( dispatch ) => ({});

const mapStateToProps = ( state ) =>({});

const withReducer = injectReducer( { key: EXPERIMENT_KEY, reducer } );
const withSaga    = injectSaga( { key: EXPERIMENT_KEY, saga } );

const defaultPrefsData           = { ...defaultPrefs };
defaultPrefsData.availableEvents = [ 'submissions' ];
defaultPrefsData.activeEvents    = [ 'submissions' ];
defaultPrefsData.autoStart       = false;

const composed = compose(
	withReducer,
	withSaga,
	pageHOC( { key: EXPERIMENT_KEY, defaultPrefsData } ),
	connect( mapStateToProps, mapDispatchToProps )
);

export default composed( Listen );