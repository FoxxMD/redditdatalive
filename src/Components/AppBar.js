import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, IconButton, Badge, CircularProgress, Popover } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import Favorite from '@material-ui/icons/Favorite';
import WorldIcon from '@material-ui/icons/Language';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import get from 'lodash/get';
import { withSize } from 'react-sizeme';

import routes from '../routes';
import { selectActivePref, selectAppBarHeight } from '../Global/Preferences/preferencesSelector';
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
  },
  popoverTypography: {
	margin: theme.spacing.unit * 2,
  },
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

const popOverProps = {
  anchorOrigin: {
	vertical: 'bottom',
	horizontal: 'center'
  },
  transformOrigin: {
	vertical: 'top',
	horizontal: 'right'
  }
};

class ButtonAppBar extends Component {
  
  constructor( props ){
	super( props );
	this.state = {
	  prefDrawerOpen: false,
	  creditAnchorElement: null
	};
  }
  
  componentDidUpdate( prevProps ){
	if(prevProps.size.height !== this.props.size.height) {
	  this.props.announceAppBarHeight( this.props.size.height );
	}
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
  
  handlePopoverClick = ( event ) =>{
	this.setState( {
	  creditAnchorElement: event.currentTarget
	} );
  };
  
  handlePopoverClose = () =>{
	this.setState( {
	  creditAnchorElement: null
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
	const { creditAnchorElement }       = this.state;
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
			  <IconButton color="inherit" onClick={this.toggleSse}>
				<StatusBadge badgeContent=""
							 color={sse.error !== null ? 'error' : get( statusType, [ sse.status ], 'secondary' )}>
				  {this.props.sse.status === sseConstants.SSE_STATUS_CONNECTING && <StatusProgress size={24}/>}
				  <WorldIcon/>
				</StatusBadge>
			  </IconButton>
			  <IconButton onClick={this.openPrefDrawer} color="inherit">
				<SettingsIcon/>
			  </IconButton>
			  <IconButton onClick={this.handlePopoverClick} color="inherit">
				<Favorite/>
			  </IconButton>
			  <Popover open={Boolean( creditAnchorElement )}
					   anchorEl={creditAnchorElement}
					   onClose={this.handlePopoverClose}
					   {...popOverProps}>
				<Typography className={classes.popoverTypography}>
				  <Typography>
					<p>Hey thanks for checking this out! You're great.</p>
					<p>Site and experiment sources are available on Github, created by <a href="https://matthewfoxx.com">FoxxMD</a>.</p>
					<p>Reddit live feed source available on <a href="https://github.com/pushshift/reddit_sse_stream">Github</a>,
					  created and provided by <a href="https://pushshift.io/">pushshift.io</a>.</p>
				  </Typography>
				</Typography>
			  </Popover>
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
  announceAppBarHeight: ( height ) => (dispatch( prefActions.annouceAppBarHeight( height ) )),
  startFeed: () => (dispatch( sseActions.startFeed() )),
  stopFeed: () => (dispatch( sseActions.stopFeed() ))
});

const mapStateToProps = ( state ) =>{
  return {
	preferences: selectActivePref( state ),
	height: selectAppBarHeight( state ),
	sse: sseSelector( state ),
  };
};

const withSizeHOC = withSize( { monitorHeight: true, refreshRate: 100 } );

const composed = compose(
	withStyles( styles ),
	withBreadcrumbs( routes ),
	connect( mapStateToProps, mapDispatchToProps ),
	withSizeHOC,
);

export default composed( ButtonAppBar );