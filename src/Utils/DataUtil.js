export function stringToValue( str ){ // helper for selects that need a string/actual value
  switch(str) {
	case 'null':
	  return null;
	case 'true':
	  return true;
	case 'false':
	  return false;
	default:
	  return str;
  }
}

export function valueToString( val ){ // helper for selects that need a string/actual value
  switch(val) {
	case null:
	  return 'null';
	default:
	  return val.toString();
  }
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}