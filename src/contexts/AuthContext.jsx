import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthContextProvider = ({ children}) => {
    let [user, setUser] = useState(null);
    let [loading, setLoading] = useState(false);

    let getUser = async (token) => {
        try {
            let res = await axios.get('http://127.0.0.1:8000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.status === 200) {
                if (res.data && res.data.length > 0) {
                    setUser(res.data[0]); 
                } else {
                    console.log('No user data found');
                    setUser(null);
                }
            }
        } catch (error) {
            // Handle authentication errors
            if (error.response?.status === 401) {
                console.log('Unauthenticated - invalid token');
                localStorage.removeItem("token");
                setUser(null);
            } else {
                console.error('Error fetching user:', error);
                setUser(null);
            }
        }
    }

    let login = async (credentials) => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', credentials);
            
            if (response.status === 200 && response.data.token) {
                localStorage.setItem('token', response.data.token);
                await getUser(response.data.token);
                return { success: true };
            } else {
                return { success: false, error: 'Login failed. Please check your credentials.' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        } finally {
            setLoading(false);
        }
    }

    let logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getUser(token);
        }
    }, [])

    console.log(user)

    return (
        <AuthContext.Provider value={{ user, getUser, login, logout, loading }}>{children}</AuthContext.Provider>
    )
}

export { AuthContext, AuthContextProvider }