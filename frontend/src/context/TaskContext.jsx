import { createContext, useReducer, useCallback } from 'react';
import { taskReducer, taskInitialState, TASK_ACTIONS } from '../reducer/taskReducer';
import api from '../services/api';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, taskInitialState);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.priority) query.set('priority', params.priority);
      if (params.page) query.set('page', params.page);

      const res = await api.get(`/tasks?${query.toString()}`);
      dispatch({
        type: TASK_ACTIONS.SET_TASKS,
        payload: { data: res.data.data, pagination: res.data.pagination },
      });
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Failed to fetch tasks' });
    }
  }, []);

  const searchTasks = useCallback(async (query) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await api.get(`/tasks/search?q=${encodeURIComponent(query)}`);
      dispatch({
        type: TASK_ACTIONS.SET_TASKS,
        payload: { data: res.data.data },
      });
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Search failed' });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/stats');
      dispatch({ type: TASK_ACTIONS.SET_STATS, payload: res.data.data });
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Failed to fetch stats' });
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await api.post('/tasks', taskData);
      dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: res.data.data });
      return true;
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Failed to create task' });
      return false;
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: res.data.data });
      return true;
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Failed to update task' });
      return false;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
    try {
      await api.delete(`/tasks/${id}`);
      dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: id });
      return true;
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Failed to delete task' });
      return false;
    }
  }, []);

  const syncData = useCallback(async () => {
    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await api.post('/sync');
      dispatch({ type: TASK_ACTIONS.SET_SYNC_RESULT, payload: res.data });
      return res.data;
    } catch (err) {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: err.response?.data?.message || 'Sync failed' });
      return null;
    }
  }, []);

  const setFilter = useCallback((filter) => {
    dispatch({ type: TASK_ACTIONS.SET_FILTER, payload: filter });
  }, []);

  const setSearch = useCallback((query) => {
    dispatch({ type: TASK_ACTIONS.SET_SEARCH, payload: query });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: TASK_ACTIONS.CLEAR_ERROR });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchTasks,
        searchTasks,
        fetchStats,
        createTask,
        updateTask,
        deleteTask,
        syncData,
        setFilter,
        setSearch,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
