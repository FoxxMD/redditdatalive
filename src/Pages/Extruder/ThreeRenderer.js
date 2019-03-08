// shamelessly ripped from https://codepen.io/darrylhuffman/pen/wOKbvy
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const extrusion      = { // how far each particle should be extruded based on its HSV color
		h: 1.25,
		s: 0,
		v: 0
	  },
	  mouseExtrusion = 1; // extrusion multiplier on mouse over

const half_PI = Math.PI / 2;

function fnum( n ){
  // this function takes any number and formats it for WebGL (-3 -> -3.)
  return (n + '').replace( /^([\d-]{0,})[.]?([\d]{0,})/g, '$1.$2' );
}

const shaders = {
  fragment: `
		uniform sampler2D texture;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vColor;

		void main() {
			// color is passed in through vertex shader
			gl_FragColor = vColor;
		}
	`,
  vertex: `
		uniform sampler2D texture;
		uniform vec2 resolution;
		uniform vec3 hsv;
		uniform vec3 mouse;

		varying vec4 vColor;

		vec3 rgb2hsv(vec3 c)
		{
		    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
		    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
		    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

		    float d = q.x - min(q.w, q.y);
		    float e = 1.0e-10;
		    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
		}
	
		vec4 distanceTo(vec3 p1, vec3 p2){
			// returns vec4, first 3 positions being the distance on that axis and the 4th being the total distance
			vec3 d = vec3(p2.x - p1.x, p2.y - p1.y, 0.);

			return vec4(abs(d.x),
				abs(d.y),
				abs(d.z),
				sqrt(d.x*d.x + d.y*d.y + d.z*d.z));
		}

		void main() {
			vec2 vUv = vec2(resolution.x - position.x, position.y)/resolution;

			vec3 p = position;

			// center particles (resolution is the image's dimensions)
			p.x = p.x - resolution.x / 2.;
			p.y = p.y - resolution.y / 2.;
			
			// get the distance from this particle to the mouse
			vec4 d = distanceTo(vec3(-p.x, -p.y, p.z), mouse);
	
			// get the color of this particle and store it in a varying vec4 to pass to the fragment shader
			vColor = texture2D(texture, vUv);

			// calculate how var this particle will be excluded based off hsv extrusion values set in javascript
			float extrusion = (vColor.x * hsv.x) +
						   (vColor.y * hsv.y) +
						   (vColor.z * hsv.z);
			
			// mouse extrusion multiplier
			float dm = (pow(2., (40.-d.w) * 0.1) * 0.2 - 1.) * ${fnum( mouseExtrusion )};

			// multiply the extrusion by the mouse extrusion multiplier
			extrusion = extrusion + extrusion * dm;
			
			gl_PointSize = 2.;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(p.x, p.y, extrusion),1.0);
		}
	`
};

class ThreeRender {
  constructor( containerElement, onReady = () => null ){
	this.containerElement    = containerElement;
	this.width               = this.containerElement.offsetWidth;
	this.height              = this.containerElement.offsetHeight;
	this.currentTime         = 0;
	this.mouse               = new THREE.Vector2();
	this.clickables          = [];
	this.mesh                = undefined;
	this.mouseDetectionPlane = undefined;
	this.currentExtrusion    = { h: 0, s: 0, v: 0 };
	//this.url                 = 'https://i.imgur.com/3aDc8Iy.jpg';
	this.url                 = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/223954/StarryNight.jpg';
	
	this.readyCallback = onReady;
	
	// constants
	this.scene     = new THREE.Scene();
	this.camera    = new THREE.PerspectiveCamera(
		75, this.width / this.height, 0.1, 1000
	);
	this.renderer  = new THREE.WebGLRenderer( { antialias: true } );
	this.raycaster = new THREE.Raycaster();
	this.loader    = new THREE.TextureLoader();
	this.startTime = new Date().getTime();
	
	
	this.renderer.setSize( this.width, this.height );
	const canvas = this.renderer.domElement;
	this.containerElement.appendChild( canvas );
	THREE.ImageUtils.crossOrigin = 'Anonymous';
	
	window.onresize = this.resizeCanvas;
	this.loadTexture();
	this.render();
	
	document.addEventListener( 'mousemove', e => {
	  if(this.mesh !== undefined) {
		this.mouse.x = (e.clientX / this.width) * 2 - 1;
		this.mouse.y = -(e.clientY / this.height) * 2 + 1;
		
		this.raycaster.setFromCamera( this.mouse, this.camera );
		
		let intersects = this.raycaster.intersectObjects( this.clickables ),
			p          = intersects.length > 0 ? intersects[ 0 ].point : new THREE.Vector3( 0, 0, 0 );
		
		this.mesh.material.uniforms.mouse.value.set( p.x, p.y, p.z );
	  }
	} );
  }
  
  resizeCanvas = () => {
	this.width               = this.containerElement.offsetWidth;
	this.height              = this.containerElement.offsetHeight;
 
	// https://github.com/mrdoob/three.js/issues/69#issuecomment-636783
	this.camera.aspect = this.width / this.height;
	this.camera.updateProjectionMatrix();
	
	this.renderer.setSize( this.width, this.height );
  };
  
  loadTexture = () => this.loader.load( this.url, texture => {
	let imageScale  = 0.01,
		pointDist   = 2 * imageScale,
		imageHeight = texture.image.height * imageScale,
		imageWidth  = texture.image.width * imageScale,
		geometry    = new THREE.BufferGeometry(),
		positions   = [],
		sizes       = [];
	
	let material = new THREE.ShaderMaterial( {
	  uniforms: {
		texture: { type: "t", value: texture },
		resolution: { type: 'v2', value: new THREE.Vector2( imageWidth, imageHeight ) },
		mouse: { type: 'v3', value: new THREE.Vector3( 0, 0, 0 ) },
		hsv: { type: "v3", value: new THREE.Vector3( this.currentExtrusion ) }
	  },
	  vertexShader: shaders.vertex,
	  fragmentShader: shaders.fragment
	} );
	
	this.camera.position.z = Math.max( imageWidth, imageHeight ) * 0.2;
	
	for(let x = 0; x + pointDist < imageWidth; x += pointDist) {
	  for(let y = 0; y + pointDist < imageHeight; y += pointDist) {
		positions.push( x );
		positions.push( y );
		positions.push( 0 );
		sizes.push( 1 );
	  }
	}
	
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
	
	this.mesh            = new THREE.Points( geometry, material );
	this.mesh.rotation.y = Math.PI;
	this.mesh.rotation.x = Math.PI;
	this.scene.add( this.mesh );
	
	this.mouseDetectionPlane = new THREE.Mesh(
		new THREE.PlaneGeometry( imageWidth + 50, imageHeight + 50, 4, 4 ),
		new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, opacity: 0, transparent: true, depthWrite: false } )
	);
	this.clickables.push( this.mouseDetectionPlane );
	this.scene.add( this.mouseDetectionPlane );
	
	
	new TWEEN.Tween( this.camera.position )
		.to( { z: Math.max( imageWidth, imageHeight ) * 0.6 }, 4000 )
		.easing( TWEEN.Easing.Quadratic.Out )
		.start();
	
	new TWEEN.Tween( this.currentExtrusion )
		.to( extrusion, 5000 )
		.easing( TWEEN.Easing.Quadratic.Out )
		.start();
	this.readyCallback();
  } );
  
  render = ( time ) => {
	let now          = new Date().getTime();
	this.currentTime = (now - this.startTime) / 1000;
	TWEEN.update( time );
	
	if(this.mesh) {
	  let xRotation = Math.PI + Math.cos( this.currentTime * 0.25 + 14 ) * (half_PI * 0.25);
	  let yRotation = Math.PI + Math.sin( this.currentTime * 0.15 - 1 ) * (half_PI * 0.25);
	  
	  this.mesh.rotation.x                = xRotation;
	  this.mesh.rotation.y                = yRotation;
	  this.mouseDetectionPlane.rotation.x = xRotation;
	  this.mouseDetectionPlane.rotation.y = yRotation;
	  
	  this.mesh.material.uniforms.hsv.value.set( this.currentExtrusion.h, this.currentExtrusion.s, this.currentExtrusion.v );
	}
	
	requestAnimationFrame( this.render );
	this.renderer.render( this.scene, this.camera );
  };
}

export default ThreeRender;
