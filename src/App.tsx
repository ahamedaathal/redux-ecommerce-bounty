import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import Header from './components/Header';
import AppRoutes from './AppRoutes';
import { setCredentials } from './store/slices/authSlice';
import { loadState } from './utils/localStorage';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const authState = loadState();
    if (authState && authState.token && authState.user) {
      dispatch(setCredentials(authState));
    }
  }, [dispatch]);

  return (
    <>
      <Header />
      <AppRoutes />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;