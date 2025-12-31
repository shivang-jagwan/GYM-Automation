import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { setAuthToken } from './api/axios';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import AddEditMember from './pages/AddEditMember';
import Broadcast from './pages/Broadcast';

function getTokenFromStorage() {
  return localStorage.getItem('authToken');
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token = getTokenFromStorage();
    if (token) {
      setAuthToken(token);
      return true;
    }
    return false;
  });

  const handleLogin = (token) => {
    setAuthToken(token);
    setAuth(true);
    localStorage.setItem('isAuth', '1');
    localStorage.setItem('authToken', token);
  };
  const handleLogout = () => {
    setAuth(false);
    localStorage.removeItem('isAuth');
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route 
          path="/login" 
          element={auth ? <Navigate to="/dashboard" /> : <Login setAuth={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            auth ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/members" 
          element={
            auth ? (
              <Layout onLogout={handleLogout}>
                <Members />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/members/add" 
          element={
            auth ? (
              <Layout onLogout={handleLogout}>
                <AddEditMember />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/members/edit/:id" 
          element={
            auth ? (
              <Layout onLogout={handleLogout}>
                <AddEditMember />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/broadcast" 
          element={
            auth ? (
              <Layout onLogout={handleLogout}>
                <Broadcast />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
