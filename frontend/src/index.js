// frontend/src/index.js
import React from 'react'
import ReactDOM from 'react-dom'
// import Sketch from 'react-p5';
import sketch from 'p5';

// Define the React app
const App = () => {
  const [count, setCount] = React.useState(0)
  const onClick = () => setCount(c => c + 1)
  return React.createElement('div', null,
    <div>
        <h1>Zane has {count} moms</h1>
        <button onClick={onClick}>Add mom</button>
    </div>
  )
}
// Mount the app to the mount point.
const root = document.getElementById('app')
ReactDOM.render(React.createElement(App, null, null), root)