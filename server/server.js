import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const cache = {
    data: new Map(),
    lastCleanup: Date.now()
};

// Cache cleanup interval (every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

if (!WEATHER_API_KEY) {
    console.error('WEATHER_API_KEY environment variable is required');
    process.exit(1);
}

// Cache management functions
function getCacheKey(endpoint, params) {
    return `${endpoint}_${params.lat}_${params.lon}`;
}

function getCachedData(key) {
    const cached = cache.data.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        cache.data.delete(key);
        return null;
    }
    
    return cached.data;
}

function setCachedData(key, data) {
    cache.data.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Cleanup old cache entries
function cleanupCache() {
    if (Date.now() - cache.lastCleanup > CLEANUP_INTERVAL) {
        const now = Date.now();
        for (const [key, value] of cache.data.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                cache.data.delete(key);
            }
        }
        cache.lastCleanup = now;
        console.log(`Cache cleanup completed. Remaining entries: ${cache.data.size}`);
    }
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

// Helper function to proxy weather API requests with caching
async function fetchWeatherData(endpoint, params) {
    const cacheKey = getCacheKey(endpoint, params);
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
    }

    console.log(`Cache miss for ${cacheKey}`);
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
        const data = await response.json();
        
        // Cache the successful response
        setCachedData(cacheKey, data);
        console.log(`Cached data for ${cacheKey}`);
        
        return data;
    } catch (error) {
        console.error(`Error fetching weather data:`, error);
        throw error;
    } finally {
        // Clean up old cache entries periodically
        cleanupCache();
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