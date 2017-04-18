import {
    stringify,
    log,
    trace
} from './Utils'
import Timeline from './Timeline'

class LibraryItem {
    constructor(element) {
        log('lib');
        this.timeline = new Timeline(element.timeline)
        //trace(stringify(element,40));
        //each item of itself could have multiple shapes, items, layers and frames 
        //log(`symb: ${stringify(tElement.matrix)}-${tElement.rotation}-${tElement.skewX} - ${stringify(tElement)}`)
        log('libraryItem::: ')
        //fl.trace('libraryItem: '+toString(tElement.transformationPoint))
    }
    getData(){
        return this.timeline.getData();
    }
}
export default LibraryItem