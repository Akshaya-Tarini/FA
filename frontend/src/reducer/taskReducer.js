export const TASK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_TASKS: 'SET_TASKS',
  SET_STATS: 'SET_STATS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTER: 'SET_FILTER',
  SET_SEARCH: 'SET_SEARCH',
  SET_SYNC_RESULT: 'SET_SYNC_RESULT',
};

export const taskInitialState = {
  tasks: [],
  stats: null,
  loading: false,
  error: null,
  filter: { status: '', priority: '' },
  searchQuery: '',
  syncResult: null,
  pagination: null,
};

export const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case TASK_ACTIONS.SET_TASKS:
      return {
        ...state,
        tasks: action.payload.data,
        pagination: action.payload.pagination || null,
        loading: false,
        error: null,
      };

    case TASK_ACTIONS.SET_STATS:
      return { ...state, stats: action.payload, loading: false };

    case TASK_ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        loading: false,
      };

    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t._id === action.payload._id ? action.payload : t
        ),
        loading: false,
      };

    case TASK_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((t) => t._id !== action.payload),
        loading: false,
      };

    case TASK_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case TASK_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case TASK_ACTIONS.SET_FILTER:
      return { ...state, filter: { ...state.filter, ...action.payload } };

    case TASK_ACTIONS.SET_SEARCH:
      return { ...state, searchQuery: action.payload };

    case TASK_ACTIONS.SET_SYNC_RESULT:
      return { ...state, syncResult: action.payload, loading: false };

    default:
      return state;
  }
};
