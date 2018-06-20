import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { compose } from 'recompose';
import { NavLink } from 'react-router-dom';

import routes from '../routes';

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

function ButtonAppBar( props ){
  const { classes, breadcrumbs } = props;
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

const composed = compose(
	withStyles( styles ),
	withBreadcrumbs( routes ),
);

export default composed( ButtonAppBar );