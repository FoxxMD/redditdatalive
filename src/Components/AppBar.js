import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Badge, CircularProgress } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import WorldIcon from '@material-ui/icons/Language';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import get from 'lodash/get';

import routes from '../routes';
import { selectActivePref } from '../Global/Preferences/preferencesSelector';
import { sseSelector } from '../Global/SSE/sseSelectors';
import * as sseActions from '../Global/SSE/sseActions';
import * as sseConstants from '../Global/SSE/sseConstants';
import * as prefActions from '../Global/Preferences/preferencesActions';
import PreferenceDrawer from './PreferenceDrawer';

const styles = theme => ({
  root: {
	flexGrow: 1,
  },
  flex: {
	flex: 1,
  },
  menuButton: {
	marginLeft: -12,
	marginRight: 20,
  },
  linkStyle: {
	...theme.typography.title,
	color: 'inherit',
	textDecoration: 'none'
  }
});

const statusType = {
  [ sseConstants.SSE_STATUS_CONNECTING ]: 'secondary',
  [ sseConstants.SSE_STATUS_CLOSED ]: 'secondary',
  [ sseConstants.SSE_STATUS_OPEN ]: 'primary'
};

const badgeStyles = theme => ({
  colorPrimary: {
	backgroundColor: 'green'
  },
  colorSecondary: {
	backgroundColor: 'grey',
  },
  colorError: {
	backgroundColor: 'red'
  },
  badge: {
	top: '-8px',
	right: '-8px',
	width: '13px',
	height: '13px'
  }
});

const progressStyles = theme => ({
  colorPrimary: {
	color: 'orange'
  },
  root: {
	position: 'absolute'
  }
});


const StatusBadge    = withStyles( badgeStyles )( Badge );
const StatusProgress = withStyles( progressStyles )( CircularProgress );

class ButtonAppBar extends Component {
  
  constructor( props ){
	super( props );
	this.state = {
	  prefDrawerOpen: false
	};
  }
  
  openPrefDrawer = () =>{
	this.setState( {
	  prefDrawerOpen: true
	} );
  };
  
  closePrefDrawer = () =>{
	this.setState( {
	  prefDrawerOpen: false
	} );
  };
  
  toggleSse = () =>{
	if(this.props.sse.status === sseConstants.SSE_STATUS_CLOSED) {
	  this.props.startFeed();
	}
	else if(this.props.sse.status === sseConstants.SSE_STATUS_OPEN) {
	  this.props.stopFeed();
	}
  };
  
  savePrefs = ( prefs ) =>{
	this.setState( {
	  prefDrawerOpen: false
	} );
	this.props.setPreferences( prefs );
	
	if(this.props.sse.status === sseConstants.SSE_STATUS_OPEN) {
	  this.props.startFeed();
	}
  };
  
  render(){
	const { classes, breadcrumbs, sse } = this.props;
	
	return (
		<div className={classes.root}>
		  <AppBar position="static">
			<Toolbar>
			  <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
				<MenuIcon/>
			  </IconButton>
			  <Typography variant="title" color="inherit" className={classes.flex}>
				{breadcrumbs.map( ( breadcrumb, index ) => (
					<span key={breadcrumb.key}>
					<NavLink className={classes.linkStyle} to={breadcrumb.props.match.url}>
					  {breadcrumb}
					</NavLink>
					  {(index < breadcrumbs.length - 1) && <i> / </i>}
				  </span>
				) )}
			  </Typography>
			  <IconButton onClick={this.toggleSse}>
				<StatusBadge badgeContent=""
							 color={sse.error !== null ? 'error' : get( statusType, [ sse.status ], 'secondary' )}>
				  {this.props.sse.status === sseConstants.SSE_STATUS_CONNECTING && <StatusProgress size={24}/>}
				  <WorldIcon/>
				</StatusBadge>
			  </IconButton>
			  <IconButton onClick={this.openPrefDrawer} color="inherit">
				<SettingsIcon/>
			  </IconButton>
			</Toolbar>
		  </AppBar>
		  <PreferenceDrawer onSavePrefs={this.savePrefs} onOpen={this.openPrefDrawer} onClose={this.closePrefDrawer}
							preferences={this.props.preferences}
							open={this.state.prefDrawerOpen}/>
		</div>
	);
  }
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapDispatchToProps = ( dispatch ) => ({
  setPreferences: ( prefs ) => (dispatch( prefActions.setPreferences( prefs ) )),
  startFeed: () => (dispatch( sseActions.startFeed() )),
  stopFeed: () => (dispatch( sseActions.stopFeed() ))
});

const mapStateToProps = ( state ) =>{
  return {
	preferences: selectActivePref( state ),
	sse: sseSelector( state ),
  };
};

const composed = compose(
	withStyles( styles ),
	withBreadcrumbs( routes ),
	connect( mapStateToProps, mapDispatchToProps )
);

export default composed( ButtonAppBar );