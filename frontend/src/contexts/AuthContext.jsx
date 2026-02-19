import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        const token = authService.getCurrentToken();
        if (token) {
            // Fetch user data
            profileService.getMe()
                .then((data) => {
                    setUser(data);
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    // Token invalid, clear everything
                    authService.logout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        // Fetch user data after login
        const userData = await profileService.getMe();
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const register = async (userData) => {
        return await authService.register(userData);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
