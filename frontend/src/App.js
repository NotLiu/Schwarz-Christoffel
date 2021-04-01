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

    this.state = {
      gridSize: [-10, 10, -10, 10, 50, 50], //minx, maxx, miny, maxy, gridWidth, gridHeight
      vertices: [],
      articleId: null,
      intAngles: [],
      extAngles: [],
      lineLengths: [],
      lineSlopes: [],
      polygon: false,
      mouseCoords: [0, 0],
    };

    this.canvasWidth = 900;
    this.canvasHeight = 900;
    this.gridHeight =
      this.canvasHeight /
      (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
    this.gridWidth =
      this.canvasWidth /
      (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));
    this.originx =
      this.canvasWidth *
      (Math.abs(this.state.gridSize[0]) /
        (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0])));
    this.originy =
      this.canvasHeight *
      (Math.abs(this.state.gridSize[3]) /
        (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2])));

    //if they min and max coordinates are same sign, fix starting coord
    this.startGridV = this.state.gridSize[0];
    this.startGridX = this.state.gridSize[2];

    this.endGridV = this.state.gridSize[1];
    this.endGridX = this.state.gridSize[3];

    this.svg = React.createRef();

    //bind functions
    this.changeMouseCoords = this.changeMouseCoords.bind(this);
    this.customRoundX = this.customRoundX.bind(this);
    this.customRoundY = this.customRoundY.bind(this);
  }

  // Sketch = (p) => {
  //   let canvasWidth = 900;
  //   let canvasHeight = 900;
  //   let gridHeight =
  //     canvasHeight /
  //     (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
  //   let gridWidth =
  //     canvasWidth /
  //     (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));

  //   if (
  //     Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])
  //   ) {
  //     gridHeight = Math.abs(
  //       canvasHeight /
  //         (Math.abs(this.state.gridSize[3]) - Math.abs(this.state.gridSize[2]))
  //     );
  //   }

  //   if (
  //     Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])
  //   ) {
  //     gridWidth = Math.abs(
  //       canvasWidth /
  //         (Math.abs(this.state.gridSize[1]) - Math.abs(this.state.gridSize[0]))
  //     );
  //   }

  //   this.state.gridSize = this.state.gridSize
  //     .slice(0, 4)
  //     .concat([gridWidth, gridHeight]);

  //   let originx =
  //     canvasWidth *
  //     (Math.abs(this.state.gridSize[0]) /
  //       (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0])));
  //   let originy =
  //     canvasHeight *
  //     (Math.abs(this.state.gridSize[3]) /
  //       (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2])));

  //   if (this.state.gridSize[0] > 0) {
  //     originx = 0;
  //   } else if (this.state.gridSize[1] < 0) {
  //     originx = canvasWidth;
  //   }

  //   if (this.state.gridSize[2] > 0) {
  //     originy = canvasHeight;
  //   } else if (this.state.gridSize[3] < 0) {
  //     originy = 0;
  //   }

  //   Math.abs(this.state.gridSize[3]) /
  //     (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
  //   console.log("origin location: ", originx, originy);
  //   console.log("gridwidth: ", gridWidth);

  //   function customRoundX(x, round) {
  //     var temp_round = (Math.abs(x) - originx) / round;

  //     return temp_round;
  //     // //round to closest integer coordinate
  //     // if(Math.abs(temp_round)%1<0.5){
  //     //     if(Math.sign(temp_round)<0){ //if negative, reverse rounding
  //     //         return Math.ceil(temp_round);
  //     //     }
  //     //     else{
  //     //         return Math.floor(temp_round);
  //     //     }

  //     // }
  //     // else{
  //     //     if(Math.sign(temp_round)<0){
  //     //         return Math.floor(temp_round);
  //     //     }
  //     //     else{
  //     //         return Math.ceil(temp_round);
  //     //     }
  //     // }
  //   }
  //   function customRoundY(y, round) {
  //     //negative return values because pixel coordinates run opposite vertically
  //     var temp_round = (Math.abs(y) - originy) / round;

  //     return temp_round;
  //     // //round to closest integer coordinate
  //     // if(Math.abs(temp_round)%1<0.5){
  //     //     if(Math.sign(temp_round)<0){ //if negative, reverse rounding
  //     //         return -Math.ceil(temp_round);
  //     //     }
  //     //     else{
  //     //         return -Math.floor(temp_round);
  //     //     }

  //     // }
  //     // else{
  //     //     if(Math.sign(temp_round)<0){
  //     //         return -Math.floor(temp_round);
  //     //     }
  //     //     else{
  //     //         return -Math.ceil(temp_round);
  //     //     }
  //     // }
  //   }

  //   function vertexPlotConversionX(vertex, xSep = 0) {
  //     return vertex * gridWidth + originx + xSep;
  //   }

  //   function vertexPlotConversionY(vertex, ySep = 0) {
  //     return -vertex * gridHeight + originy + ySep;
  //   }

  //   p.setup = () => {
  //     p.createCanvas(canvasWidth, canvasHeight);
  //   };

  //   p.draw = () => {
  //     p.background(240);
  //     p.fill(255);

  //     //if they min and max coordinates are same sign, fix starting coord
  //     let startGridV = this.state.gridSize[0];
  //     let startGridX = this.state.gridSize[2];

  //     let endGridV = this.state.gridSize[1];
  //     let endGridX = this.state.gridSize[3];

  //     if (
  //       Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])
  //     ) {
  //       if (Math.sign(this.state.gridSize[3]) == 1) {
  //         startGridX = 0;
  //       }
  //       if (Math.sign(this.state.gridSize[3]) == -1) {
  //         endGridX = 0;
  //       }
  //     }

  //     if (
  //       Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])
  //     ) {
  //       if (Math.sign(this.state.gridSize[1]) == 1) {
  //         startGridV = 0;
  //       }
  //       if (Math.sign(this.state.gridSize[1]) == -1) {
  //         endGridV = 0;
  //       }
  //     }

  //     //draws and updates grids
  //     for (var i = startGridV; i <= endGridV; i++) {
  //       //vertical
  //       for (var j = startGridX; j <= endGridX; j++) {
  //         //horizontal
  //         p.strokeWeight(1);
  //         p.stroke(200);
  //         p.line(
  //           originx + i * gridWidth,
  //           0,
  //           originx + i * gridWidth,
  //           canvasHeight
  //         ); //vertical lines
  //         p.line(
  //           0,
  //           originy - j * gridHeight,
  //           canvasWidth,
  //           originy - j * gridHeight
  //         ); //horizontal lines

  //         //notches
  //         p.strokeWeight(2);
  //         p.stroke(0);
  //         p.line(
  //           originx + i * gridWidth,
  //           originy - 5,
  //           originx + i * gridWidth,
  //           originy + 5
  //         );
  //         p.line(
  //           originx - 5,
  //           originy - j * gridHeight,
  //           originx + 5,
  //           originy - j * gridHeight
  //         );
  //       }
  //     }

  //     //axis grids
  //     p.stroke(0);
  //     p.strokeWeight(2);
  //     p.line(0, originy, canvasWidth, originy);
  //     p.line(originx, 0, originx, canvasHeight);

  //     p.textSize(canvasHeight / 30);
  //     // p.textFont('Helvetica');
  //     p.textStyle("NORMAL");
  //     p.fill(50);
  //     p.text("x", canvasWidth - 18, originy - 9);
  //     p.text("y", originx + 9, 0 + 17);

  //     //display vertices
  //     p.beginShape();
  //     for (let i = 0; i < this.state.vertices.length; i++) {
  //       p.circle(
  //         vertexPlotConversionX(this.state.vertices[i][0]),
  //         vertexPlotConversionY(this.state.vertices[i][1]),
  //         3
  //       );
  //       p.vertex(
  //         vertexPlotConversionX(this.state.vertices[i][0]),
  //         vertexPlotConversionY(this.state.vertices[i][1])
  //       );
  //     }
  //     p.endShape();
  //     //mouse position display

  //     //rounded
  //     p.text(
  //       "(" +
  //         customRoundX(p.mouseX, gridWidth).toFixed(2) +
  //         ", " +
  //         (-customRoundY(p.mouseY, gridHeight)).toFixed(2) +
  //         ")",
  //       p.mouseX + 5,
  //       p.mouseY - 5
  //     );

  //     //display angles

  //     if (this.state.vertices.length > 2 && this.state.polygon) {
  //       const angleTemp = [...this.state.extAngles];

  //       // console.log(
  //       //   parseFloat(angleTemp[angleTemp.length - 1].slice(5)).toFixed(2)
  //       // );
  //       p.text(
  //         "∠ " +
  //           parseFloat(angleTemp[angleTemp.length - 1].slice(5)).toFixed(2),
  //         vertexPlotConversionX(
  //           this.state.vertices[this.state.vertices.length - 1][0],
  //           -25
  //         ),
  //         vertexPlotConversionY(
  //           this.state.vertices[this.state.vertices.length - 1][1],
  //           30
  //         )
  //       );

  //       for (let i = 1; i < this.state.vertices.length; i++) {
  //         p.text(
  //           "∠ " + parseFloat(angleTemp[i].slice(5)).toFixed(2),
  //           vertexPlotConversionX(this.state.vertices[i - 1][0], -25),
  //           vertexPlotConversionY(this.state.vertices[i - 1][1], 30)
  //         );
  //       }
  //     }
  //   };

  //   //plot point on coordinate plane
  //   p.mouseClicked = () => {
  //     //flag to make sure data is set before rendering
  //     this.setState({ polygon: false });

  //     //add new vertices;
  //     let new_vert = [
  //       customRoundX(p.mouseX, gridWidth).toFixed(2),
  //       (-customRoundY(p.mouseY, gridHeight)).toFixed(2),
  //     ];
  //     let flag = 0;

  //     for (let i = 0; i < this.state.vertices.length; i++) {
  //       if (
  //         this.state.vertices[i][0] == new_vert[0] &&
  //         this.state.vertices[i][1] == new_vert[1]
  //       ) {
  //         flag = 1;
  //         break;
  //       }
  //     }

  //     if (
  //       flag == 0 &&
  //       p.mouseX < canvasWidth &&
  //       p.mouseX > 0 &&
  //       p.mouseY > 0 &&
  //       p.mouseY < canvasHeight
  //     ) {
  //       // create duplicate of state array and append new vertex
  //       const vertices = [...this.state.vertices, new_vert];
  //       this.getPolyData(vertices);
  //       this.setState({ vertices });
  //     }
  //   };
  // };

  // mouseClicked() {
  //   //flag to make sure data is set before rendering
  //   this.setState({ polygon: false });
  //   //add new vertices;
  //     let new_vert = [
  //       this.customRoundX(this.state.mouseCoords[0], this.gridWidth).toFixed(2),
  //       (-this.customRoundY(this.state.mouseCoords[1], this.gridHeight)).toFixed(2),
  //     ];
  //     let flag = 0;

  //     for (let i = 0; i < this.state.vertices.length; i++) {
  //       if (
  //         this.state.vertices[i][0] == new_vert[0] &&
  //         this.state.vertices[i][1] == new_vert[1]
  //       ) {
  //         flag = 1;
  //         break;
  //       }
  //     }

  //     if (
  //       flag == 0 &&
  //       p.mouseX < canvasWidth &&
  //       p.mouseX > 0 &&
  //       p.mouseY > 0 &&
  //       p.mouseY < canvasHeight
  //     ) {
  //       // create duplicate of state array and append new vertex
  //       const vertices = [...this.state.vertices, new_vert];
  //       this.getPolyData(vertices);
  //       this.setState({ vertices });
  //     }
  //   };
  // }

  async getPolyData(vertices) {
    try {
      const angleSignal = await axios.post(
        "/data",
        { vertices },
        { headers: { dataType: "json" } }
      );
      this.state.intAngles = [...angleSignal.data["Interior Angles"]];
      const intAngles = this.state.intAngles;
      this.state.extAngles = [...angleSignal.data["Exterior Angles"]];
      const extAngles = this.state.extAngles;
      this.state.lineLengths = [...angleSignal.data["lineLengths"]];
      const lineLens = this.state.lineLengths;
      this.state.lineSlopes = [...angleSignal.data["lineSlopes"]];
      const lineSlopes = this.state.lineSlopes;

      this.setState({ intAngles });
      this.setState({ extAngles });
      this.setState({ lineLens });
      this.setState({ lineSlopes });
      this.setState({ polygon: true });

      // console.log("EEEEERGERGERG");
      // console.log([...this.state.extAngles]);
      console.log(angleSignal.data);
    } catch (err) {
      console.log(err);
    }
  }
  customRoundX(x, round) {
    var temp_round = (Math.abs(x) - this.originx) / round;

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
  customRoundY(y, round) {
    //negative return values because pixel coordinates run opposite vertically
    var temp_round = (Math.abs(y) - this.originy) / round;

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

  vertexPlotConversionX(vertex, xSep = 0) {
    return vertex * gridWidth + originx + xSep;
  }

  vertexPlotConversionY(vertex, ySep = 0) {
    return -vertex * gridHeight + originy + ySep;
  }

  changeMouseCoords(evt) {
    console.log(this.svg.current);
    const pt = this.svg.current.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;

    let cursorpt = pt.matrixTransform(
      this.svg.current.getScreenCTM().inverse()
    );
    this.state.mouseCoords[0] = cursorpt.x;
    this.state.mouseCoords[1] = cursorpt.y;

    const mouseCoords = this.state.mouseCoords;

    this.setState({ mouseCoords });
  }

  componentDidMount() {
    // this.myP5 = new p5(this.Sketch, this.myRef.current);
    //write axios as promise to ensure data from server before continuing
  }

  render() {
    const onClickVert = () => {
      this.setState({ vertices: [] });
      this.setState({ intAngles: [] });
      this.setState({ extAngles: [] });
      this.setState({ lineLengths: [] });
      this.setState({ lineSlopes: [] });
    };
    const listItems = this.state.vertices.map((vertex, index) => (
      <li key={index}>
        ({vertex[0]},{vertex[1]})
      </li>
    ));
    const extAnglesList = this.state.extAngles.map((angle, index) => (
      <li key={index}>
        ({angle.slice(0, 5) + parseFloat(angle.slice(5)).toFixed(2)})
      </li>
    ));
    const intAnglesList = this.state.intAngles.map((angle, index) => (
      <li key={index}>
        ({angle.slice(0, 5) + parseFloat(angle.slice(5)).toFixed(2)})
      </li>
    ));
    const lineLenList = this.state.lineLengths.map((len, index) => (
      <li key={index}>
        ({len.slice(0, 7) + parseFloat(len.slice(7)).toFixed(2)})
      </li>
    ));
    const lineSlopeList = this.state.lineSlopes.map((slope, index) => (
      <li key={index}>
        ({slope.slice(0, 7) + parseFloat(slope.slice(7)).toFixed(2)})
      </li>
    ));

    /* //draws and updates grids */
    const cPlane = [];

    for (var i = this.startGridV; i <= this.endGridV; i++) {
      //vertical
      for (var j = this.startGridX; j <= this.endGridX; j++) {
        //horizontal lines
        cPlane.push(
          <line
            x1={this.originx + i * this.gridWidth}
            y1={0}
            x2={this.originx + i * this.gridWidth}
            y2={this.canvasHeight}
            stroke="DarkSlateGray"
            strokeWidth="1"
          />
        );
        //vertical lines
        cPlane.push(
          <line
            x1={0}
            y1={this.originy - j * this.gridHeight}
            x2={this.canvasWidth}
            y2={this.originy - j * this.gridHeight}
            stroke="DarkSlateGray"
            strokeWidth="1"
          />
        );
        //notches
        cPlane.push(
          <line
            x1={this.originx + i * this.gridWidth}
            y1={this.originy - 7}
            x2={this.originx + i * this.gridWidth}
            y2={this.originy + 7}
            stroke="DarkSlateGray"
            strokeWidth="5"
          />
        );
        cPlane.push(
          <line
            x1={this.originx - 7}
            y1={this.originy - j * this.gridHeight}
            x2={this.originx + 7}
            y2={this.originy - j * this.gridHeight}
            stroke="DarkSlateGray"
            strokeWidth="5"
          />
        );
      }
    }
    //axes
    cPlane.push(
      <line
        x1={0}
        y1={this.originy}
        x2={this.canvasWidth}
        y2={this.originy}
        stroke="DarkSlateGray"
        strokeWidth="5"
      />
    );
    cPlane.push(
      <line
        x1={this.originx}
        y1={0}
        x2={this.originx}
        y2={this.canvasHeight}
        stroke="DarkSlateGray"
        strokeWidth="5"
      />
    );
    //axis labels
    cPlane.push([
      <text
        x={this.canvasWidth - 18}
        y={this.originy - 9}
        style={{ font: "20px helvetica bold" }}
        className="svgText"
      >
        x
      </text>,
      <text
        x={this.originx + 9}
        y={17}
        style={{ font: "20px helvetica bold" }}
        className="svgText"
      >
        y
      </text>,
    ]);

    //coord plane adjustments
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
    console.log(this.mouseCoords);
    return (
      <div id="cont">
        {/* <div ref={this.myRef}></div> */}

        <div id="coordPlane">
          <svg
            width={this.canvasWidth}
            height={this.canvasHeight}
            style={{ backgroundColor: "FloralWhite" }}
            ref={this.svg}
            onMouseMove={this.changeMouseCoords}
          >
            <g id="planeFrame">{cPlane}</g>
            <g id="planeData">
              <text
                x={this.state.mouseCoords[0] + 5}
                y={this.state.mouseCoords[1] + 15}
                style={{ font: "32px helvetica bold", fontWeight: "bold" }}
                className="svgText"
              >
                (
                {this.customRoundX(
                  this.state.mouseCoords[0],
                  this.gridWidth
                ).toFixed(2)}
                ,
                {
                  -this.customRoundY(
                    this.state.mouseCoords[1],
                    this.gridHeight
                  ).toFixed(2)
                }
                )
              </text>
              <g></g>
            </g>
          </svg>
        </div>
        <div id="vertexBox">
          <div className="box">
            VERTICES
            <ul>{listItems}</ul>
            <button onClick={onClickVert}>Clear</button>
          </div>
          <div className="box">
            EXTERIOR ANGLES
            <ul>{extAnglesList}</ul>
          </div>
          <div className="box">
            INTERIOR ANGLES
            <ul>{intAnglesList}</ul>
          </div>
          <div className="box">
            LINE LENGTHS
            <ul>{lineLenList}</ul>
          </div>
          <div className="box">
            LINE SLOPES
            <ul>{lineSlopeList}</ul>
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
