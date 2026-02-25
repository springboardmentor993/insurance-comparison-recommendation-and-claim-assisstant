import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await authAPI.getProfile();
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        console.log('Login called with:', email);
        const response = await authAPI.login({ email, password });
        console.log('Login response:', response.data);
        const { access_token, refresh_token } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        console.log('Fetching profile...');
        const profileResponse = await authAPI.getProfile();
        console.log('Profile response:', profileResponse.data);
        setUser(profileResponse.data);

        return profileResponse.data;
    };

    const register = async (userData) => {
        await authAPI.register(userData);
        return login(userData.email, userData.password);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const updateProfile = async (data) => {
        const response = await authAPI.updateProfile(data);
        setUser(response.data);
        return response.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
