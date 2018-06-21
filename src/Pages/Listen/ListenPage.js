import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button } from '@material-ui/core';
import anime from 'animejs';

import pageHOC from '../PageHOC';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import injectSaga from '../../Utils/injectSaga';
import injectReducer from '../../Utils/injectReducer';
import saga from './ListenSaga';
import reducer from './ListenReducer';
import { createSubmissionEvent } from '../../Global/SSE/sseActions';
import { selectSubmissions } from './ListenSelectors';
import * as listenActions from './ListenAction';

import { Transition, TransitionGroup } from 'react-transition-group';

const EXPERIMENT_KEY = 'listen';

const ANIMATION_DONE_EVENT      = "animation::done";
const triggerAnimationDoneEvent = node =>{
  node.dispatchEvent( new Event( ANIMATION_DONE_EVENT ) );
};
const endListener               = ( node, done ) =>{
  node.addEventListener( ANIMATION_DONE_EVENT, done );
};

// super lots of help from https://github.com/aholachek/react-animation-comparison/blob/master/src/react-transition-group-anime-example.js
const getOpacity = animatingIn => ({
  value: animatingIn ? [ 0, 1 ] : [ 1, 0 ],
  easing: "linear",
  duration: 300
});

const animateIn = node =>
	anime( {
	  targets: node,
	  opacity: getOpacity( true ),
	  translateY: [ 50, 0 ],
	  complete: () => triggerAnimationDoneEvent( node ),
	  duration: 1500
	} );

const animateExit = node => setTimeout(() => triggerAnimationDoneEvent( node ), 0)

class Listen extends Component {
  
  render(){
	return (<div>
	  <Button onClick={this.props.testSubmission}>Submission</Button>
	  <ul>
		<TransitionGroup component={null}>
		  {this.props.submissions.map( ( item, index ) => (
			  <Transition addEndListener={endListener}
						  unmountOnExit
						  onEnter={animateIn}
						  onExit={animateExit}
						  onEntered={() => this.props.removeItem( item.id )}
						  key={item.id}>
				<li>{item.id} - {item.title}</li>
			  </Transition>
		  ) )}
		</TransitionGroup>
	  </ul>
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
	connect( mapStateToProps, mapDispatchToProps )
);

export default composed( Listen );