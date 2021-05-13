// frontend/src/index.js
import React from "react";
import ReactDOM, { render } from "react-dom";
// import Sketch from 'react-p5';
import axios from "axios";
import Cookies from "js-cookie";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

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
      planePlotVertices: [],
      plotTooltip: [],
      dataHover: null,
      hoverStart: [],
      hoverState: false,
      flowLines: [],
      lambda: [],
      Is: [],
      IRatios: [],
      unitCircleOrigin: [],
    };

    this.dataStr = "data:text/json;charset=utf-8,";
    this.dlName = "vertices.json";
    this.canvasWidth = 630;
    this.canvasHeight = 630;
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

    this.hoveredPolyLine = null;
    (this.tempCircle = null),
      //if they min and max coordinates are same sign, fix starting coord
      (this.startGridV = this.state.gridSize[0]);
    this.startGridX = this.state.gridSize[2];

    this.endGridV = this.state.gridSize[1];
    this.endGridX = this.state.gridSize[3];

    this.svg = React.createRef();
    this.tooltip = React.createRef();

    this.setX = null;
    this.setY = null;

    this.hoverSelect = null;
    this.changeDataID = null;
    this.changeDataLast = null;
    this.changeDataLasttwo = null;

    //bind functions
    this.changeMouseCoords = this.changeMouseCoords.bind(this);
    this.customRoundX = this.customRoundX.bind(this);
    this.customRoundY = this.customRoundY.bind(this);
    this.mouseClicked = this.mouseClicked.bind(this);
    this.vertexPlotConversionX = this.vertexPlotConversionX.bind(this);
    this.vertexPlotConversionY = this.vertexPlotConversionY.bind(this);
    this.plotVertices = this.plotVertices.bind(this);
    this.plotPolygon = this.plotPolygon.bind(this);
    this.plotToolTip = this.plotToolTip.bind(this);
    this.delToolTip = this.delToolTip.bind(this);
    this.changeCanvasWidth = this.changeCanvasWidth.bind(this);
    this.changeCanvasHeight = this.changeCanvasHeight.bind(this);
    this.changeLimit = this.changeLimit.bind(this);
    this.submitVertex = this.submitVertex.bind(this);
    this.pushVert = this.pushVert.bind(this);
    this.onClickVert = this.onClickVert.bind(this);
    this.setHoverStateTrue = this.setHoverStateTrue.bind(this);
    this.setHoverStateFalse = this.setHoverStateFalse.bind(this);

    this.plotPolygonLines = this.plotPolygonLines.bind(this);
    this.handleChangeData = this.handleChangeData.bind(this);
    this.removeVertex = this.removeVertex.bind(this);
    this.hoverLine = this.hoverLine.bind(this);
    this.stopHoverLine = this.stopHoverLine.bind(this);
    this.insertOnLine = this.insertOnLine.bind(this);

    //file functions
    this.writeVFile = this.writeVFile.bind(this);
    this.uploadVFile = this.uploadVFile.bind(this);

    //calculate sc
    this.calculateSC = this.calculateSC.bind(this);
    this.calculateFlow = this.calculateFlow.bind(this);
    this.generateFlow = this.generateFlow.bind(this);
    this.plotUnitCircleOrigin = this.plotUnitCircleOrigin.bind(this);
    this.setUnitCircleOrigin = this.setUnitCircleOrigin.bind(this);
    this.plotUnitCircle = this.plotUnitCircle.bind(this);

    this.calculateButtonC = "rgb(107, 199, 142)";
    this.calculateButtonT = "CALCULATE MAPPING";

    //refresh
    this.refresh = this.refresh.bind(this);

    //flags
    this.ttFlag = false; //only show tt after moving mouse, therefore allowing data to be loaded in first
  }

  setUnitCircleOrigin() {
    this.calculateButtonC = "rgb(223, 191, 85)";
    this.calculateButtonT = "CALCULATING";
    const unitCircleOrigin = [...this.state.unitCircleOrigin];

    const ux = 31.5 * 1.8 + 0 * 31.5 * 1.5;
    const uy = this.canvasHeight - 31.5 * 1.8 + 0 * 1.5 * 31.5;

    unitCircleOrigin[0] = (this.state.mouseCoords[0] - ux) / 47.25;
    unitCircleOrigin[1] = (uy - this.state.mouseCoords[1]) / 47.25;

    console.log(this.state.mouseCoords[1]);
    console.log(uy);

    this.setState({ flowLines: [] });
    this.setState({ unitCircleOrigin }, () => {
      this.calculateFlow();
    });
  }

  plotUnitCircleOrigin() {
    if (this.state.unitCircleOrigin.length > 0) {
      return (
        <circle
          cx={31.5 * 1.8 + this.state.unitCircleOrigin[0] * 31.5 * 1.5}
          cy={
            this.canvasHeight -
            31.5 * 1.8 -
            this.state.unitCircleOrigin[1] * 1.5 * 31.5
          }
          r={5}
          fill="red"
          pointerEvents="none"
        ></circle>
      );
    }
  }

  plotUnitCircle() {
    if (this.state.unitCircleOrigin.length > 0) {
      return (
        <g>
          <circle
            id="unitCircle"
            cx={31.5 * 1.8}
            cy={this.canvasHeight - 31.5 * 1.8}
            r={31.5 * 1.5}
            fill="darkseagreen"
            stroke="darkslategrey"
            strokeWidth="2px"
            onClick={this.setUnitCircleOrigin}
          />
          <circle
            cx={31.5 * 1.8}
            cy={this.canvasHeight - 31.5 * 1.8}
            r={2}
            fill="darkslategrey"
            pointerEvents="none"
          ></circle>
        </g>
      );
    } else {
      return;
    }
  }

  generateFlow(coords) {
    try {
      let flowLines = [...this.state.flowLines];
      for (let i = 0; i < coords.length; i++) {
        let pathD = [];

        if (coords[i][0].includes("+")) {
          pathD.push(
            "M " +
              this.vertexPlotConversionX(
                Number(coords[i][0].slice(1, -2).split("+")[0])
              ) +
              " " +
              this.vertexPlotConversionY(
                Number(coords[i][0].slice(1, -2).split("+")[1])
              ) +
              " "
          );
        } else if (coords[i][0].slice(3, -2).includes("-")) {
          if (coords[i][0][1] == "-") {
            pathD.push(
              "M " +
                this.vertexPlotConversionX(
                  Number("-" + coords[i][0].slice(1, -2).split("-")[1])
                ) +
                " " +
                this.vertexPlotConversionY(
                  Number("-" + coords[i][0].slice(1, -2).split("-")[2])
                ) +
                " "
            );
          } else {
            pathD.push(
              "M " +
                this.vertexPlotConversionX(
                  Number(coords[i][0].slice(1, -2).split("-")[0])
                ) +
                " " +
                this.vertexPlotConversionY(
                  Number("-" + coords[i][0].slice(1, -2).split("-")[1])
                ) +
                " "
            );
          }
        }

        for (let j = 2; j < coords[i].length - 1; j++) {
          let pathCoord = [];

          if (coords[i][j].includes("+")) {
            pathCoord = coords[i][j].slice(1, -2).split("+");
          } else if (coords[i][j].slice(3, -2).includes("-")) {
            if (coords[i][j][1] == "-") {
              pathCoord = coords[i][j].slice(1, -2).split("-");
              pathCoord[0] = "-" + pathCoord[1];
              pathCoord[1] = "-" + pathCoord[2];
            } else {
              pathCoord = coords[i][j].slice(1, -2).split("-");
              pathCoord[1] = "-" + pathCoord[1];
            }
          }
          pathCoord[0] = this.vertexPlotConversionX(Number(pathCoord[0]));
          pathCoord[1] = this.vertexPlotConversionY(Number(pathCoord[1]));

          pathD.push("L " + pathCoord[0] + " " + pathCoord[1] + " ");
        }
        // pathD.push("Z");

        // console.log(coords[i]);
        // console.log("+++++++++++++++++");
        // console.log(pathD);

        let path = <path className="flowLine" d={pathD.join(" ")}></path>;
        flowLines.push(path);
        this.setState({ flowLines }, () => {
          flowLines = [...this.state.flowLines];
          // console.log(this.state.flowLines);
          this.calculateButtonC = "rgb(107, 199, 142)";
          this.calculateButtonT = "CALCULATE MAPPING";
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async calculateFlow() {
    try {
      let unitAlpha = "(0+0j)";
      if (this.state.unitCircleOrigin[1] >= 0) {
        unitAlpha =
          String(this.state.unitCircleOrigin[0]) +
          "+" +
          String(this.state.unitCircleOrigin[1]) +
          "j";
      } else {
        unitAlpha =
          String(this.state.unitCircleOrigin[0]) +
          String(this.state.unitCircleOrigin[1]) +
          "j";
      }

      console.log(unitAlpha);
      const flow = await axios.post(
        "/getflow",
        { alpha: unitAlpha },
        { headers: { dataType: "json" } }
      );

      console.log(flow);

      this.generateFlow(flow.data.flowLines);
    } catch (err) {
      console.log(err);
    }
  }

  async calculateSC() {
    if (this.state.vertices.length >= 3) {
      this.calculateButtonC = "rgb(223, 191, 85)";
      this.calculateButtonT = "CALCULATING";
      try {
        this.setState({ lambda: ["CALCULATING"] });
        this.setState({ Is: ["CALCULATING"] });
        this.setState({ IRatios: ["CALCULATING"] });
        if (this.state.unitCircleOrigin.length == 0) {
          this.setState({ unitCircleOrigin: [0, 0] });
        }
        const sc = await axios.post(
          "/getsc",
          { vertices: this.state.vertices },
          {
            headers: { dataType: "json" },
          }
        );

        this.setState({ lambda: sc.data.lambda });
        this.setState({ Is: sc.data.Is });
        this.setState({ IRatios: sc.data.IRatios });
        this.calculateFlow();
      } catch (err) {
        console.log(err);
      }
    }
  }

  writeVFile() {
    const jsonContent = JSON.stringify([...this.state.vertices]);
    this.dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(jsonContent);
  }

  uploadVFile(e) {
    this.onClickVert();
    const f = new FileReader();
    f.readAsText(e.target.files[0], "UTF-8");
    f.onload = (e) => {
      const tempArray = e.target.result
        .replaceAll("[", "")
        .replaceAll("]", "")
        .replaceAll('"', "")
        .split(",");

      this.refresh(tempArray, true);
    };
  }

  handleChangeData(e) {
    //hover
    const tempArray = [...this.state.vertices];

    this.changeDataID = Number(e.target.name.slice(0, -1));
    const data = e.nativeEvent.data;

    if (
      data == "-" ||
      data == "." ||
      data == null ||
      Number.isInteger(Number(data))
    ) {
      if (e.target.name[e.target.name.length - 1] == "A") {
        if (data != null) {
          if (tempArray[this.changeDataID][0] == 0 && data == "-") {
            tempArray[this.changeDataID][0] = "-";
          } else {
            if (this.changeDataLast == ".") {
              if (this.changeDataLasttwo == "-") {
                tempArray[this.changeDataID][0] =
                  "-" + String(tempArray[this.changeDataID][0]) + "." + data;
              } else {
                tempArray[this.changeDataID][0] =
                  String(tempArray[this.changeDataID][0]) + "." + data;
              }
            } else if (this.changeDataLast == "-" && data == ".") {
              tempArray[this.changeDataID][0] = "-0.";
            } else {
              tempArray[this.changeDataID][0] =
                String(tempArray[this.changeDataID][0]) + data;
            }
          }
        } else {
          if (String(tempArray[this.changeDataID][0]).length < 1) {
            tempArray[this.changeDataID][0] = "0";
          } else {
            tempArray[this.changeDataID][0] = String(
              tempArray[this.changeDataID][0]
            ).slice(0, -1);
          }
        }
      } else {
        if (data != null) {
          if (tempArray[this.changeDataID][1] == 0 && data == "-") {
            tempArray[this.changeDataID][1] = "-";
          } else {
            if (this.changeDataLast == ".") {
              if (this.changeDataLasttwo == "-") {
                tempArray[this.changeDataID][0] =
                  "-" + String(tempArray[this.changeDataID][0]) + "." + data;
              } else {
                tempArray[this.changeDataID][0] =
                  String(tempArray[this.changeDataID][0]) + "." + data;
              }
            } else {
              tempArray[this.changeDataID][1] =
                String(tempArray[this.changeDataID][1]) + data;
            }
          }
        } else {
          if (String(tempArray[this.changeDataID][1]).length < 1) {
            tempArray[this.changeDataID][1] = "0";
          } else {
            tempArray[this.changeDataID][1] = String(
              tempArray[this.changeDataID][1]
            ).slice(0, -1);
          }
        }
      }
    }

    this.setState({ vertices: tempArray }, () => {
      if (
        this.state.vertices[this.changeDataID][0] != "-" &&
        this.state.vertices[this.changeDataID][1] != "-"
      ) {
        this.refresh(this.state.vertices);
      }
      this.changeDataLasttwo = this.changeDataLast;
      this.changeDataLast = data;
    });
  }

  refresh(vert = [], b = false) {
    if (this.state.IRatios != []) {
      this.setState({ IRatios: [] });
      this.setState({ Is: [] });
      this.setState({ flowLines: [] });
      this.setState({ lamda: [] });
      this.setState({ unitCircleOrigin: [] });
    }
    const vertices = [];
    if (vert != [] && b) {
      for (let i = 0; i < vert.length; i += 2) {
        let tempVert = [Number(vert[i]), Number(vert[i + 1])];

        vertices.push(tempVert);
        this.plotVertices(tempVert);
      }
    } else if (vert != []) {
      for (let i = 0; i < vert.length; i++) {
        let tempVert = [Number(vert[i][0]), Number(vert[i][1])];

        vertices.push(tempVert);
        if (!this.state.hoverState && this.changeDataID == null) {
          this.plotVertices(tempVert);
        }
      }
      if (this.changeDataID != null) {
        let selVert = [
          Number(vert[this.changeDataID][0]),
          Number(vert[this.changeDataID][1]),
        ];
        this.plotVertices(selVert, true);
      }

      if (this.state.hoverState) {
        let selVert = [
          Number(vert[this.hoverSelect][0]),
          Number(vert[this.hoverSelect][1]),
        ];

        this.plotVertices(selVert, true);
      }
    } else {
      vertices = this.state.vertices;
    }

    this.getPolyData(vertices);
    this.setState({ vertices }, () => {
      this.writeVFile();
    });
  }

  async getPolyData(vertices) {
    try {
      if (this.state.IRatios != []) {
        this.setState({ IRatios: [] });
        this.setState({ Is: [] });
        this.setState({ flowLines: [] });
        this.setState({ lamda: [] });
        this.setState({ unitCircleOrigin: [] });
      }
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
      // console.log(angleSignal.data);
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
    return vertex * this.gridWidth + this.originx + xSep;
  }

  vertexPlotConversionY(vertex, ySep = 0) {
    return -vertex * this.gridHeight + this.originy + ySep;
  }

  pushVert(vx, vy) {
    // //flag to make sure data is set before rendering
    // this.setState({ polygon: false });
    //add new vertices;
    this.ttFlag = false;
    let new_vert = [
      Number(this.customRoundX(vx, this.gridWidth).toFixed(2)),
      Number(-this.customRoundY(vy, this.gridHeight).toFixed(2)),
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
      vx < this.canvasWidth &&
      vx > 0 &&
      vy > 0 &&
      vy < this.canvasHeight
    ) {
      // create duplicate of state array and append new vertex
      const vertices = [...this.state.vertices, new_vert];

      this.getPolyData(vertices);
      this.setState({ vertices }, () => {
        this.writeVFile();
      });
    }

    this.plotVertices(new_vert);
  }

  mouseClicked(event) {
    if (event.target.tagName == "svg") {
      this.pushVert(this.state.mouseCoords[0], this.state.mouseCoords[1]);
    } else {
      this.setHoverStateTrue();
      const currMC = [this.state.mouseCoords[0], this.state.mouseCoords[1]];
      this.setState({ hoverStart: currMC });
      this.hoverSelect = event.target.id;

      if (event.target.tagName == "rect") {
        this.delToolTip();
      }
    }
  }

  setHoverStateFalse() {
    this.setState({ hoverState: false });
  }
  setHoverStateTrue() {
    this.setState({ hoverState: true });
  }

  changeMouseCoords(evt) {
    // console.log(this.svg.current);
    this.ttFlag = true;
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

    if (this.state.hoverState) {
      const temp = [...this.state.vertices];

      temp[this.hoverSelect] = [
        Number(this.customRoundX(mouseCoords[0], this.gridWidth).toFixed(2)),
        Number(-this.customRoundY(mouseCoords[1], this.gridHeight).toFixed(2)),
      ];
      this.refresh(temp);
    }

    if (this.state.vertices.length > 0 && this.tooltip.current != null) {
      if (
        cursorpt.x < parseFloat(this.tooltip.current.x) ||
        cursorpt.x >
          parseFloat(this.tooltip.current.x) +
            parseFloat(this.tooltip.current.width) ||
        cursorpt.y < parseFloat(this.tooltip.current.y) ||
        cursorpt.y >
          parseFloat(this.tooltip.current.y) +
            parseFloat(this.tooltip.current.height)
      ) {
        this.delToolTip();
      }
    }
  }

  plotPolygon() {
    const vertexList = [];
    for (let i = 0; i < this.state.vertices.length; i++) {
      vertexList.push(
        this.vertexPlotConversionX(this.state.vertices[i][0]) +
          "," +
          this.vertexPlotConversionY(this.state.vertices[i][1])
      );
    }
    return vertexList.join(" ");
  }

  plotPolygonLines() {
    if (this.state.vertices.length > 2) {
      const lineList = [];
      let fillColor = "darkseagreen";
      let strokeSize = "2";

      for (let i = 0; i < this.state.vertices.length - 1; i++) {
        lineList.push(
          <line
            x1={this.vertexPlotConversionX(this.state.vertices[i][0])}
            y1={this.vertexPlotConversionY(this.state.vertices[i][1])}
            x2={this.vertexPlotConversionX(this.state.vertices[i + 1][0])}
            y2={this.vertexPlotConversionY(this.state.vertices[i + 1][1])}
            fill={fillColor}
            stroke="darkslategrey"
            strokeWidth={strokeSize}
            id={"l" + String(i)}
            className="polygonLine"
            onMouseEnter={this.hoverLine}
            onMouseMove={this.hoverLine}
            onMouseLeave={this.stopHoverLine}
            onClick={this.insertOnLine}
          />
        );
      }
      lineList.push(
        <line
          x1={this.vertexPlotConversionX(
            this.state.vertices[this.state.vertices.length - 1][0]
          )}
          y1={this.vertexPlotConversionY(
            this.state.vertices[this.state.vertices.length - 1][1]
          )}
          x2={this.vertexPlotConversionX(this.state.vertices[0][0])}
          y2={this.vertexPlotConversionY(this.state.vertices[0][1])}
          fill={fillColor}
          stroke="darkslategrey"
          strokeWidth={strokeSize}
          id={"l" + String(this.state.planePlotVertices.length - 1)}
          className="polygonLine"
          onMouseEnter={this.hoverLine}
          onMouseMove={this.hoverLine}
          onMouseLeave={this.stopHoverLine}
          onClick={this.insertOnLine}
        />
      );
      return lineList;
    }
  }

  hoverLine(e) {
    this.hoveredPolyLine = e.target.id;
    const tempCircle = (
      <circle
        cx={this.state.mouseCoords[0]}
        cy={this.state.mouseCoords[1]}
        r={5}
        fill="red"
        id="tempCircle"
        data={
          "(" +
          this.state.mouseCoords[0] +
          ", " +
          this.state.mouseCoords[1] +
          ")"
        }
        pointerEvents="none"
      />
    );
    this.tempCircle = tempCircle;
  }

  stopHoverLine() {
    this.hoveredPolyLine = null;
    this.tempCircle = null;
  }

  insertOnLine() {
    const lineNum = Number(this.hoveredPolyLine.slice(1));
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;

    if (lineNum != this.state.vertices.length - 1) {
      x1 = this.vertexPlotConversionX(this.state.vertices[lineNum][0]);
      x2 = this.vertexPlotConversionX(this.state.vertices[lineNum + 1][0]);
      y1 = this.vertexPlotConversionY(this.state.vertices[lineNum][1]);
      y2 = this.vertexPlotConversionY(this.state.vertices[lineNum + 1][1]);
    } else {
      x1 = this.vertexPlotConversionX(
        this.state.vertices[this.state.vertices.length - 1][0]
      );
      x2 = this.vertexPlotConversionX(this.state.vertices[0][0]);
      y1 = this.vertexPlotConversionY(
        this.state.vertices[this.state.vertices.length - 1][1]
      );
      y2 = this.vertexPlotConversionY(this.state.vertices[0][1]);
    }

    const slope = (y2 - y1) / (x2 - x1);
    const deltay = this.state.mouseCoords[1] - y1;
    const deltax = deltay / slope;

    const currX = deltax + x1;

    const newVert = [
      Number(this.customRoundX(currX, this.gridWidth).toFixed(2)),
      Number(
        -this.customRoundY(this.state.mouseCoords[1], this.gridHeight).toFixed(
          2
        )
      ),
    ];

    const vertices = [...this.state.vertices];

    vertices.splice(lineNum + 1, 0, newVert);

    this.setState({ planePlotVertices: [] });
    this.setState({ vertices }, () => {
      this.refresh(this.state.vertices);
    });
  }

  plotVertices(vert, changeState = false) {
    let planePlotVertices = [];
    if (changeState) {
      let temp = [...this.state.planePlotVertices];

      if (this.state.hoverState) {
        temp[this.hoverSelect] = (
          <circle
            cx={this.vertexPlotConversionX(vert[0])}
            cy={this.vertexPlotConversionY(vert[1])}
            r={4}
            fill="darkslategrey"
            className={"vertex" + " vertex" + this.hoverSelect}
            id={this.hoverSelect}
            data={"(" + vert[0] + ", " + vert[1] + ")"}
            onMouseEnter={this.plotToolTip}
          />
        );
      } else if (this.changeDataID != null) {
        temp[this.changeDataID] = (
          <circle
            cx={this.vertexPlotConversionX(vert[0])}
            cy={this.vertexPlotConversionY(vert[1])}
            r={4}
            fill="darkslategrey"
            className={"vertex" + " vertex" + this.hoverSelect}
            id={this.changeDataID}
            data={"(" + vert[0] + ", " + vert[1] + ")"}
            onMouseEnter={this.plotToolTip}
          />
        );
      }

      planePlotVertices = temp;
      this.setState({ planePlotVertices });
      // console.log(planePlotVertices);
    } else {
      this.state.planePlotVertices.push(
        <circle
          cx={this.vertexPlotConversionX(vert[0])}
          cy={this.vertexPlotConversionY(vert[1])}
          r={4}
          fill="darkslategrey"
          className={"vertex" + " vertex" + this.state.vertices.length}
          id={this.state.planePlotVertices.length}
          data={"(" + vert[0] + ", " + vert[1] + ")"}
          onMouseEnter={this.plotToolTip}
        />
      );
      planePlotVertices = this.state.planePlotVertices;
      this.setState(planePlotVertices);
    }
  }

  getToolTipData(vert) {
    const ttData = {};

    //fill tooltip data
    ttData.vertex = vert.getAttribute("data");
    if (vert.id != 0) {
      ttData.intAngle = this.state.intAngles[vert.id - 1];
      ttData.extAngle = this.state.extAngles[vert.id - 1];
    } else {
      ttData.intAngle = this.state.intAngles[vert.id];
      ttData.extAngle = this.state.extAngles[vert.id];
    }

    return ttData;
  }

  plotToolTip = (event) => {
    if (
      this.state.vertices.length >= 3 &&
      this.ttFlag == true &&
      !this.state.hoverState
    ) {
      const vertX = this.state.vertices[event.target.id][0];
      const vertY = this.state.vertices[event.target.id][1];

      let left = this.vertexPlotConversionX(vertX) - 10;
      let top = this.vertexPlotConversionY(vertY) - 10;

      const width = 160;
      const height = 150;

      let plotTooltip = this.state.plotTooltip;

      if (vertX < 0 && vertY < 0) {
        top = top - height + 20;
      } else if (vertX > 0 && vertY > 0) {
        left = left - width + 20;
      } else if (vertX > 0 && vertY < 0) {
        left = left - width + 20;
        top = top - height + 20;
      }
      this.state.dataHover = event.target.id;

      plotTooltip.push(
        <rect
          x={left}
          y={top}
          width={width}
          height={height}
          style={{ fill: "darkslategrey", stroke: "black", strokeWidth: "2" }}
          onMouseLeave={this.delToolTip}
          ref={this.tooltip}
          className={event.target.className.baseVal.split(" ")[1]}
          id={event.target.id}
        />
      );

      const ttdata = this.getToolTipData(event.target);

      plotTooltip.push([
        <text
          x={left + 15}
          y={top + 30}
          style={{ font: "20px helvetica bold" }}
          className="svgText"
          fill="floralWhite"
        >
          {String.fromCharCode(65 + parseInt(event.target.id))}: {ttdata.vertex}
        </text>,
        <text
          x={left + 15}
          y={top + 55}
          style={{ font: "20px helvetica bold" }}
          className="svgText"
          fill="floralWhite"
        >
          Exterior Angle:
        </text>,
        <text
          x={left + 15}
          y={top + 80}
          style={{ font: "20px helvetica bold" }}
          className="svgText"
          fill="floralWhite"
        >
          (
          {ttdata.extAngle.slice(0, 5) +
            " " +
            parseFloat(ttdata.extAngle.slice(5)).toFixed(2)}
          )
        </text>,
        <text
          x={left + 15}
          y={top + 105}
          style={{ font: "20px helvetica bold" }}
          className="svgText"
          fill="floralWhite"
        >
          Interior Angle:
        </text>,
        <text
          x={left + 15}
          y={top + 130}
          style={{ font: "20px helvetica bold" }}
          className="svgText"
          fill="floralWhite"
        >
          (
          {ttdata.intAngle.slice(0, 5) +
            " " +
            parseFloat(ttdata.intAngle.slice(5)).toFixed(2)}
          )
        </text>,
      ]);

      this.setState(plotTooltip);
    }
  };

  delToolTip() {
    this.setState({ plotTooltip: [] });
    this.state.dataHover = null;
  }

  //data tabs
  verticesTab(data) {
    return (
      <div>
        VERTICES
        <ul className="dataList">{data}</ul>
      </div>
    );
  }
  extAngleTab(data) {
    return (
      <div>
        EXTERIOR ANGLES
        <ul className="dataList">{data}</ul>
      </div>
    );
  }
  intAngleTab(data) {
    return (
      <div>
        INTERIOR ANGLES
        <ul className="dataList">{data}</ul>
      </div>
    );
  }
  lineLenTab(data) {
    return (
      <div>
        LINE LENGTHS
        <ul className="dataList">{data}</ul>
      </div>
    );
  }
  lineSlopeTab(data) {
    return (
      <div>
        LINE SLOPES
        <ul className="dataList">{data}</ul>
      </div>
    );
  }

  iTab(data) {
    return (
      <div>
        Is
        {data}
      </div>
    );
  }

  iRatioTab(data) {
    return (
      <div>
        I Ratios
        {data}
      </div>
    );
  }
  lambdaTab(data) {
    return (
      <div>
        Lambda
        {data}
      </div>
    );
  }

  changeCanvasWidth(event) {
    let x = 630;
    if (Number.isInteger(Number(event.target.value))) {
      this.canvasWidth = Number(event.target.value);

      this.gridHeight =
        this.canvasHeight /
        (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
      this.gridWidth =
        this.canvasWidth /
        (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));
      this.originx =
        this.canvasWidth *
        (Math.abs(this.state.gridSize[0]) /
          (Math.abs(this.state.gridSize[1]) +
            Math.abs(this.state.gridSize[0])));
      this.originy =
        this.canvasHeight *
        (Math.abs(this.state.gridSize[3]) /
          (Math.abs(this.state.gridSize[3]) +
            Math.abs(this.state.gridSize[2])));
      this.forceUpdate();
    } else {
      console.log("ERROR, INVALID VALUE");
    }
  }

  changeCanvasHeight(event) {
    let y = 630;
    if (Number.isInteger(Number(event.target.value))) {
      this.canvasHeight = Number(event.target.value);
      this.gridHeight =
        this.canvasHeight /
        (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
      this.gridWidth =
        this.canvasWidth /
        (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));
      this.originx =
        this.canvasWidth *
        (Math.abs(this.state.gridSize[0]) /
          (Math.abs(this.state.gridSize[1]) +
            Math.abs(this.state.gridSize[0])));
      this.originy =
        this.canvasHeight *
        (Math.abs(this.state.gridSize[3]) /
          (Math.abs(this.state.gridSize[3]) +
            Math.abs(this.state.gridSize[2])));
      this.forceUpdate();
    } else {
      console.log("ERROR, INVALID VALUE");
    }
  }

  changeLimit(event) {
    const tempGrid = this.state.gridSize;
    if (Number.isInteger(Number(event.target.value))) {
      if (event.target.name == "x1Limit") {
        if (Number(event.target.value) >= 0) {
          tempGrid[0] = 0;
        } else {
          tempGrid[0] = Number(event.target.value);
        }
      } else if (event.target.name == "x2Limit") {
        tempGrid[1] = Number(event.target.value);
      } else if (event.target.name == "y1Limit") {
        if (Number(event.target.value) >= 0) {
          tempGrid[2] = 0;
        } else {
          tempGrid[2] = Number(event.target.value);
        }
      } else if (event.target.name == "y2Limit") {
        tempGrid[3] = Number(event.target.value);
      }
      this.setState({ gridSize: tempGrid });

      this.gridHeight =
        this.canvasHeight /
        (Math.abs(this.state.gridSize[3]) + Math.abs(this.state.gridSize[2]));
      this.gridWidth =
        this.canvasWidth /
        (Math.abs(this.state.gridSize[1]) + Math.abs(this.state.gridSize[0]));
      this.originx =
        this.canvasWidth *
        (Math.abs(this.state.gridSize[0]) /
          (Math.abs(this.state.gridSize[1]) +
            Math.abs(this.state.gridSize[0])));
      this.originy =
        this.canvasHeight *
        (Math.abs(this.state.gridSize[3]) /
          (Math.abs(this.state.gridSize[3]) +
            Math.abs(this.state.gridSize[2])));
      //if they min and max coordinates are same sign, fix starting coord
      this.startGridV = this.state.gridSize[0];
      this.startGridX = this.state.gridSize[2];

      this.endGridV = this.state.gridSize[1];
      this.endGridX = this.state.gridSize[3];

      //coord plane adjustments
      if (
        Math.sign(this.state.gridSize[3]) == Math.sign(this.state.gridSize[2])
      ) {
        this.gridHeight = Math.abs(
          this.canvasHeight /
            (Math.abs(this.state.gridSize[3]) -
              Math.abs(this.state.gridSize[2]))
        );
      }

      if (
        Math.sign(this.state.gridSize[1]) == Math.sign(this.state.gridSize[0])
      ) {
        this.gridWidth = Math.abs(
          this.canvasWidth /
            (Math.abs(this.state.gridSize[1]) -
              Math.abs(this.state.gridSize[0]))
        );
      }

      if (this.state.gridSize[0] > 0) {
        this.originx = 0;
      } else if (this.state.gridSize[1] < 0) {
        this.originx = this.canvasWidth;
      }

      if (this.state.gridSize[2] > 0) {
        this.originy = this.canvasHeight;
      } else if (this.state.gridSize[3] < 0) {
        this.originy = 0;
      }
    } else {
      console.log("ERROR, INVALID VALUE");
    }

    this.forceUpdate();
  }

  submitVertex(event) {
    this.pushVert(
      this.vertexPlotConversionX(this.setX),
      this.vertexPlotConversionY(this.setY)
    );

    event.preventDefault();
  }

  removeVertex(event) {
    const vertices = [...this.state.vertices];
    vertices.splice(Number(event.target.attributes.vindex.value), 1);

    this.setState({ vertices }, () => {
      const points = [...this.state.planePlotVertices];
      points.splice(Number(event.target.attributes.vindex.value), 1);

      this.setState({ planePlotVertices: [] }, () => {
        this.refresh(this.state.vertices);
      });
    });
  }

  componentDidMount() {
    // this.myP5 = new p5(this.Sketch, this.myRef.current);
    //write axios as promise to ensure data from server before continuing
  }

  onClickVert = () => {
    this.setState({ vertices: [] });
    this.setState({ intAngles: [] });
    this.setState({ extAngles: [] });
    this.setState({ lineLengths: [] });
    this.setState({ lineSlopes: [] });
    this.setState({ planePlotVertices: [] });
    this.setState({ IRatios: [] });
    this.setState({ Is: [] });
    this.setState({ flowLines: [] });
    this.setState({ lamda: [] });
    this.setState({ unitCircleOrigin: [] });
  };
  render() {
    const listItems = this.state.vertices.map((vertex, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          <form className="dataForm">
            {String.fromCharCode(65 + index)}: (
            <input
              type="text"
              value={vertex[0]}
              className="dataInputLI"
              name={index + "A"}
              onChange={this.handleChangeData}
            ></input>
            ,
            <input
              type="text"
              value={vertex[1]}
              className="dataInputLI"
              name={index + "B"}
              onChange={this.handleChangeData}
            ></input>
            )
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={this.removeVertex}
              vindex={index}
            ></button>
          </form>
        </li>
      );
    });
    const extAnglesList = this.state.extAngles.map((angle, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          ({angle.slice(0, 5) + parseFloat(angle.slice(5)).toFixed(2)})
        </li>
      );
    });
    const intAnglesList = this.state.intAngles.map((angle, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          ({angle.slice(0, 5) + parseFloat(angle.slice(5)).toFixed(2)})
        </li>
      );
    });
    const lineLenList = this.state.lineLengths.map((len, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          ({len.slice(0, 7) + parseFloat(len.slice(7)).toFixed(2)})
        </li>
      );
    });
    const lineSlopeList = this.state.lineSlopes.map((slope, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          ({slope.slice(0, 7) + parseFloat(slope.slice(7)).toFixed(2)})
        </li>
      );
    });
    const IsList = this.state.Is.map((i, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          {i}
        </li>
      );
    });
    const IRatiosList = this.state.IRatios.map((iRatio, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          {iRatio}
        </li>
      );
    });
    const lambdaList = this.state.lambda.map((lambda, index) => {
      let c = "";
      if (this.state.dataHover == index) {
        c = "dataHover";
      } else {
        c = "data";
      }
      return (
        <li key={index} className={"vertex" + index + " " + c}>
          {lambda}
        </li>
      );
    });

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
            stroke="DarkSeaGreen"
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
            stroke="DarkSeaGreen"
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
            strokeWidth="3"
          />
        );
        cPlane.push(
          <line
            x1={this.originx - 7}
            y1={this.originy - j * this.gridHeight}
            x2={this.originx + 7}
            y2={this.originy - j * this.gridHeight}
            stroke="DarkSlateGray"
            strokeWidth="3"
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
        strokeWidth="3"
      />
    );
    cPlane.push(
      <line
        x1={this.originx}
        y1={0}
        x2={this.originx}
        y2={this.canvasHeight}
        stroke="DarkSlateGray"
        strokeWidth="3"
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

    // console.log(this.mouseCoords);
    return (
      <div>
        <div id="bodySection">
          <div id="cont">
            {/* <div ref={this.myRef}></div> */}

            <div id="coordPlane">
              <svg
                width={this.canvasWidth}
                height={this.canvasHeight}
                style={{ backgroundColor: "FloralWhite" }}
                ref={this.svg}
                onMouseMove={this.changeMouseCoords}
                onMouseDown={this.mouseClicked}
                onMouseUp={this.setHoverStateFalse}
              >
                <g id="planeFrame">{cPlane}</g>
                <g id="planeData">
                  <g>
                    <polygon
                      points={this.plotPolygon()}
                      fill="darkseagreen"
                      stroke="darkslategrey"
                      strokeWidth="2"
                      fillRule="nonzero"
                    />
                    {this.state.flowLines}
                    {this.plotPolygonLines()}
                    {this.tempCircle}
                    {this.plotUnitCircle()}
                    {this.plotUnitCircleOrigin()}
                  </g>
                  <g>{this.state.planePlotVertices}</g>
                  <text
                    x={this.state.mouseCoords[0] + 5}
                    y={this.state.mouseCoords[1] - 5}
                    style={{ font: "20px helvetica bold", fontWeight: "bold" }}
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
                  <g>{this.state.plotTooltip}</g>
                </g>
              </svg>
            </div>
            <div id="settings">
              <Tabs orientation="vertical">
                <TabList>
                  <Tab>Vertices</Tab>
                  <Tab>Exterior Angles</Tab>
                  <Tab>Interior Angles</Tab>
                  <Tab>Line Lengths</Tab>
                  <Tab>Line Slopes</Tab>
                  <Tab>lambda</Tab>
                  <Tab>Is</Tab>
                  <Tab>IRatios</Tab>
                </TabList>

                <TabPanel>
                  <div className="box">{this.verticesTab(listItems)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                <TabPanel>
                  <div className="box">{this.extAngleTab(extAnglesList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                <TabPanel>
                  <div className="box">{this.intAngleTab(intAnglesList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                <TabPanel>
                  <div className="box">{this.lineLenTab(lineLenList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                <TabPanel>
                  <div className="box">{this.lineSlopeTab(lineSlopeList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                {/* sc calculation tabs */}
                <TabPanel>
                  <div className="box">{this.lambdaTab(lambdaList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                <TabPanel>
                  <div className="box">{this.iTab(IsList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>

                <TabPanel>
                  <div className="box">{this.iRatioTab(IRatiosList)}</div>
                  <button onClick={this.onClickVert}>Clear</button>
                </TabPanel>
              </Tabs>
              <div id="coordSettings">
                <div style={{ flexDirection: "column" }}>
                  <form
                    className="setForm"
                    style={{ height: "13em", marginBottom: ".5em" }}
                  >
                    <label>Plane Width</label>
                    <br />
                    <input
                      type="text"
                      name="planeSize"
                      // value={this.canvasWidth}
                      onChange={this.changeCanvasWidth}
                    />
                    <br />
                    <label>Plane Height</label>
                    <br />
                    <input
                      type="text"
                      name="planeSize"
                      // value={this.canvasHeight}
                      onChange={this.changeCanvasHeight}
                    />
                    <br />
                  </form>
                  <form className="file">
                    Import JSON
                    <input
                      type="file"
                      onClick={() => {
                        this.value = null;
                        return false;
                      }}
                      onChange={this.uploadVFile}
                    ></input>
                  </form>
                </div>
                <form className="setForm">
                  <label>(-)X Limit</label>
                  <br />
                  <input
                    type="text"
                    name="x1Limit"
                    onChange={this.changeLimit}
                  ></input>
                  <br></br>
                  <label>(+)X Limit</label>
                  <br></br>
                  <input
                    type="text"
                    name="x2Limit"
                    onChange={this.changeLimit}
                  ></input>
                  <br></br>
                  <label>(-)Y Limit</label>
                  <br></br>
                  <input
                    type="text"
                    name="y1Limit"
                    onChange={this.changeLimit}
                  ></input>
                  <br></br>
                  <label>(+)Y Limit</label>
                  <br></br>
                  <input
                    type="text"
                    name="y2Limit"
                    onChange={this.changeLimit}
                  ></input>
                  <br></br>
                </form>
                <div style={{ flexDirection: "column" }}>
                  <form
                    className="setForm"
                    onSubmit={this.submitVertex}
                    style={{
                      height: "13em",
                      marginBottom: ".5em",
                      marginRight: "0",
                    }}
                  >
                    <label>Input Vertex</label>
                    <br></br>
                    <label className="vertexLabel">X</label>
                    <input
                      type="text"
                      name="X"
                      style={{ width: "6em" }}
                      // value={this.canvasWidth}
                      onChange={(event) => {
                        this.setX = event.target.value;
                      }}
                    />
                    <br />
                    <label className="vertexLabel">Y</label>
                    <input
                      type="text"
                      name="Y"
                      style={{ width: "6em" }}
                      className="inputVertText"
                      // value={this.canvasHeight}
                      onChange={(event) => {
                        this.setY = event.target.value;
                      }}
                    />
                    <br />
                    <input type="submit" value="submit" />
                  </form>
                  <div className="file">
                    Export JSON
                    <a id="download" href={this.dataStr} download={this.dlName}>
                      DOWNLOAD
                    </a>
                  </div>
                </div>
              </div>
              <div id="calculateSC">
                <button
                  type="button"
                  onClick={this.calculateSC}
                  style={{ backgroundColor: this.calculateButtonC }}
                >
                  {this.calculateButtonT}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div id="infoSectionFlex">
          <div id="infoSection">
            <h1>
              Web-App for the Visualization of Schwarz-Christoffel Mapping
            </h1>
            <h3 id="intro">Introduction</h3>
            <p>
              Conformal mapping is a core concept in complex analysis, and has
              many applications outside the realm of pure mathematics.
              Specifically, the Schwarz-Christoffel transformation method deals
              with mapping half-planes onto closed polygons, with applications
              in various fields including: physics, fluid dynamics, minimal
              surfaces, etc. The only known computational toolkit for computing
              this mapping method only exists as a MATLAB implementation, which
              stands as a barrier to general use. We hope to create a web-app
              implementation that visualizes Schwarz-Christoffel Mapping and
              provide an easy-to-use Web API to make it more accessible to users
              everywhere. Initially, we had no foundations of complex analysis,
              so our first step towards realizing this project was to research
              the various approaches and steps to solving conformal mapping,
              Schwarz-Christoffel mapping in particular. First, we explored the
              basics of the field of complex analysis to gain an understanding
              of the field we were working in. From there we were guided to a
              report documenting the basic procedure of computing the
              Schwarz-Christoffel transformation dating back to the 1990s. With
              this detailed exploration of the procedure, we then researched the
              various terms and methods used in the calculation such as the
              Gauss-Jacobi Quadrature and Newton-Rhapson Method. Finally, we
              delved into the only existing modern implementation of the
              Schwarz-Christoffel transformation.
            </p>
            <h2 id="process"></h2>
            <h2 id="ref">Related Works</h2>
            <ul>
              <li>
                <h3>Conformal Mapping</h3>
              </li>
              <li>
                <h3>Riemann Mapping Theorem</h3>
              </li>
              <li>
                <h3>Schwarz-Christoffel Transformation</h3>
              </li>
              <li>
                <h3>Toby Driscoll's MATLAB Toolbox</h3>
              </li>
              <li>
                <h3>Newton-Raphson Method</h3>
              </li>
              <li>
                <h3>Gauss-Jacobi Quadrature</h3>
              </li>
            </ul>
            <h2 id="authors">Authors</h2>
            <ul>
              <li>Andrew Liu</li>
              <li>Zane Fadul</li>
            </ul>
            <h2 id="thanks">Special Thanks</h2>
            Special thanks to the following for guiding and supporting us
            through the process of this project:
            <ul>
              <li>Pedro Salomo</li>
              <li>Irith Hartman</li>
              <li>Toby Driscoll</li>
              <li>Olivier Marin</li>
              <li>Li Guo</li>
            </ul>
          </div>
          <div id="infoNavigator">
            <ul id="navigationList">
              <li>
                <a className="sectionLink" href="#intro">
                  Introduction
                </a>
              </li>
              <li>
                <a className="sectionLink" href="#process">
                  Process
                </a>
              </li>
              <li>
                <a className="sectionLink" href="#ref">
                  Related Works
                </a>
              </li>
              <li>
                <a className="sectionLink" href="#authors">
                  Authors
                </a>
              </li>
              <li>
                <a className="sectionLink" href="#thanks">
                  Special Thanks
                </a>
              </li>
            </ul>
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
