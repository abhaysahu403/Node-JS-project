import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (root) {
  const rootObj = ReactDOM.createRoot(root);
  rootObj.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
