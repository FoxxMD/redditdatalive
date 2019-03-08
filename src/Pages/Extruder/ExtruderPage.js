import React, { Component } from 'react';
import ThreeRender from './ThreeRenderer';
import { compose } from 'recompose';
import { CircularProgress } from '@material-ui/core';
import pageHOC from '../PageHOC';
import { connect } from 'react-redux';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import { selectAppBarHeight } from '../../Global/Preferences/preferencesSelector';

const EXPERIMENT_KEY = 'extruder';

// help from https://itnext.io/how-to-use-plain-three-js-in-your-react-apps-417a79d926e0
class ThreeContainer extends Component {
  constructor( props ){
	super( props );
	this.state    = {
	  loading: true
	};
	this.renderer = null;
  }
  
  onReady = () => {
	console.log( 'ready!' );
	this.setState( {
	  loading: false
	} );
  };
  
  componentDidMount(){
	this.renderer = new ThreeRender( this.threeRootElement, this.onReady );
  }
  
  render(){
	return (
		<div style={{
		  overflow: 'hidden',
		  position: 'absolute',
		  width: '100%',
		  height: window.innerHeight - (this.props.appBarHeight !== null ? this.props.appBarHeight : 0),
		  backgroundColor: 'black'
		}}>
		  {this.state.loading ? (
		  	<div style={{ height: '100%', position: 'relative' }}>
			<CircularProgress style={{ position: 'absolute', top: '50%', right: '50%', width: '100px', height: '100px' }} color="secondary"/></div>
		  ) : null}
		  <div style={{ height: '100%', position: 'relative' }} ref={element => this.threeRootElement = element}/>
		</div>
	);
  }
}

const defaultPrefsData = { ...defaultPrefs, autoStart: false };

const mapStateToProps = ( state ) => ({
  appBarHeight: selectAppBarHeight( state ),
});

const composed = compose(
	pageHOC( { key: EXPERIMENT_KEY, defaultPrefsData } ),
	connect( mapStateToProps, null )
);

export default composed( ThreeContainer );
