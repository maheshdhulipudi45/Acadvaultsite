import { createContext, useState, useEffect, useContext } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // Function declarations first
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const fetchNotifications = async () => {
    try {
      const response = await userService.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await userService.getBookmarks();
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (resourceId) => {
    if (!user) return { success: false, loginRequired: true };
    try {
      const response = await userService.toggleBookmark(resourceId);
      await fetchBookmarks();
      return { success: true, bookmarked: response.data.bookmarked };
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return { success: false, message: 'Could not update bookmark.' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token: userToken, ...userData } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await authService.signup(signupData);
      const { token: userToken, ...userData } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
      };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.',
      };
    }
  };

  // useEffect hooks last
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          // Verify with server to keep profile fresh
          const response = await authService.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync bookmarks and notifications when user is authenticated
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      fetchBookmarks();
    } else {
      setNotifications([]);
      setBookmarks([]);
    }
  }, [user, token]);

  const value = {
    user,
    token,
    loading,
    notifications,
    bookmarks,
    login,
    signup,
    logout,
    updateUserProfile,
    fetchNotifications,
    fetchBookmarks,
    toggleBookmark,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
