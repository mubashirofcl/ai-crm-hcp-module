import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import LogInteractionPage from './components/LogInteraction/LogInteractionPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="app-container">
        <div className="main-content">
          <LogInteractionPage />
        </div>
      </div>
    </Provider>
  );
}

export default App;
