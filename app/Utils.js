export const debug = {print:false}
export const parse  = sJSON =>  eval('(' + sJSON + ')')
export const stringify = (obj,level=999) => {
	const globalArr =[];
	
	const toString = obj=> {
		if(level<0){
			return '""';
		}
		level--
		//fl.trace('-to-'+obj +':'+(typeof obj));
		if( typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'undefined' || obj === null) {
			return `${obj}`
		}
		if( typeof obj === 'string'){
			return `"${obj}"`
		}
		if(globalArr.includes(obj)){
			return '"@"'
		}
		globalArr.push(obj)
		if(obj instanceof Array){
			const arr = [];
			for(let i=0;i<[...obj].length;i++){
				arr.push(toString(obj[i]))
			}
			return `[${arr.join(',')}]`
		}
		const result = [];
		
		for(const key in obj){
			try{
				result.push(`"${key}":${toString(obj[key])}`)
			}catch(e){
				trace('err: '+e)
			}
		}
		
		return `{${result.join(',')}}`
	}
	return toString(obj)
}
export const log = message =>{
	if(debug.print){
		trace(message)
	}
}
export const trace = message =>{
	fl.trace(message)
}
export const clear = () =>{
	fl.outputPanel.clear();
}
export const hexToRgba = hex => {

	hex = hex.split('#').filter(v=>v.length>1)[0];
	const bigint = parseInt(hex, 16);
    let r,g,b,a=1;

	if(hex.length > 6){
    	r = (bigint >> 24) & 255;
    	g = (bigint >> 16) & 255;
    	b = (bigint >> 8) & 255;
    	a = (bigint & 255) / 255;
	}else{
		r = (bigint >> 16) & 255;
    	g = (bigint >> 8) & 255;
    	b = bigint & 255;
	}
    return r + "," + g + "," + b+','+a;
}

export const base64Encode = str => {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let out = '',
    i = 0,
    c1, c2, c3
  const len = str.length
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff
    if (i == len) {
      out += CHARS.charAt(c1 >> 2)
      out += CHARS.charAt((c1 & 0x3) << 4)
      out += '=='
      break
    }
    c2 = str.charCodeAt(i++)
    if (i == len) {
      out += CHARS.charAt(c1 >> 2)
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4))
      out += CHARS.charAt((c2 & 0xF) << 2)
      out += '='
      break
    }
    c3 = str.charCodeAt(i++)
    out += CHARS.charAt(c1 >> 2)
    out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4))
    out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6))
    out += CHARS.charAt(c3 & 0x3F)
  }
  return out
}