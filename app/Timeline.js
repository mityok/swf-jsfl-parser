import {
    stringify,
    log,
    trace
} from './Utils'
import Instance from './Instance'
import Shape from './Shape'

class Timeline {
    constructor(timeline) {
        //trace(stringify(element,40));
        //each item of itself could have multiple shapes, items, layers and frames 
        //log(`symb: ${stringify(tElement.matrix)}-${tElement.rotation}-${tElement.skewX} - ${stringify(tElement)}`)
        //log('timeline::: '+timeline.layerCount)
        this._timeline = timeline
        log('timeline name: '+timeline.name)
        this.tl = this.checkTimelineContents(timeline.layerCount)
        //fl.trace('libraryItem: '+toString(tElement.transformationPoint))
    }
    checkTimelineContents(totalLayers){
        const tl = {name:this._timeline.name, layers:[]}
        for (let i=0;i<totalLayers;i++) {
            const frms = []
            const totalFrames = this._timeline.layers[i].frames.length
            log('layer: '+i+' frames : '+totalFrames)
            for (let j=0;j<totalFrames;j++) {
                const frame = this._timeline.layers[i].frames[j];
                const tElements = frame.elements;
                log('telem : '+tElements.length+' dur: '+frame.duration)
                const elements = this.checkElementsInFrame(tElements)
                frms.push({start:j,duration:frame.duration,elements:elements})
                j+=frame.duration-1
            }
            tl.layers.push(frms)
        }
        return tl;
    }
    checkElementsInFrame(tElements){
        const elements =[]
        for (let j=0;j<tElements.length;j++) {
            const tElement=tElements[j];
            log('t'+ tElement.elementType);
            if (tElement.elementType == 'shape') {
                const shape = new Shape(tElement);
                elements.push(shape.getData())
            }else if(tElement.elementType == 'instance'){
                const instance = new Instance(tElement);
                elements.push(instance.getData())
            }
        }
        return elements;
    }
    getData(){
        return this.tl
    }
}
export default Timeline