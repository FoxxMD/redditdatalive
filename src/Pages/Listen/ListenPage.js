import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button } from '@material-ui/core';

import * as feedActions from '../../Utils/SSE/actions';
import injectSaga from '../../Utils/injectSaga';
import injectReducer from '../../Utils/injectReducer';
import saga from './ListenSaga';
import reducer from './ListenReducer';
import { sseSelector } from '../../Utils/SSE/selectors';

class ListenPage extends Component {
  
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
  startFeed: () => (dispatch( feedActions.startFeed() )),
  stopFeed: () => (dispatch( feedActions.stopFeed() ))
});

const mapStateToProps = ( state ) => ({
  sse: sseSelector( state )
});

const withReducer = injectReducer( { key: 'listen', reducer } );
const withSaga    = injectSaga( { key: 'listen', saga } );

const composed = compose(
	withReducer,
	withSaga,
	connect( mapStateToProps, mapDispatchToProps )
);

export default composed( ListenPage );