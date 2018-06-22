import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button } from '@material-ui/core';
import ReactAnimationFrame from 'react-animation-frame';

import pageHOC from '../PageHOC';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import injectSaga from '../../Utils/injectSaga';
import injectReducer from '../../Utils/injectReducer';
import saga from './ListenSaga';
import reducer from './ListenReducer';
import { createSubmissionEvent } from '../../Global/SSE/sseActions';
import { selectSubmissions } from './ListenSelectors';
import * as listenActions from './ListenAction';
import Floatable from './Floatable';

import { Transition, TransitionGroup } from 'react-transition-group';

const EXPERIMENT_KEY = 'listen';

const submissionContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  overflow: 'visible',
};

// super lots of help from https://github.com/aholachek/react-animation-comparison/blob/master/src/react-transition-group-anime-example.js
// for how to use transitions properly
const ANIMATION_DONE_EVENT      = "animation::done";
const triggerAnimationDoneEvent = node =>{
  node.dispatchEvent( new Event( ANIMATION_DONE_EVENT ) );
};
const endListener               = ( node, done ) =>{
  node.addEventListener( ANIMATION_DONE_EVENT, done );
};

const floatCleanup = ( floater ) =>{
  const index = floaters.indexOf( floater );
  floaters.splice( index, 1 );
  setTimeout( () => triggerAnimationDoneEvent( floater.node ), 0 );
};

let floaters = [];

const animateIn = node =>{
  const floater = new Floatable( node, floatCleanup );
  floaters.push( floater );
};

const animateExit = node => setTimeout(() => triggerAnimationDoneEvent( node ), 0)

let delta       = null;
let last_update = 0;

class Listen extends Component {
  
  onAnimationFrame = ( time ) =>{
	delta       = time - last_update;
	last_update = time;
	for(const floater of floaters) {
	  floater.update( delta );
	}
  };
  
  render(){
	return (<div style={{ overflow: 'visible' }}>
	  <Button onClick={this.props.testSubmission}>Submission</Button>
	  <div style={submissionContainerStyle}>
		<TransitionGroup component={null}>
		  {this.props.submissions.map( ( item, index ) => (
			  <Transition addEndListener={endListener}
						  unmountOnExit
						  onEnter={animateIn}
						  onExit={animateExit}
						  onEntered={() => this.props.removeItem( item.id )}
						  key={item.id}>
				<div>{item.id} - {item.title}</div>
			  </Transition>
		  ) )}
		</TransitionGroup>
	  </div>
	</div>);
  }
}

const mapDispatchToProps = ( dispatch ) => ({
  testSubmission: () => dispatch( createSubmissionEvent() ),
  removeItem: ( id ) => dispatch( listenActions.removeItem( id ) )
});

const mapStateToProps = ( state ) => ({
  submissions: selectSubmissions( state )
});

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
	connect( mapStateToProps, mapDispatchToProps ),
	ReactAnimationFrame,
);

export default composed( Listen );