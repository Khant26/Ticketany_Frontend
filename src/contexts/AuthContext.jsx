import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { AUTH_REQUIRED_EVENT, clearAuthStorage, setOnTokenExpired } from "../services/apiClient";
import { showError, showSessionExpired } from "../utils/toastNotification";

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const AuthContextProvider = ({ children}) => {
    let [user, setUser] = useState(null);
    let [loading, setLoading] = useState(false);

    let getUser = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setUser(null);
                return;
            }
            let res = await axios.get(`${API_BASE}customers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.status === 200) {
                if (Array.isArray(res.data)) setUser(res.data[0] || null);
                else setUser(res.data || null);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('Unauthenticated - invalid token');
                clearAuthStorage();
                setUser(null);
                window.dispatchEvent(new Event("userLoginChanged"));
                window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT, {
                    detail: { reason: "sessionExpired" },
                }));
                showSessionExpired();
            } else {
                console.error('Error fetching user:', error);
                setUser(null);
                if (error.response?.status >= 500) {
                    showError("Server error. Please try again later.");
                }
            }
        }
    }

    let login = async (credentials) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}auth/login/`, credentials, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const access = response.data?.access_token || response.data?.access || response.data?.token;
                const refresh = response.data?.refresh_token || response.data?.refresh;

                if (access) localStorage.setItem('access_token', access);
                if (refresh) localStorage.setItem('refresh_token', refresh);
                localStorage.setItem('user_data', JSON.stringify(response.data));
                await getUser();
                return { success: true };
            }

            return { success: false, error: 'Login failed. Please check your credentials.' };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || error.response?.data?.error || error.response?.data?.message || 'Login failed. Please try again.' 
            };
        } finally {
            setLoading(false);
        }
    }

    let logout = ({ showToast = true, requireReauth = false } = {}) => {
        clearAuthStorage();
        setUser(null);
        window.dispatchEvent(new Event("userLoginChanged"));
        if (showToast) {
            showSessionExpired();
        }
        if (requireReauth) {
            window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT, {
                detail: { reason: "sessionExpired" },
            }));
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) getUser();
        
        // Register logout callback for when token expires during API calls
        setOnTokenExpired(() => logout({ showToast: true, requireReauth: true }));
    }, [])

    console.log(user)

    return (
        <AuthContext.Provider value={{ user, getUser, login, logout, loading }}>{children}</AuthContext.Provider>
    )
}

export { AuthContext, AuthContextProvider }