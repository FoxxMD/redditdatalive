import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import hoistNonReactStatic from 'hoist-non-react-statics';

import * as sseActions from '../Global/SSE/sseActions';
import * as prefActions from '../Global/Preferences/preferencesActions';
import { defaultPrefs } from '../Global/Preferences/preferencesReducer';
import { selectPreferenceByName } from '../Global/Preferences/preferencesSelector';

function connectedPageHOC( { key, defaultPrefsData = defaultPrefs } ){
  
  return function connectedPage( WrappedComponent ){
	class Page extends Component {
	  
	  constructor( props ){
		super( props );
		props.setActivePref();
		this.init( props );
	  }
	  
	  init = ( props ) =>{
		let usablePrefs = null;
		if(props.preferences == undefined) {
		  props.setPrefs( defaultPrefsData );
		  usablePrefs = defaultPrefsData;
		}
		else {
		  usablePrefs = props.preferences;
		}
		if(usablePrefs.autoStart === true) {
		  props.init();
		}
	  };
	  
	  render(){
		return <WrappedComponent preference={this.props.preferences}/>;
	  }
	}
	
	function getDisplayName( Component ){
	  return Component.displayName || Component.name || 'Component';
	}
	
	Page.displayName = `ConnectPreferences(${getDisplayName( WrappedComponent )})`;
	
	const mapDispatchToProps = ( dispatch ) => ({
	  setPrefs: ( data ) => (dispatch( prefActions.setPreferences( key, data ) )),
	  setActivePref: () => dispatch( prefActions.setActivePref( key ) ),
	  init: () => (dispatch( sseActions.startFeed( key ) ))
	});
	
	const mapStateToProps = ( state ) =>{
	  const listenPreferences = selectPreferenceByName( key );
	  return {
		preferences: listenPreferences( state )
	  };
	};
	
	const composed = compose(
		connect( mapStateToProps, mapDispatchToProps )
	)( Page );
	
	return hoistNonReactStatic( composed, WrappedComponent );
  };
}

export default connectedPageHOC;