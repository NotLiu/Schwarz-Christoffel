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
            count:0
        };
    }

    Sketch = (p) => {
        let x = 100;
        let y = 100;

        p.setup = () => {
            p.createCanvas(200,200);
        }
   
        p.draw = () => {
            p.background(0);
            p.fill(255);
            p.rect(x,y,50,50);
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