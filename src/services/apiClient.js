import axios from 'axios';

// Create Axios instance
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:3000' : 'http://142.132.229.92:3000'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor (for future Auth token)
apiClient.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
