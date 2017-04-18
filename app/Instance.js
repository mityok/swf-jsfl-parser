import {
    stringify,
    log,
    trace
} from './Utils'
import LibraryItem from './LibraryItem'
import {putInstance, getInstance} from './InstanceLibrary'

class Instance {
    constructor(element) {
        const name = element.libraryItem.timeline.name
        const libItem = getInstance(name)
        if(libItem){
            this.item = libItem
        }else if(element.libraryItem){
            this.item = new LibraryItem(element.libraryItem)
            putInstance(name, this.item.getData())
        }
        trace(element.elementType+' - ');

        //trace(stringify(element,40));
        //each item of itself could have multiple shapes, items, layers and frames 
        //log(`symb: ${stringify(tElement.matrix)}-${tElement.rotation}-${tElement.skewX} - ${stringify(tElement)}`)
        //log('libraryItem: '+stringify(element.libraryItem.timeline.name))
        //log('libraryItem: '+stringify(element.libraryItem.timeline.layers.length))
        //log('libraryItem: '+stringify(element.libraryItem.timeline.layers[0].frames[0].elements.length))
        //fl.trace('libraryItem: '+toString(tElement.transformationPoint))
    }
    getData(){
        return this.item.getData()
    }
}
export default Instance