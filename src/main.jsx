import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import './tokens.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './ag-grid-theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
