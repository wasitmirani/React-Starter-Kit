export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGIN_FAILED: 'Invalid email or password.',
    LOGOUT_SUCCESS: 'You have been logged out.',
    REGISTER_SUCCESS: 'Account created successfully.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  },
  COMMON: {
    LOADING: 'Loading...',
    SAVE_SUCCESS: 'Saved successfully.',
    SAVE_FAILED: 'Something went wrong. Please try again.',
    DELETE_CONFIRM: 'Are you sure you want to delete this item?',
  },
  PRODUCTS: {
    CREATE_SUCCESS: 'Product created successfully.',
    UPDATE_SUCCESS: 'Product updated successfully.',
    DELETE_SUCCESS: 'Product deleted successfully.',
  },
} as const
