// https://github.com/MaxLaumeister/bitlisten/blob/gh-pages/src/floatable.js

class Floatable {
  
  constructor( node, onComplete, browser ){
	this.velocity = {
	  x: 0,
	  y: -1
	};
	
	this.x = Math.random() * (window.innerWidth - node.offsetWidth);
	this.y = window.innerHeight;
	
	this.browser    = browser;
	this.node       = node;
	this.onComplete = onComplete;
	this.active     = true;
	this.pinned     = false;
	this.draggable  = false;
	this.prevMouseX = null;
	this.prevMouseY = null;
  }
  
  update = ( deltaTime ) => {
  
	if(!this.isActive()) {
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
  
  enableDragging = ( x, y ) =>{
	this.draggable  = true;
	this.prevMouseX = x;
	this.prevMouseY = y;
	if([ 'Chrome', 'Safari' ].includes( this.browser )) {
	  this.node.style.cursor = '-webkit-grabbing';
	}
	else if(this.browser === 'Mozilla') {
	  this.node.style.cursor = '-moz-grabbing';
	}
	else {
	  this.node.style.cursor = 'grabbing';
	}
  };
  
  disableDragging = () =>{
	this.draggable         = false;
	this.prevMouseX        = null;
	this.prevMouseY        = null;
	this.node.style.cursor = null;
  };
  
  moveTo = ( x, y ) =>{
	this.x += (x - this.prevMouseX);
	this.y += (y - this.prevMouseY);
	this.updateDiv();
	
	this.prevMouseX = x;
	this.prevMouseY = y;
  };
  
  updateDiv = () =>{
	const translateString                  = `translate(${this.x}px, ${this.y}px)`;
	this.node.style[ "-webkit-transform" ] = translateString;
	this.node.style.transform              = translateString;
  };
  
  isActive = () =>{
	return this.active && !this.pinned;
  };
  
  pin = () =>{
	this.pinned = true;
  };
  
  unpin = () =>{
	this.pinned = false;
  };
}

export default Floatable;