import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { CssBaseline, Grid } from '@material-ui/core';
import { Route } from 'react-router-dom';

import AppBar from './Components/AppBar';
import Listen from './Pages/Listen';


class App extends Component {
  constructor( props ){
	super( props );
	//this.props.startFeed();
  }
  
  render(){
	return (
		<Fragment>
		  <CssBaseline/>
		  <AppBar/>
		  <Grid container>
			<Grid item>
			  <Route exact path="/" title="Listen to Reddit" component={Listen}/>
			</Grid>
		  </Grid>
		</Fragment>
	);
  }
}

const mapDispatchToProps = ( dispatch ) =>({
  startFeed: () => dispatch( { type: 'SSE:START' } )
});

export default connect( null, mapDispatchToProps )( App );
