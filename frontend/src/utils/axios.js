import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false
});

export default axiosInstance; 