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
import get from 'lodash/get';

import { stringToValue, valueToString } from '../Utils/DataUtil';

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
	  subreddits: [],
	  ...props.preferences,
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
  
  revertPrefs = () =>{
	this.setState( this.props.preferences );
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
				value={get( this.state, [ 'activeEvents' ], [] )}
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
				value={get( this.state, [ 'subreddits' ], [] )}
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
			<ListItemText primary="Show NSFW?"/>
			<ListItemSecondaryAction>
			  <Select
				  value={valueToString( get( this.state, [ 'nsfw' ] ) )}
				  onChange={( e ) =>{
					this.updatePrefValue( 'nsfw', stringToValue( e.target.value ) );
				  }}
				  input={<Input/>}
				  MenuProps={MenuProps}
			  >
				<MenuItem key="off" value="null">Whatever</MenuItem>
				<MenuItem key="yes" value="true">Yes</MenuItem>
				<MenuItem key="no" value="false">No</MenuItem>
			  </Select>
			</ListItemSecondaryAction>
		  </ListItem>
		  <ListItem>
			<ListItemText primary="Only Self Posts?"/>
			<ListItemSecondaryAction>
			  <Select
				  value={valueToString( get( this.state, [ 'self' ] ) )}
				  onChange={( e ) =>{
					this.updatePrefValue( 'self', stringToValue( e.target.value ) );
				  }}
				  input={<Input/>}
				  MenuProps={MenuProps}
			  >
				<MenuItem key="off" value="null">Whatever</MenuItem>
				<MenuItem key="yes" value="true">Yes</MenuItem>
				<MenuItem key="no" value="false">No</MenuItem>
			  </Select>
			</ListItemSecondaryAction>
		  </ListItem>
		  <ListItem>
			<ListItemText primary="Submission Backfill"/>
			<ListItemSecondaryAction>
			  <Input style={{ width: '70px' }}
					 type="number"
					 value={get( this.state, [ 'subBackfill' ], 0 )}
					 disabled={this.state.subBackfill === undefined}
					 onChange={( e ) => this.updatePrefValue( 'subBackfill', e.target.value )}/>
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
			<Button onClick={this.revertPrefs} fullWidth variant="outlined" color="secondary"
					disabled={this.arePrefsModified( this.state )}>Revert</Button>
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