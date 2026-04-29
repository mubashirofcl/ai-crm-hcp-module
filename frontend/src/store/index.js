import { configureStore } from '@reduxjs/toolkit';
import interactionReducer from './interactionSlice';
import agentReducer from './agentSlice';

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

const store = configureStore({
  reducer: {
    interactions: interactionReducer,
    agent: agentReducer,
  },
});

export default store;
