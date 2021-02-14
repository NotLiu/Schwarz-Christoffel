  
// frontend/src/index.js
import React from 'react'
import ReactDOM from 'react-dom'
// import Sketch from 'react-p5';
import sketch from 'p5';
import App from './App';

// Mount the app to the mount point.
const root = document.getElementById('app')
ReactDOM.render(React.createElement(App, null, null), root)