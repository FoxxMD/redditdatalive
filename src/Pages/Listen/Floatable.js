// https://github.com/MaxLaumeister/bitlisten/blob/gh-pages/src/floatable.js

class Floatable {
  
  constructor( node, onComplete ){
	this.velocity = {
	  x: 0,
	  y: -1
	};
	
	this.x = Math.random() * (window.innerWidth - node.offsetWidth);
	this.y = window.innerHeight;
	
	this.node       = node;
	this.onComplete = onComplete;
	this.active     = true;
  }
  
  update = ( deltaTime ) => {
    
    if(!this.active) {
      return;
	}
	
	var HVEL_MAX = 1;
	var step     = deltaTime / 30; // moderates Y speed of floater. Lower is faster
	
	this.x += this.velocity.x * step;
	this.y += this.velocity.y * step;
	
	this.velocity.x += (Math.random() * 0.1 - 0.05) * step;
	if(this.velocity.x > HVEL_MAX) {
	  this.velocity.x = HVEL_MAX;
	}
	else if(this.velocity.x < -HVEL_MAX) {
	  this.velocity.x = -HVEL_MAX;
	}
	if(this.x < 0) {
	  this.velocity.x += 0.005 * step;
	}
	else if(this.x > window.innerWidth - this.node.offsetWidth) {
	  this.velocity.x -= 0.005 * step;
	}
	
	this.updateDiv();
	
	if(this.y < -this.node.offsetHeight) {
	  this.onComplete( this );
	}
  };
  
  stopAnimation  = () =>{
	this.active = false;
  };
  startAnimation = () =>{
	this.active = true;
  };
  
  updateDiv = () =>{
	const translateString                  = `translate(${this.x}px, ${this.y}px)`;
	this.node.style[ "-webkit-transform" ] = translateString;
	this.node.style.transform              = translateString;
  };
}

export default Floatable;