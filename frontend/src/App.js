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
            gridSize:[-10,10,-10,10,50,50] //minx, maxx, miny, maxy, gridWidth, gridHeight
        };
    }

    Sketch = (p) => {
        let canvasWidth = 500;
        let canvasHeight = 500;
        const gridHeight = canvasHeight / (this.state.gridSize[3] - this.state.gridSize[2]);
        const gridWidth = canvasWidth/(this.state.gridSize[1]-this.state.gridSize[0]);
        this.state.gridSize = this.state.gridSize.slice(0,4).concat([gridWidth, gridHeight]);

        const originx = canvasWidth/2 - (this.state.gridSize[1]+this.state.gridSize[0])*this.state.gridSize[4];
        const originy = canvasHeight/2 - (this.state.gridSize[3]+this.state.gridSize[2])*this.state.gridSize[4];

        console.log(this.state.gridSize);
        console.log(originx);
        p.setup = () => {
            p.createCanvas(canvasWidth,canvasHeight);
        }
   
        p.draw = () => {
            p.background(240);
            p.fill(255);
         
            
            for(var i = this.state.gridSize[2]; i<=this.state.gridSize[3]; i++){ //vertical
                for(var j = this.state.gridSize[0]; j<=this.state.gridSize[1]; j++){ //horizontal
                    p.strokeWeight(1);
                    p.stroke(200);
                    p.line(originx+i*gridWidth, 0, originx+i*gridWidth, canvasHeight);
                    p.line(0,originy+j*gridHeight,canvasWidth,originy+j*gridHeight);

                    //notches
                    p.strokeWeight(2);
                    p.stroke(0);
                    p.line(originx+i*gridWidth, originy-5, originx+i*gridWidth, originy+5);
                    p.line(originx-5,originy+j*gridHeight,originx+5,originy+j*gridHeight);
                }
            }

            //axis grids
            p.stroke(0);
            p.strokeWeight(2);
            p.line(0, originy, canvasWidth, originy);
            p.line(originx, 0, originx, canvasHeight);

            p.textSize(12);
            p.fill(50);
            p.text('x', canvasWidth-13, originy-7);
            p.text('y', originx+9, 0+12);
            // console.log(originx);
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
                
                <div>
                    <h1>Zane has {this.state.count} moms</h1>
                    <button onClick={onClick}>Add mom</button>
                </div>
            </div>
        )
    }
}
// Mount the app to the mount point.
// const root = document.getElementById('app')
// ReactDOM.render(React.createElement(App, null, null), root)
export default App;