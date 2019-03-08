// shamelessly ripped from https://codepen.io/darrylhuffman/pen/wOKbvy
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const url            = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/223954/StarryNight.jpg',
	  extrusion      = { // how far each particle should be extruded based on its HSV color
		h: 1.25,
		s: 0,
		v: 0
	  },
	  mouseExtrusion = 1; // extrusion multiplier on mouse over

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

// set up variables
let width               = window.innerWidth,
	height              = window.innerHeight,
	currentTime         = 0,
	mouse               = new THREE.Vector2(),
	clickables          = [],
	mesh                = undefined,
	mouseDetectionPlane = undefined,
	currentExtrusion    = { h: 0, s: 0, v: 0 };


const scene     = new THREE.Scene(),
	  camera    = new THREE.PerspectiveCamera(
		  75, width / height, 0.1, 1000
	  ),
	  renderer  = new THREE.WebGLRenderer( { antialias: true } ),
	  raycaster = new THREE.Raycaster(),
	  loader    = new THREE.TextureLoader(),
	  startTime = new Date().getTime(),
	  half_PI   = Math.PI / 2;


renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );
THREE.ImageUtils.crossOrigin = 'Anonymous';

let texture = loader.load( url, texture => {
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
	  hsv: { type: "v3", value: new THREE.Vector3( currentExtrusion ) }
	},
	vertexShader: shaders.vertex,
	fragmentShader: shaders.fragment
  } );
  
  camera.position.z = Math.max( imageWidth, imageHeight ) * 0.2;
  
  function mod( x, y ){
	return x % y;
  }
  
  for(var x = 0; x + pointDist < imageWidth; x += pointDist) {
	for(var y = 0; y + pointDist < imageHeight; y += pointDist) {
	  positions.push( x );
	  positions.push( y );
	  positions.push( 0 );
	  sizes.push( 1 );
	}
  }
  
  geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
  
  mesh            = new THREE.Points( geometry, material );
  mesh.rotation.y = Math.PI;
  mesh.rotation.x = Math.PI;
  scene.add( mesh );
  
  mouseDetectionPlane = new THREE.Mesh(
	  new THREE.PlaneGeometry( imageWidth + 50, imageHeight + 50, 4, 4 ),
	  new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, opacity: 0, transparent: true, depthWrite: false } )
  );
  clickables.push( mouseDetectionPlane );
  scene.add( mouseDetectionPlane );
  
  
  new TWEEN.Tween( camera.position )
	  .to( { z: Math.max( imageWidth, imageHeight ) * 0.6 }, 4000 )
	  .easing( TWEEN.Easing.Quadratic.Out )
	  .start();
  
  new TWEEN.Tween( currentExtrusion )
	  .to( extrusion, 5000 )
	  .easing( TWEEN.Easing.Quadratic.Out )
	  .start();
} );

document.addEventListener( 'mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera( mouse, camera );
  
  let intersects = raycaster.intersectObjects( clickables ),
	  p          = intersects.length > 0 ? intersects[ 0 ].point : new THREE.Vector3( 0, 0, 0 );
  
  mesh.material.uniforms.mouse.value.set( p.x, p.y, p.z );
} );


function render( time ){
  let now     = new Date().getTime();
  currentTime = (now - startTime) / 1000;
  TWEEN.update( time );
  
  if(mesh) {
	let xRotation = Math.PI + Math.cos( currentTime * 0.25 + 14 ) * (half_PI * 0.25);
	let yRotation = Math.PI + Math.sin( currentTime * 0.15 - 1 ) * (half_PI * 0.25);
	
	mesh.rotation.x                = xRotation;
	mesh.rotation.y                = yRotation;
	mouseDetectionPlane.rotation.x = xRotation;
	mouseDetectionPlane.rotation.y = yRotation;
	
	mesh.material.uniforms.hsv.value.set( currentExtrusion.h, currentExtrusion.s, currentExtrusion.v );
  }
  
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}

render();
