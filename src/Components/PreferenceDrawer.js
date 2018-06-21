import React, { Component } from 'react';
import {
  SwipeableDrawer,
  Switch,
  Button,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  Input,
} from '@material-ui/core';
import { createSelector } from 'reselect';
import isEqual from 'lodash/isEqual';

const ITEM_HEIGHT      = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps        = {
  PaperProps: {
	style: {
	  maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
	  width: 250,
	},
  },
};

class PreferenceDrawer extends Component {
  constructor( props ){
	super( props );
	this.state = {
	  availableEvents: [],
	  subreddits: []
	};
	
	this.arePrefsModified = createSelector(
		s => s,
		( s ) => isEqual( s, this.props.preferences )
	);
  }
  
  componentDidUpdate( prevProps ){
	if(prevProps.preferences !== this.props.preferences) {
	  this.setState( this.props.preferences );
	}
  }
  
  updatePrefValue = ( prefName, value ) =>{
	this.setState( { ...this.state, [ prefName ]: value } );
  };
  
  submitPrefs = () =>{
	this.props.onSavePrefs( this.state );
  };
  
  render(){
	const { preferences } = this.props;
	const passedProps     = { ...this.props };
	delete passedProps.preferences;
	delete passedProps.onSavePrefs;
	return (<SwipeableDrawer anchor="right" disableBackdropTransition {...passedProps}>
	  <div style={{ width: '300px' }}>
		<List subheader={<ListSubheader>Preferences</ListSubheader>}>
		  <ListItem>
			<ListItemText primary="Event Types"/>
			<Select
				multiple
				value={this.state.activeEvents}
				onChange={( e ) => this.updatePrefValue( 'activeEvents', e.target.value )}
				input={<Input id="select-multiple"/>}
				MenuProps={MenuProps}
			>
			  {this.state.availableEvents.map( events => (
				  <MenuItem
					  key={events}
					  value={events}
				  >
					{events}
				  </MenuItem>
			  ) )}
			</Select>
		  </ListItem>
		  <ListItem>
			<ListItemText primary="Subreddits (Not Impl)"/>
			<Select
				multiple
				disabled
				value={this.state.subreddits}
				onChange={( e ) => this.updatePrefValue( 'subreddits', e.target.value )}
				input={<Input id="select-multiple"/>}
				MenuProps={MenuProps}
			>
			  {this.state.subreddits.map( events => (
				  <MenuItem
					  key={events}
					  value={events}
				  >
					{events}
				  </MenuItem>
			  ) )}
			</Select>
		  </ListItem>
		  <ListItem>
			<ListItemText primary="NSFW"/>
			<ListItemSecondaryAction>
			  <Switch
				  disabled={preferences.nsfw === undefined}
				  checked={this.state.nsfw || preferences.nsfw || false}
				  onChange={( e ) => this.updatePrefValue( 'nsfw', e.target.checked )}
				  value="nsfw"
			  />
			</ListItemSecondaryAction>
		  </ListItem>
		  <ListItem>
			<ListItemText primary="Only Self Posts"/>
			<ListItemSecondaryAction>
			  <Switch
				  disabled={preferences.self === undefined}
				  checked={this.state.self || preferences.self || false}
				  onChange={( e ) => this.updatePrefValue( 'self', e.target.checked )}
				  value="self"
			  />
			</ListItemSecondaryAction>
		  </ListItem>
		  <ListItem>
			<ListItemText primary="Auto-Start"/>
			<ListItemSecondaryAction>
			  <Switch
				  disabled={preferences.autoStart === undefined}
				  checked={this.state.autoStart || preferences.autoStart || false}
				  onChange={( e ) => this.updatePrefValue( 'autoStart', e.target.checked )}
				  value="self"
			  />
			</ListItemSecondaryAction>
		  </ListItem>
		  <ListItem>
			<Button onClick={this.submitPrefs} fullWidth variant="contained" color="primary"
					disabled={this.arePrefsModified( this.state )}>Save</Button>
		  </ListItem>
		</List>
	  </div>
	</SwipeableDrawer>);
  }
}

PreferenceDrawer.defaultProps = {
  preferences: {},
  open: false
};

export default PreferenceDrawer;