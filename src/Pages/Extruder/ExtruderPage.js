import React, { Component } from 'react';
import ThreeRender from './ThreeRenderer';
import { compose } from 'recompose';
import { CircularProgress, Paper, TextField, Button } from '@material-ui/core';
import pageHOC from '../PageHOC';
import { connect } from 'react-redux';
import { defaultPrefs } from '../../Global/Preferences/preferencesReducer';
import { selectAppBarHeight } from '../../Global/Preferences/preferencesSelector';
import StatefulSlider from './StatefulSlider';

const EX_H = 'h';
const EX_S = 's';
const EX_V = 'v';

const EXPERIMENT_KEY         = 'extruder';
const readyStyle             = {
  position: 'absolute',
  top: '50%',
  right: '50%',
  width: '100px',
  height: '100px'
};
const settingsContainerStyle = {
  position: 'absolute',
  bottom: '10%',
  right: '10%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: 'white',
  zIndex: '9999',
  padding: '15px'
};

// help from https://itnext.io/how-to-use-plain-three-js-in-your-react-apps-417a79d926e0
class ThreeContainer extends Component {
  constructor( props ){
	super( props );
	this.state    = {
	  loading: true,
	  url: 'https://i.imgur.com/3aDc8Iy.jpg'
	};
	this.renderer = null;
  }
  
  componentDidMount(){
	this.renderer = new ThreeRender( {
	  containerElement: this.threeRootElement,
	  url: this.state.url,
	  onReady: this.onReady,
	  initialExtrusion: {
		h: 0.05,
		s: 0,
		v: 0,
	  }
	} );
	this.setState({
	  url: null
	});
  }
  
  onReady = () => {
	console.log( 'ready!' );
	this.setState( {
	  loading: false
	} );
  };
  
  setExtrusion = ( type, val ) => {
	console.log( `Type: ${type}, Value: ${val}` );
	this.renderer.setExtrusionTween( { [ type ]: val } );
  };
  
  setUrl = () => {
    const url = this.state.url;
	this.setState({
	  url: null,
	  ready: false,
	});
	this.renderer.setImage(url);
  };
  
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
				<CircularProgress style={readyStyle}
								  color="secondary"/></div>
		  ) : null}
		  <Paper style={settingsContainerStyle}>
			<h3>Settings</h3>
			<TextField
				onChange={e => this.setState( { url: e.target.value } )}
				id="filled-search"
				label="URL"
				type="search"
				margin="normal"
				variant="filled"
				style={{ margin: '0 15px 0 0' }}
			/><Button onClick={this.setUrl} disabled variant="contained" color="secondary">Use</Button>
			<StatefulSlider max={5} initialValue={0.05} title="Hue" step={0.05}
							onChange={( val ) => this.setExtrusion( EX_H, val )}/>
			<StatefulSlider max={5} initialValue={0} title="Saturation" step={0.05}
							onChange={( val ) => this.setExtrusion( EX_S, val )}/>
			<StatefulSlider max={5} initialValue={0} title="Brightness" step={0.05}
							onChange={( val ) => this.setExtrusion( EX_V, val )}/>
		  </Paper>
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
