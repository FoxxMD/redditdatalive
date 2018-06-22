import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button } from '@material-ui/core';
import { Transition, TransitionGroup } from 'react-transition-group';
import ReactAnimationFrame from 'react-animation-frame';

import pageHOC from '../PageHOC';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import { selectAppBarHeight } from '../../Global/Preferences/preferencesSelector';
import injectSaga from '../../Utils/injectSaga';
import injectReducer from '../../Utils/injectReducer';
import saga from './ListenSaga';
import reducer from './ListenReducer';
import { createSubmissionEvent } from '../../Global/SSE/sseActions';
import { selectSubmissions } from './ListenSelectors';
import * as listenActions from './ListenAction';
import Floatable from './Floatable';

// thanks https://leaverou.github.io/bubbly/
import './Bubble.css';


const EXPERIMENT_KEY = 'listen';

const submissionContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  overflow: 'visible',
};

const submissionStyle = {
  width: '200px',
  position: 'absolute',
  overflowWrap: 'normal'
}

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
  
  onMouseEnter = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.stopAnimation();
  };
  
  onMouseLeave = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.startAnimation();
  };
  
  render(){
	return (<div style={{
	  overflow: 'hidden',
	  position: 'absolute',
	  width: '100%',
	  height: window.innerHeight - (this.props.appBarHeight !== null ? this.props.appBarHeight : 0)
	}}>
	  <div style={{height: '100%', position: 'relative'}}>
	  <Button style={{ zIndex: '999' }} onClick={this.props.testSubmission}>Submission</Button>
	  <div style={submissionContainerStyle}>
		<TransitionGroup component={null}>
		  {this.props.submissions.map( ( item, index ) =>{
			const displayTitle = item.title.length < 200 ? item.title : `${item.title.length.substr( 0, 200 )}...`;
			return (
			  <Transition addEndListener={endListener}
						  unmountOnExit
						  onEnter={animateIn}
						  onExit={animateExit}
						  onEntered={() => this.props.removeItem( item.id )}
						  key={item.id}>
				<div style={submissionStyle}
					 onMouseEnter={this.onMouseEnter}
					 onMouseLeave={this.onMouseLeave}>
				  <div className="Bubble">
					<h3 alt={item.title.length}><a className="titleLink" target="_blank" href={item.url}>{displayTitle}</a></h3>
					<p>
					  By <a href={`https://reddit.com/u/${item.author}`} target="_blank">/u/{item.author}</a> on
					  <a href={`https://reddit.com/r/${item.subreddit}`} target="_blank">/r/{item.subreddit}</a>
					</p>
				  </div>
				</div>
			  </Transition>
			);
		  } )}
		</TransitionGroup>
	  </div>
	  </div>
	</div>);
  }
}

const mapDispatchToProps = ( dispatch ) => ({
  testSubmission: () => dispatch( createSubmissionEvent() ),
  removeItem: ( id ) => dispatch( listenActions.removeItem( id ) )
});

const mapStateToProps = ( state ) => ({
  submissions: selectSubmissions( state ),
  appBarHeight: selectAppBarHeight( state ),
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