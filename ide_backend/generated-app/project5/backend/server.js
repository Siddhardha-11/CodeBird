const express = require('express');
const axios = require('axios'); // For making HTTP requests to external APIs
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000; // Use port 5000 for the API server

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// Enable CORS for all origins (for development convenience)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API route for current weather
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }
    if (!OPENWEATHER_API_KEY) {
        return res.status(500).json({ error: 'Weather API key not configured.' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch weather data.',
            details: error.response ? error.response.data : error.message
        });
    }
});

// API route for forecast
app.get('/api/forecast', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }
    if (!OPENWEATHER_API_KEY) {
        return res.status(500).json({ error: 'Weather API key not configured.' });
    }

    // Forecast API provides data in 3-hour intervals, up to 5 days
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching forecast data:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch forecast data.',
            details: error.response ? error.response.data : error.message
        });
    }
});

// Optional: API route to get location by IP address (if geolocation is not available/permitted)
app.get('/api/location', async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    // Use a service like ipinfo.io or GeoIP databases
    // For simplicity, this example might use a placeholder or a known free service if available
    // NOTE: Free IP geolocation services can be rate-limited or inaccurate.
    // Using Geoapify here as an example for reverse geocoding, but could also be used for IP location.
    if (!GEOAPIFY_API_KEY) {
        return res.status(500).json({ error: 'Geoapify API key not configured.' });
    }

    // Example using Geoapify's Geocoding API to find location based on approximate coordinates (might need adjustment)
    // A direct IP-to-location API would be better if available and free.
    // For now, let's assume we fallback to default if location services fail.
    res.status(404).json({ error: 'IP-based location lookup not implemented in this basic example.' });
});

app.listen(port, () => {
    console.log(`Backend API server running on http://localhost:${port}`);
});

/*
To run the backend:
1. Install dependencies: npm install express axios dotenv
2. Create a .env file in the same directory with your API keys:
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   GEOAPIFY_API_KEY=your_geoapify_api_key
3. Run the server: node server.js

Remember to configure your frontend script (script.js) to fetch from this backend server if you choose to use it, e.g.:

async function fetchWeather(lat, lon) {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`); // Assuming frontend and backend are on the same domain or using a proxy
    // Or if on different ports: fetch('http://localhost:5000/api/weather?lat=' + lat + '&lon=' + lon);
    // ... rest of the logic
}

For this example, the frontend directly fetches from the external APIs. To use this backend, you would modify the fetch calls in script.js.
*/
