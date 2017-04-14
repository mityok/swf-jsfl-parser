import {stringify, debug, log, trace, clear} from './Utils'
import Shape from './Shape'

debug.print=true

const currentDoc = fl.getDocumentDOM();
clear();
trace(currentDoc.name);
trace(fl.scriptURI);


const timeline = currentDoc.getTimeline();

const currentframe = timeline.currentFrame;
const totalLayers = timeline.layerCount;

function init(){
	//fl.trace('timeline '+stringify(timeline));
	for (let i=0;i<totalLayers;i++) {
        const tElements=timeline.layers[i].frames[currentframe].elements;

		for (let j=0;j<tElements.length;j++) {
			const tElement=tElements[j];
            if (tElement.elementType=='shape') {
            	const shape = new Shape(tElement)
			}else if(tElement.elementType=='instance'){
				 trace(tElement.elementType);
				 trace(stringify(tElements,40));
				//log(`symb: ${stringify(tElement.matrix)}-${tElement.rotation}-${tElement.skewX} - ${stringify(tElement)}`)
				//fl.trace('libraryItem: '+toString(tElement.libraryItem.timeline.layers[0].frames[0].elements))
				//fl.trace('libraryItem: '+toString(tElement.transformationPoint))
			}
        }
    }
	/*
	for (var j=0;j<tElements.length;j++) {			
				var tElement=tElements[j];
				if (tElement.elementType=="shape") {
				}
				*/
	log(`timeline ${currentframe};${timeline.layers[0].frames.length}`);

}
init()
//fl.getDocumentDOM().exportSWF("", true);