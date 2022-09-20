
async function clickedMe(canvas){
    const stateVal = canvas.toJSON();

const response = await fetch("https://sleepy-cliffs-46276.herokuapp.com/save", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({value: stateVal})
})
}


const canvas = new fabric.Canvas('canvas', {
        width: 900,
        height: 500,
        selection: false,
        backgroundColor: document.getElementById("favColor").value
    });


let mousePressed = false;
let currentMode;
let color = '#000000';
const svgState = {};


const modes = {
    pan: 'pan',
    draw: 'draw'
}



// Setting default brush width

document.getElementById('brushWidTxt').innerHTML = document.getElementById('brushWid').value;

//Functions
function setBgColor(){
    const bgCol = document.getElementById("favColor").value;
    canvas.backgroundColor = bgCol;
    canvas.renderAll();
}


function loadSVGFunc(canvas, jsObj){
    canvas.clear();
    // console.log(jsObj);
    if(jsObj !== "") {
        // console.log(temp);
        canvas.loadFromJSON(jsObj, objects =>{
            canvas.add(...objects);
        })
    }else {
        console.log("two");
    }
}


function toggleMode(mode){

    if(mode === modes.pan){
        if(currentMode === modes.pan){
            currentMode = '';
        } else {
            currentMode = modes.pan;
            canvas.isDrawingMode = false;
        }
    } else if (mode === modes.draw){
        if(currentMode === modes.draw){
            currentMode = '';
            canvas.isDrawingMode = false;
        } else {
            canvas.freeDrawingBrush.color = color;         
            currentMode = modes.draw;
            canvas.isDrawingMode = true;
        }
    }
}

//setting brush type

const setBrushTypeEvent = ()=>{
    
    const bType = document.getElementById('brushType').addEventListener('change', (e)=> {
        let brushType = e.target.value;
        canvas.freeDrawingBrush = new fabric[brushType + 'Brush'](canvas);
        canvas.freeDrawingBrush.color = color;
    })

    const bWidth = document.getElementById('brushWid').addEventListener('change',(e)=>{
        const bw = e.target.value;
        document.getElementById('brushWidTxt').innerHTML = bw;
        canvas.freeDrawingBrush.width = bw;
    })
}

// setting color

const setColorListener = ()=>{
    const picker = document.getElementById('colorPicker').addEventListener('change', (e)=>{
        color = e.target.value;
        canvas.freeDrawingBrush.color = color;
    })
}

const clearCanvas = (canvas, state)=>{
    state.val = canvas.toSVG();
    const selectedObj = canvas.getActiveObjects();
    if(selectedObj.length>0){
        selectedObj.forEach(e =>{
            canvas.remove(e);
        })
    }else {
        canvas.clear();
    }
    canvas.backgroundColor = 'white';
    // canvas.getObjects().forEach((o)=>{

    //         canvas.remove(o);
        
    // })

}

const addRect = (canvas) =>{
    const canvCenter = canvas.getCenter();
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: color,
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center',
        objectCaching: false
    })
    canvas.add(rect);

    rect.on('selected',()=>{
        rect.opacity = 0.8;
    })

    rect.on('deselected',()=>{
        rect.opacity = 1;
    })
}

const addCirc = (canvas) =>{
    const canvCenter = canvas.getCenter();
    const circle = new fabric.Circle({
        radius:50,
        fill: color,
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center',
        objectCaching: false

    })
    canvas.add(circle);

    circle.on('selected',()=>{
        circle.opacity = 0.8;
    })

    circle.on('deselected',()=>{
        circle.opacity = 1;
    })
}

const addText = (canvas)=>{
    const canvCenter = canvas.getCenter();
    const textBox = new fabric.Textbox('Enter Text Here', {
        width: 300,
        fill:color,
        left: canvCenter.left,
        top: canvCenter.top,
        originX: 'center',
        originY: 'center'
    })
    canvas.add(textBox);
}

const restoreCanvas = (canvas, state) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects =>{
            // objects = objects.filter (o=> o['xlink:href'] !== bgUrl)
            // console.log(objects);
            canvas.add(...objects);
        })
    }
}
let group = {};
const groupObj = (canvas, group, shouldGroup) =>{
    if(shouldGroup){
        const objects = canvas.getObjects();
        group.val = new fabric.Group(objects);
        canvas.getObjects().forEach((o)=>{
            if(o !== canvas.backgroundImage ){
                canvas.remove(o);
            }
        })
        canvas.add(group.val);
    } else {
        group.val.destroy();
        const oldGroup = group.val.getObjects();
        canvas.remove(group.val);
        canvas.add(...oldGroup);
        group.val = null;
    }
}

const imageAdded = (e)=>{ 
    const inputE = document.getElementById('myImg');
    const file = inputE.files[0];
    reader.readAsDataURL(file)
} 
const reader = new FileReader();
const inputFile = document.getElementById('myImg');
inputFile.addEventListener('change',imageAdded);

reader.addEventListener('load', ()=>{
    fabric.Image.fromURL(reader.result,(img)=>{
        img.scaleToWidth(50);
        img.scaleToHeight(100);
        canvas.add(img);
    })
})

//Panning image
canvas.on('mouse:move',(e)=>{
    if(mousePressed && currentMode === modes.pan){
        canvas.setCursor('grab');
        const mEvent = e.e;
        const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
        canvas.relativePan(delta);
    }
})

//keep track of mouse click
canvas.on('mouse:down',(e)=>{
    mousePressed = true;
    if(currentMode === modes.pan){
        canvas.setCursor('grab');
    }
})

canvas.on('mouse:up',(e)=>{
    mousePressed = false;
    canvas.setCursor('default');
})


setColorListener();
setBrushTypeEvent();
loadSVGFunc(canvas, newObj);
