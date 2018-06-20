import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';

const styles = {
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
};

function ButtonAppBar( props ){
  const { classes } = props;
  return (
	  <div className={classes.root}>
		<AppBar position="static">
		  <Toolbar>
			<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
			  <MenuIcon/>
			</IconButton>
			<Typography variant="title" color="inherit" className={classes.flex}>
			  Listen To Reddit
			</Typography>
			<IconButton disabled color="inherit">
			  <SettingsIcon/>
			</IconButton>
		  </Toolbar>
		</AppBar>
	  </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles( styles )( ButtonAppBar );