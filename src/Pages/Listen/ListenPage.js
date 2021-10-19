import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { IconButton } from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { withStyles } from '@material-ui/core/styles';
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
import { BrowserDetect } from '../../Utils/BrowserDetect';
import { findAncestor } from '../../Utils/DOMUtil';

// thanks https://leaverou.github.io/bubbly/
import './Bubble.css';

const EXPERIMENT_KEY = 'listen';


BrowserDetect.init();

const submissionContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  overflow: 'visible',
};

const iconButtonStyles = theme => ({
  root: {
	position: 'absolute',
	right: 0,
	top: 0,
	width: '38px',
	height: '38px'
  }
});
const StyledIconButton = withStyles( iconButtonStyles )( IconButton );

const favoriteIconButtonStyles = theme => ({
  root: {
	fontSize: '18px'
  }
});
const StyledFavoriteIcon       = withStyles( favoriteIconButtonStyles )( FavoriteIcon );


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
  const floater = new Floatable( node, floatCleanup, BrowserDetect.browser );
  floaters.push( floater );
};

const animateExit = node => setTimeout(() => triggerAnimationDoneEvent( node ), 0)

let delta       = null;
let last_update = 0;

class Listen extends Component {
  
  constructor( props ){
	super( props );
	this.state = {
	  pinned: []
	};
  }
  
  onAnimationFrame = ( time ) =>{
	delta       = time - last_update;
	last_update = time;
	for(const floater of floaters) {
	  floater.update( delta );
	}
  };
  
  // touch events
  
  onTouchStart = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.stopAnimation();
	foundNode.enableDragging( e.targetTouches[ 0 ].pageX, e.targetTouches[ 0 ].pageY );
  };
  
  onTouchEnd = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.disableDragging();
	foundNode.startAnimation();
  };
  
  // mouse events
  
  onMouseEnter = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.stopAnimation();
  };
  
  onMouseLeave = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.disableDragging();
	foundNode.startAnimation();
  };
  
  onMouseDown = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.enableDragging( e.pageX, e.pageY );
  };
  
  onMouseUp = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	foundNode.disableDragging();
  };
  
  toggleItemPin = ( e, id ) =>{
	const containerElement = findAncestor( e.currentTarget, 'BubbleContainer' );
	const foundNode        = floaters.find( x => x.node === containerElement );
	if(foundNode.pinned) {
	  foundNode.unpin();
	  this.setState( {
		pinned: this.state.pinned.filter( x => x !== id )
	  } );
	}
	else {
	  foundNode.pin();
	  this.setState( {
		pinned: this.state.pinned.concat( [ id ] )
	  } );
	}
  };
  
  onEventMove = ( e ) =>{
	const foundNode = floaters.find( x => x.node === e.currentTarget );
	if(foundNode.draggable) {
	  if(e.targetTouches !== undefined) {
		foundNode.moveTo( e.targetTouches[ 0 ].pageX, e.targetTouches[ 0 ].pageY );
	  }
	  else {
		foundNode.moveTo( e.pageX, e.pageY );
	  }
	}
  };
  
  render(){
	return (<div style={{
	  overflow: 'hidden',
	  position: 'absolute',
	  width: '100%',
	  height: window.innerHeight - (this.props.appBarHeight !== null ? this.props.appBarHeight : 0)
	}}>
	  <div style={{height: '100%', position: 'relative'}}>
	  {/*<Button style={{ zIndex: '999' }} onClick={this.props.testSubmission}>Submission</Button>*/}
	  <div style={submissionContainerStyle}>
		<TransitionGroup component={null}>
		  {this.props.submissions.map( ( item, index ) =>{
			const displayTitle = item.title.length < 200 ? item.title : `${item.title.substr( 0, 200 )}...`;
			return (
			  <Transition addEndListener={endListener}
						  unmountOnExit
						  onEnter={animateIn}
						  onExit={animateExit}
						  onEntered={() => this.props.removeItem( item.id )}
						  key={item.id}>
				<div className={`BubbleContainer ${this.state.pinned.includes( item.id ) ? 'Pinned' : ''}`}
					 onMouseEnter={this.onMouseEnter}
					 onTouchStart={this.onTouchStart}
					 onTouchEnd={this.onTouchEnd}
					 onTouchMove={this.onEventMove}
					 onMouseLeave={this.onMouseLeave}
					 onMouseDown={this.onMouseDown}
					 onMouseUp={this.onMouseUp}
					 onMouseMove={this.onEventMove}>
				  <div className="Bubble">
					<StyledIconButton className="PinIcon" onClick={( e ) => this.toggleItemPin( e, item.id )} color="inherit">
					  <StyledFavoriteIcon/>
					</StyledIconButton>
					<h3 alt={item.title.length}><a className="titleLink" target="_blank"
												   href={`https://reddit.com${item.permalink}`}>{displayTitle}</a></h3>
					<p>
					  By <a href={`https://reddit.com/u/${item.author.name}`} target="_blank">/u/{item.author.name}</a> on
					  <a style={{marginLeft: '5px'}} href={`https://reddit.com/r/${item.subreddit.display_name}`} target="_blank">/r/{item.subreddit.display_name}</a>
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
defaultPrefsData.subBackfill     = 500;
defaultPrefsData.nsfw            = false;

const composed = compose(
	withReducer,
	withSaga,
	pageHOC( { key: EXPERIMENT_KEY, defaultPrefsData } ),
	connect( mapStateToProps, mapDispatchToProps ),
	ReactAnimationFrame,
);

export default composed( Listen );
