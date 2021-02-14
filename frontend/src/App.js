// frontend/src/index.js
import React from 'react'
import ReactDOM, { render } from 'react-dom'
// import Sketch from 'react-p5';
import * as p5 from 'p5';

// Define the React app
class App extends React.Component{
    constructor(props){
        super(props);
        this.myRef = React.createRef();

        this.state = {
            count:0,
            gridSize:[-10, 10,-10,10,50,50] //minx, maxx, miny, maxy, gridWidth, gridHeight
        };
    }

    Sketch = (p) => {
        let canvasWidth = 590;
        let canvasHeight = 590;
        let gridHeight = canvasHeight / (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
        let gridWidth = canvasWidth / (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));

        if(Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])){
            gridHeight = Math.abs(canvasHeight / (Math.abs(this.state.gridSize[3]) - Math.abs(this.state.gridSize[2])));
        }
        
        if(Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])){
            gridWidth = Math.abs(canvasWidth / (Math.abs(this.state.gridSize[1]) - Math.abs(this.state.gridSize[0])));
        }

        this.state.gridSize = this.state.gridSize.slice(0,4).concat([gridWidth, gridHeight]);

        let originx = canvasWidth*(Math.abs(this.state.gridSize[0])/(Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0])));
        let originy = canvasHeight*(Math.abs(this.state.gridSize[3])/(Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2])));

        if(this.state.gridSize[0] > 0){
            originx = 0;
        }
        else if(this.state.gridSize[1] < 0){
            originx = canvasWidth;
        }


        if(this.state.gridSize[2] > 0){
            originy = canvasHeight;
        }
        else if(this.state.gridSize[3] < 0){
            originy = 0;
        }
        
        
        (Math.abs(this.state.gridSize[3])/(Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2])))
        console.log("origin location: ",originx, originy);
        console.log("gridwidth: ",gridWidth);

        p.setup = () => {
            p.createCanvas(canvasWidth,canvasHeight);
        }
   
        p.draw = () => {
            p.background(240);
            p.fill(255);

            
            //if they min and max coordinates are same sign, fix starting coord
            let startGridV = this.state.gridSize[0];
            let startGridX =this.state.gridSize[2];

            let endGridV = this.state.gridSize[1];
            let endGridX = this.state.gridSize[3];

            if(Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])){
                if(Math.sign(this.state.gridSize[3]) == 1){
                    startGridX = 0;
                }
                if(Math.sign(this.state.gridSize[3]) == -1){
                    endGridX = 0;
                }
            }

            if(Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])){
                if(Math.sign(this.state.gridSize[1]) == 1){
                    startGridV = 0;
                }
                if(Math.sign(this.state.gridSize[1]) == -1){
                    endGridV = 0;
                }
            }
            
            //draws and updates grids
            for(var i = startGridV; i<=endGridV; i++){ //vertical
                for(var j = startGridX; j<=endGridX; j++){ //horizontal
                    p.strokeWeight(1);
                    p.stroke(200);
                    p.line(originx+i*gridWidth, 0, originx+i*gridWidth, canvasHeight); //vertical lines
                    p.line(0,originy-j*gridHeight,canvasWidth,originy-j*gridHeight); //horizontal lines

                    //notches
                    p.strokeWeight(2);
                    p.stroke(0);
                    p.line(originx+i*gridWidth, originy-5, originx+i*gridWidth, originy+5);
                    p.line(originx-5,originy-j*gridHeight,originx+5,originy-j*gridHeight);
                }
            }
            console.log(originx+-4*gridWidth);
            //axis grids
            p.stroke(0);
            p.strokeWeight(2);
            p.line(0, originy, canvasWidth, originy);
            p.line(originx, 0, originx, canvasHeight);

            p.textSize(canvasHeight/30);
            // p.textFont('Helvetica');
            p.textStyle("NORMAL");
            p.fill(50);
            p.text('x', canvasWidth-18, originy-9);
            p.text('y', originx+9, 0+17);
            

            //mouse position display
            // console.log("("+p.mouseX.toString()+", "+p.mouseY.toString()+")");
            p.text("("+p.mouseX.toString()+", "+p.mouseY.toString()+")", p.mouseX+5,p.mouseY-5);
        }
    }

    componentDidMount() {
        this.myP5 = new p5(this.Sketch, this.myRef.current)
      }

    
    render(){
        const onClick = () => {this.setState({count: this.state.count+1}); console.log(this.state.count);};

        return(
            <div>
                <div ref={this.myRef}></div>
                
                {/* <div>
                    <h1>Zane has {this.state.count} moms</h1>
                    <button onClick={onClick}>Add mom</button>
                </div> */}
            </div>
        )
    }
}
// Mount the app to the mount point.
// const root = document.getElementById('app')
// ReactDOM.render(React.createElement(App, null, null), root)
export default App;