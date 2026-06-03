import React from 'react-dom';
import App from './App';

const root = document.getElementById('root');
if (root) {
  const root_obj = ReactDOM.createRoot(root);
  root_obj.render(<App />);
}
