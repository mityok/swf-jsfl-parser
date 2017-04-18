import {log} from './Utils'

const instanceLibrary = {}
export const getInstance = key => {
	return instanceLibrary[key]
}
export const putInstance = (key,value) => {
	if(getInstance(key)){
		log('has instance: '+key) 
	}else{
		instanceLibrary[key] = value
	}
}