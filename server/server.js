import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

if (!WEATHER_API_KEY) {
    console.error('WEATHER_API_KEY environment variable is required');
    process.exit(1);
}

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5500', 'https://yourusername.github.io'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
            return callback(new Error('CORS not allowed'), false);
        }
        return callback(null, true);
    },
    methods: ['GET']
}));

app.use(express.json());

// Helper function to proxy weather API requests
async function fetchWeatherData(endpoint, params) {
    const url = new URL(`https://api.openweathermap.org/data/2.5/${endpoint}`);
    url.search = new URLSearchParams({
        ...params,
        appid: WEATHER_API_KEY
    }).toString();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching weather data:`, error);
        throw error;
    }
}

// Weather endpoints
app.get('/api/weather/:city', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon parameters are required' });
        }

        const data = await fetchWeatherData('weather', {
            lat,
            lon,
            units: 'metric'
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/forecast/:city', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon parameters are required' });
        }

        const data = await fetchWeatherData('forecast', {
            lat,
            lon,
            units: 'metric'
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Weather proxy server running on port ${port}`);
});