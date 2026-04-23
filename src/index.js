import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ต้องดึง App.jsx มาใช้งาน

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);