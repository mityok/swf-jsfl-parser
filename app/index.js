import {stringify, debug, log, trace, clear} from './Utils'
import Shape from './Shape'
import Instance from './Instance'
import Timeline from './Timeline'

debug.print=true

const currentDoc = fl.getDocumentDOM();
clear();
trace(currentDoc.name);
trace(fl.scriptURI);

const timeline = new Timeline(currentDoc.getTimeline())
//fl.getDocumentDOM().exportSWF("", true);