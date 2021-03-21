// frontend/src/index.js
import React from "react";
import ReactDOM, { render } from "react-dom";
// import Sketch from 'react-p5';
import axios from "axios";
import * as p5 from "p5";
import Cookies from "js-cookie";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

// Define the React app
class App extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();

    this.state = {
      gridSize: [-10, 10, -10, 10, 50, 50], //minx, maxx, miny, maxy, gridWidth, gridHeight
      vertices: [],
      articleId: null,
    };
  }

  Sketch = (p) => {
    let canvasWidth = 900;
    let canvasHeight = 900;
    let gridHeight =
      canvasHeight /
      (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
    let gridWidth =
      canvasWidth /
      (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));

    if (
      Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])
    ) {
      gridHeight = Math.abs(
        canvasHeight /
          (Math.abs(this.state.gridSize[3]) - Math.abs(this.state.gridSize[2]))
      );
    }

    if (
      Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])
    ) {
      gridWidth = Math.abs(
        canvasWidth /
          (Math.abs(this.state.gridSize[1]) - Math.abs(this.state.gridSize[0]))
      );
    }

    this.state.gridSize = this.state.gridSize
      .slice(0, 4)
      .concat([gridWidth, gridHeight]);

    let originx =
      canvasWidth *
      (Math.abs(this.state.gridSize[0]) /
        (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0])));
    let originy =
      canvasHeight *
      (Math.abs(this.state.gridSize[3]) /
        (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2])));

    if (this.state.gridSize[0] > 0) {
      originx = 0;
    } else if (this.state.gridSize[1] < 0) {
      originx = canvasWidth;
    }

    if (this.state.gridSize[2] > 0) {
      originy = canvasHeight;
    } else if (this.state.gridSize[3] < 0) {
      originy = 0;
    }

    Math.abs(this.state.gridSize[3]) /
      (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
    console.log("origin location: ", originx, originy);
    console.log("gridwidth: ", gridWidth);

    function customRoundX(x, round) {
      var temp_round = (Math.abs(x) - originx) / round;

      return temp_round;
      // //round to closest integer coordinate
      // if(Math.abs(temp_round)%1<0.5){
      //     if(Math.sign(temp_round)<0){ //if negative, reverse rounding
      //         return Math.ceil(temp_round);
      //     }
      //     else{
      //         return Math.floor(temp_round);
      //     }

      // }
      // else{
      //     if(Math.sign(temp_round)<0){
      //         return Math.floor(temp_round);
      //     }
      //     else{
      //         return Math.ceil(temp_round);
      //     }
      // }
    }
    function customRoundY(y, round) {
      //negative return values because pixel coordinates run opposite vertically
      var temp_round = (Math.abs(y) - originy) / round;

      return temp_round;
      // //round to closest integer coordinate
      // if(Math.abs(temp_round)%1<0.5){
      //     if(Math.sign(temp_round)<0){ //if negative, reverse rounding
      //         return -Math.ceil(temp_round);
      //     }
      //     else{
      //         return -Math.floor(temp_round);
      //     }

      // }
      // else{
      //     if(Math.sign(temp_round)<0){
      //         return -Math.floor(temp_round);
      //     }
      //     else{
      //         return -Math.ceil(temp_round);
      //     }
      // }
    }

    p.setup = () => {
      p.createCanvas(canvasWidth, canvasHeight);
    };

    p.draw = () => {
      p.background(240);
      p.fill(255);

      //if they min and max coordinates are same sign, fix starting coord
      let startGridV = this.state.gridSize[0];
      let startGridX = this.state.gridSize[2];

      let endGridV = this.state.gridSize[1];
      let endGridX = this.state.gridSize[3];

      if (
        Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])
      ) {
        if (Math.sign(this.state.gridSize[3]) == 1) {
          startGridX = 0;
        }
        if (Math.sign(this.state.gridSize[3]) == -1) {
          endGridX = 0;
        }
      }

      if (
        Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])
      ) {
        if (Math.sign(this.state.gridSize[1]) == 1) {
          startGridV = 0;
        }
        if (Math.sign(this.state.gridSize[1]) == -1) {
          endGridV = 0;
        }
      }

      //draws and updates grids
      for (var i = startGridV; i <= endGridV; i++) {
        //vertical
        for (var j = startGridX; j <= endGridX; j++) {
          //horizontal
          p.strokeWeight(1);
          p.stroke(200);
          p.line(
            originx + i * gridWidth,
            0,
            originx + i * gridWidth,
            canvasHeight
          ); //vertical lines
          p.line(
            0,
            originy - j * gridHeight,
            canvasWidth,
            originy - j * gridHeight
          ); //horizontal lines

          //notches
          p.strokeWeight(2);
          p.stroke(0);
          p.line(
            originx + i * gridWidth,
            originy - 5,
            originx + i * gridWidth,
            originy + 5
          );
          p.line(
            originx - 5,
            originy - j * gridHeight,
            originx + 5,
            originy - j * gridHeight
          );
        }
      }

      //axis grids
      p.stroke(0);
      p.strokeWeight(2);
      p.line(0, originy, canvasWidth, originy);
      p.line(originx, 0, originx, canvasHeight);

      p.textSize(canvasHeight / 30);
      // p.textFont('Helvetica');
      p.textStyle("NORMAL");
      p.fill(50);
      p.text("x", canvasWidth - 18, originy - 9);
      p.text("y", originx + 9, 0 + 17);

      //display vertices
      p.beginShape();
      for (let i = 0; i < this.state.vertices.length; i++) {
        p.circle(
          this.state.vertices[i][0] * gridWidth + originx,
          -this.state.vertices[i][1] * gridHeight + originy,
          3
        );
        p.vertex(
          this.state.vertices[i][0] * gridWidth + originx,
          -this.state.vertices[i][1] * gridHeight + originy
        );
      }
      p.endShape();
      //mouse position display

      //rounded
      p.text(
        "(" +
          customRoundX(p.mouseX, gridWidth).toFixed(2) +
          ", " +
          (-customRoundY(p.mouseY, gridHeight)).toFixed(2) +
          ")",
        p.mouseX + 5,
        p.mouseY - 5
      );
    };

    //plot point on coordinate plane
    p.mouseClicked = () => {
      //add new vertices;
      let new_vert = [
        customRoundX(p.mouseX, gridWidth).toFixed(2),
        (-customRoundY(p.mouseY, gridHeight)).toFixed(2),
      ];
      let flag = 0;

      for (let i = 0; i < this.state.vertices.length; i++) {
        if (
          this.state.vertices[i][0] == new_vert[0] &&
          this.state.vertices[i][1] == new_vert[1]
        ) {
          flag = 1;
          break;
        }
      }

      if (
        flag == 0 &&
        p.mouseX < canvasWidth &&
        p.mouseX > 0 &&
        p.mouseY > 0 &&
        p.mouseY < canvasHeight
      ) {
        // create duplicate of state array and append new vertex
        const vertices = [...this.state.vertices, new_vert];
        this.getAngle(vertices);
        this.setState({ vertices });
      }
    };
  };

  async getAngle(vertices) {
    try {
      const angleSignal = await axios.post(
        "/data",
        { vertices },
        { headers: { dataType: "json" } }
      );
      console.log(angleSignal);
    } catch (err) {
      console.log(err);
    }
  }

  async componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);

    // ,{headers:{'X-CSRFTOKEN': csrftoken}, withCredentials: true}
    // axios.post("/", {message: 'REACT SERVER MESSAGE'},{headers:{'dataType':'json'}})
    //     .then(response => {console.log(response)});

    //write axios as promise to ensure data from server before continuing
  }

  render() {
    const onClick = () => {
      this.setState({ vertices: [] });
    };
    const listItems = this.state.vertices.map((vertex, index) => (
      <li key={index}>({vertex})</li>
    ));

    console.log("vertices", listItems);
    return (
      <div id="cont">
        <div ref={this.myRef}></div>

        <div id="vertexBox">
          <div id="box">
            VERTICES
            <ul>{listItems}</ul>
            <button onClick={onClick}>Clear</button>
          </div>
        </div>
      </div>
    );
  }
}
// Mount the app to the mount point.
// const root = document.getElementById('app')
// ReactDOM.render(React.createElement(App, null, null), root)
export default App;
