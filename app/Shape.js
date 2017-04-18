import {
    stringify,
    parse,
    log,
    trace,
    hexToRgba
} from './Utils'

class Shape {
    constructor(element) {
        trace('id',element.id)
        let tEdges = element.edges;
        let tVertices = element.vertices;
        let tContours = element.contours;
        log("//Edges : " + tEdges.length + " - Vertices " + tVertices.length + " - Contours " + tContours.length);
        const cubicSegmentIndices = this.getBezierIndices(element);
        //log('cubicSegmentIndices - ' + stringify(cubicSegmentIndices))

        const list = this.createGroups(element, cubicSegmentIndices)

        //log('list - ' + stringify(list))
        //

        this.parseShape(element, list);
        //log('list2 - ' + stringify(list))
        for (let i = 0; i < list.length; i++) {
            this.joinPaths(list[i].shapes);
        }
        for (let j = 0; j < list.length; j++) {
            this.checkDirection(list[j].shapes);
        }
        //log('list3 - ' + stringify(list))
        this.svgPathArray = []
        for (let k = 0; k < list.length; k++) {
            const svgPathData = this.prepareSvgPath(list[k].shapes);
            //trace('svg path data '+stringify(svgPathData))
            this.svgPathArray.push(svgPathData)
        }
    }
    getData(){
        return this.svgPathArray
    }
    createGroups(element, cubicSegmentIndices) {
        const list = []
        while (cubicSegmentIndices.length) {
            const singleShape = this.colorAndCheck(element, this.getIndeces(cubicSegmentIndices));
            const obj = {
                shapes: []
            }
            for (let i = 0; i < singleShape.length; i++) {
                const seg = cubicSegmentIndices.find(seg => seg.id == singleShape[i].id);
                cubicSegmentIndices.splice(cubicSegmentIndices.indexOf(seg), 1)
                obj.shapes.push(seg)
            }
            //log('filtered - '+obj.shapes.length+'-'+stringify(obj.shapes))
            list.push(obj)
            //log('splice - '+stringify(cubicSegmentIndices))
        }
        return list;
    }
    getIndeces(arr) {
        const res = [];
        for (let i = 0; i < arr.length; i++) {
            res.push(arr[i].contour);
        }
        return res;
    }
    //iterating over countours, coloring each one 
    //marking all other contours that are affected
    //
    //need to remove from main array
    colorAndCheck(element, indeces) {
        //log('indeces - '+indeces)
        const contourArray = element.contours;
        const contourList = [];
        for (i = 0; i < contourArray.length; i++) {
            if (indeces.indexOf(i) >= 0) {
                const contour = contourArray[i];
                let he = contour.getHalfEdge();
                const iStart = he.id;
                let id = 0;
                let strokeData = null
                const bezierObj = {
                    bezierList: [],
                    contour: i
                }
                while (id != iStart) {
                    const index = he.getEdge().cubicSegmentIndex;
                    const stroke = he.getEdge().stroke;
                    he = he.getNext();
                    id = he.id;
                    if (stroke.style !== 'noStroke') {
                        strokeData = stroke;
                    }
                    if (!bezierObj.bezierList.includes(index)) {
                        bezierObj.bezierList.push(index)
                    }

                }
                bezierObj.bezierList.sort((a, b) => a - b);
                bezierObj.id = `#${bezierObj.bezierList.join('')}`;
                if (contour.fill.style != 'noFill' || strokeData) {
                    contourList.push(bezierObj);
                }
            }
        }
        //

        //log('color - '+stringify(contourList))
        const firstContour = contourArray[indeces[0]];
        if (firstContour.fill.style == 'noFill') {
            //log(`arr - ${indeces[0]} - ${stringify(contourList)} ${stringify(firstContour)}`)
            const strokeContour = contourList.filter(c => c.contour == indeces[0])
            //log('strokeContour -' + stringify(strokeContour))
            return strokeContour
        }
        //create unigue color
        const color = '#000001'
        const prevFill = firstContour.fill
        this.paint(element, firstContour, color)
        const arr = this.checkAffected(contourArray, contourList, color);
        //prevFill.color = prevFill.color+='CC';
        firstContour.fill = prevFill
        //log(`arr - ${indeces[0]} - ${stringify(contourList)} ${stringify(firstContour)} - ${stringify(arr)}`)
        return arr
    }

    checkAffected(contourArray, contourList, color) {
        const arr = []
        for (i = 0; i < contourArray.length; i++) {
            const contour = contourArray[i];
            //log(contour.fill.color +' - '+color)
            if (contour.fill.color === color) {
                arr.push(contourList.find(c => c.contour === i))
            }
        }
        //log('arr - '+arr.length+' - '+stringify(arr))
        return arr
    }

    paint(element, contour, color) {
        const fill = element.getCustomFill();
        fill.style = 'solid';
        fill.color = color;
        contour.fill = fill;
    }

    getBezierIndices(element) {
        const contourArray = element.contours;
        const contourList = [];
        for (i = 0; i < contourArray.length; i++) {
            const contour = contourArray[i];
            //log('cont: ' + stringify(contour))
            let he = contour.getHalfEdge();
            const iStart = he.id;
            let id = 0;
            let strokeData = null;
            const bezierObj = {
                bezierList: [],
                points: [],
                strokeSurrounds:true
            }

            let strokeCompare = null;
            while (id != iStart) {
            	const edge = he.getEdge()
                log(`while ${edge}`)
                let index=-1
                index = edge.cubicSegmentIndex;
                log(`while1 ${index}`)
                const stroke = edge.stroke;

                const point = {
                	start:{
                		x:edge.getControl(0).x,
                		y:edge.getControl(0).y
                	},
                	end:{
                		x:edge.getControl(2).x,
                		y:edge.getControl(2).y
                	},
                	cubicSegmentIndex:index,
                	stroke:stroke
                }
                //log(`${edge.getControl(0).x}:${edge.getControl(0).y} - ${edge.getControl(2).x}:${edge.getControl(2).y} - ${stroke.style}`)
                if(!strokeCompare){
                	strokeCompare = stringify(stroke)
                }else{
                	if(strokeCompare != stringify(stroke)){
                		bezierObj.strokeSurrounds = false
						strokeCompare = stringify(stroke)
                	}
                }
                if (stroke.style !== 'noStroke') {
                    strokeData = stroke;
                }
                //log(`${i} => ${index} ${stringify(point)}`)
                //log(`${i} => ${index} ${stringify(stroke)}`)
                he = he.getNext();
                id = he.id;
                //log(`${i} => ${id} ${stringify(he)} - ${iStart}`)

                bezierObj.points.push(point)
                if (!bezierObj.bezierList.includes(index)) {
                    bezierObj.bezierList.push(index);
                }
            }
            bezierObj.stroke = strokeData;
            bezierObj.bezierList.sort((a, b) => a - b);
            bezierObj.contour = i;
            bezierObj.id = `#${bezierObj.bezierList.join('')}`;
            bezierObj.fill = contour.fill;
            const inArr = contourList.find(obj => this.compareContours(obj, bezierObj));
            //log('inArr: ' + stringify(inArr))
            //duplicate on shape with stroke
            //replace the one wich includes both stroke and fill
            if (!inArr && (bezierObj.fill.style != 'noFill' || strokeData)) {
                contourList.push(bezierObj);
            }
        }
        //log(`Contours ${contourList.length} ${stringify(contourList)}`);
        return contourList;
    }
    compareContours(a, b) {
        if (a.id !== b.id) {
            return false
        }
        if (stringify(a.stroke) !== stringify(b.stroke)) {
            return false
        }
        if (stringify(a.fill) !== stringify(b.fill)) {
            return false
        }
        const p1 = a.points.reduce((acc, p) => {
        	acc.x += p.start.x+p.end.x;
        	acc.y += p.start.y+p.end.y;
        	return acc
        }, {x:0,y:0})
        const p2 = b.points.reduce((acc, p) => {
        	acc.x += p.start.x+p.end.x;
        	acc.y += p.start.y+p.end.y;
        	return acc
        }, {x:0,y:0})
        
        log(stringify(p1) + ' - ' + stringify(p2))
        return (p1.x === p2.x && p1.y == p2.y)
    }


    parseShape(elem, cubicIndices) {
        for (let m = 0; m < cubicIndices.length; m++) {

            for (let n = 0; n < cubicIndices[m].shapes.length; n++) {
                const segs = []
                for (let o = 0; o < cubicIndices[m].shapes[n].bezierList.length; o++) {
                    const index = cubicIndices[m].shapes[n].bezierList[o];
                    const p = elem.getCubicSegmentPoints(index);
                    const p0 = p[0];
                    const p1 = p[1];
                    const p2 = p[2];
                    const p3 = p[3];
                    let isLine = false;
                    const seg = {
                        index,
                        start: {
                            x: p0.x,
                            y: p0.y
                        }
                    };
                    //possible fail point for line check
                    if (p0.x === p1.x && p0.y === p1.y && p2.x === p3.x && p2.y === p3.y) {
                        isLine = true;
                    } else {
                        seg.handle1 = {
                            x: p1.x,
                            y: p1.y
                        }
                        seg.handle2 = {
                            x: p2.x,
                            y: p2.y
                        }
                    }
                    seg.end = {
                        x: p3.x,
                        y: p3.y
                    }
                    seg.isLine = isLine
                    segs.push(seg)
                }
                cubicIndices[m].shapes[n].segs = segs
            }
        }
    }

    area(poly) {
        //http://jsclipper.sourceforge.net/6.2.1.1/index.html?p=clipper_unminified.js
        const cnt = poly.length;
        if (cnt < 3) {
            return 0;
        }
        let a = 0;
        for (let i = 0, j = cnt - 1; i < cnt; ++i) {
            a += (poly[j].start.x + poly[i].start.x) * (poly[j].start.y - poly[i].start.y);
            j = i;
        }
        return -a * 0.5;
    }


    checkDirection(paths) {
        for (let i = 0; i < paths.length; i++) {
            const area = this.area(paths[i].segs);
            //log(`area - ${area}`)
            paths[i].area = area
        }
        if (paths.length > 1) {
            paths.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
            for (let k = 0; k < paths.length; k++) {
                if (k === 0) {
                    //the largest path should be positive
                    if (paths[k].area < 0) {
                        //paths[k].segs.reverse()
                        paths[k].area *= -1
                        this.reversePath(paths[k].segs)
                    }
                } else {
                    if (paths[k].area > 0) {
                        //all the smaller paths should be negative
                        this.reversePath(paths[k].segs)
                        //let ar2 = area(objs[k].path)
                        //log('area2 - '+ar2)
                        paths[k].area *= -1;
                    }
                }
            }
        }

    }

    reversePath(path) {
        for (let i = 0; i < path.length; i++) {
            this.reverseSeg(path[i])
        }
        path.reverse()
    }

    prepareSvgPath(objs) {
        const fill = objs[0].fill
        const noFill = fill.style === 'noFill'
       	const noStroke = !objs[0].stroke
        log('createSvgPath - '+noFill+' -'+ noStroke)
        if(!noFill){
        	const pathString = objs.reduce((acc,obj)=>`${acc}${this.createSvgPath(obj.segs)}`,'')
        	return {d:pathString,fill:fill};
        }else if(noFill && !noStroke){
        	const data = []
        	for (let i = 0; i < objs.length; i++) {
        		const resp = this.createSvgStrokePath(objs[i].segs, objs[i].points)
        		data.push(resp);
        	}
        	return data;
        }
    }
    createSvgStrokePath(segs, points){
    	let stroke = null;
    	let list = []
    	let item = {path:'',stroke:null}
    	let start = true;
    	for (let i = 0; i < segs.length; i++) {
    		const seg = segs[i]
    		//log(i+' - ' +seg.index)
    		const strokeForSeg = points.find(p=>p.cubicSegmentIndex == seg.index).stroke;
    		start = false
    		if(!stroke){
    			stroke = strokeForSeg
    			start = true;
    			if(stroke.style!='noStroke'){
	    			item.stroke = stroke;
	    			list.push(item)
	    		}
    			//log('strt - '+i+' - '+stringify(stroke))
    		}else if(stringify(stroke) !== stringify(strokeForSeg)){
				stroke = strokeForSeg
				start=true;
				if(stroke.style!='noStroke'){
					item = {path:'',stroke:stroke};
					list.push(item);
				}
				//log(i+' - '+stringify(stroke))
    		}
    		if(stroke.style!='noStroke'){

	            if (seg.isLine) {
	                item.path += (start ? (`M${seg.start.x} ${seg.start.y}`) : '');
	                item.path += ` L${seg.end.x} ${seg.end.y}`

	            } else {
	                item.path += start ? (`M${seg.start.x} ${seg.start.y} C${seg.handle1.x} ${seg.handle1.y}, ${seg.handle2.x} ${seg.handle2.y},${seg.end.x} ${seg.end.y}`) 
	                : (` C${seg.handle1.x} ${seg.handle1.y}, ${seg.handle2.x} ${seg.handle2.y},${seg.end.x} ${seg.end.y}`)
	            }
    		}

    	}
    	return list
    }
	createSvgPath(segs) {
		const isClosed = segs[0].start.x === segs[segs.length-1].end.x && segs[0].start.y === segs[segs.length-1].end.y
		//log('createSvgPath - '+segs.length+' - '+ isClosed)
        const p = segs.reduce((acc, seg, i, arr) => {
        	const isLast = (i === arr.length-1);
        	let path = '';
            if (seg.isLine) {
                path = (i == 0 ? (`M${seg.start.x} ${seg.start.y}`) : '');
                path += (!isLast&&isClosed)?` L${seg.end.x} ${seg.end.y}`:'';
            } else {
                path = i == 0 ? (`M${seg.start.x} ${seg.start.y} C${seg.handle1.x} ${seg.handle1.y}, ${seg.handle2.x} ${seg.handle2.y},${seg.end.x} ${seg.end.y}`) 
                : (` C${seg.handle1.x} ${seg.handle1.y}, ${seg.handle2.x} ${seg.handle2.y},${seg.end.x} ${seg.end.y}`)
            }
            return acc + path
        }, '');
       return `${p}${isClosed?'z':''}`
	}

    joinPaths(paths) {
        //log(`joinPaths ${paths.length}`);
        for (let i = 0; i < paths.length; i++) {
            paths[i].segs = this.buildSegmentChain(paths[i].segs)
        }
    }
    buildSegmentChain(points) {
        let point = points.shift()
        let pts = [point];
        let counter = 0
        while (points.length) {
        	//posssible fail point for segment connection
            let tempPoint = points.find(p => p.start.x === point.end.x && p.start.y === point.end.y);
            if (!tempPoint) {
                tempPoint = points.find(p => p.end.x === point.end.x && p.end.y === point.end.y);
                if (tempPoint) {
                    this.reverseSeg(tempPoint)
                }
            }
            if (tempPoint) {
                point = tempPoint;
                points.splice(points.indexOf(point), 1);
                pts.push(point);
            } else {
                this.reversePath(pts)
                point = pts[pts.length - 1]
            }
        }
        return pts;
    }
    reverseSeg(seg) {
        const temp = seg.start;
        seg.start = seg.end;
        seg.end = temp;
        if (!seg.isLine) {
            const handle = seg.handle1;
            seg.handle1 = seg.handle2;
            seg.handle2 = handle;
        }
    }
}
export default Shape