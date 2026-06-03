import React, { createContext, useReducer, useEffect } from 'react';
import { authReducer } from '../reducer/authReducer';
import api from '../services/api';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const AuthContext = createContext(initialState);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: res.data.data, token: res.data.data.token },
        });
        return { success: true };
      }
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: err.response?.data?.message || 'Login failed',
      });
      return { success: false, message: err.response?.data?.message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
