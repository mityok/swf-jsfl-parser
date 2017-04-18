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
			const item = obj[key];
			try{
				result.push(`"${key}":${toString(item)}`)
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
