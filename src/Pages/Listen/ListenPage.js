import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button } from '@material-ui/core';

import pageHOC from '../PageHOC';
import * as sseActions from '../../Global/SSE/sseActions';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import { sseSelector } from '../../Global/SSE/sseSelectors';
import injectSaga from '../../Utils/injectSaga';
import injectReducer from '../../Utils/injectReducer';
import saga from './ListenSaga';
import reducer from './ListenReducer';

const EXPERIMENT_KEY = 'listen';

class Listen extends Component {
  
  toggleFeed = () =>{
	if(this.props.sse.status !== 2) {
	  this.props.stopFeed();
	}
	else {
	  this.props.startFeed();
	}
  };
  
  render(){
	return (<Button onClick={this.toggleFeed}>{this.props.sse.status === 2 ? 'Start It' : 'Stop It'}</Button>);
  }
}

const mapDispatchToProps = ( dispatch ) => ({
  startFeed: () => (dispatch( sseActions.startFeed( EXPERIMENT_KEY ) )),
  stopFeed: () => (dispatch( sseActions.stopFeed() )),
});

const mapStateToProps = ( state ) =>{
  return {
	sse: sseSelector( state ),
  };
};

const withReducer = injectReducer( { key: EXPERIMENT_KEY, reducer } );
const withSaga    = injectSaga( { key: EXPERIMENT_KEY, saga } );

const defaultPrefsData           = { ...defaultPrefs };
defaultPrefsData.availableEvents = [ 'submissions' ];
defaultPrefsData.activeEvents    = [ 'submissions' ];

const composed = compose(
	withReducer,
	withSaga,
	pageHOC( { key: EXPERIMENT_KEY, defaultPrefsData } ),
	connect( mapStateToProps, mapDispatchToProps )
);

export default composed( Listen );