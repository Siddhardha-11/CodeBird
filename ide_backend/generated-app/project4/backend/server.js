const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Make sure to install dotenv: npm install dotenv

const app = express();
const port = 5001;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/forecast.json';

app.get('/weather', async (req, res) => {
    const location = req.query.location;

    if (!location) {
        return res.status(400).json({ error: 'Location query parameter is required.' });
    }

    if (!WEATHER_API_KEY) {
        console.error('WEATHER_API_KEY is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: Weather API key missing.' });
    }

    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                key: WEATHER_API_KEY,
                q: location,
                days: 3 // For 3-day forecast
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather from WeatherAPI:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 400) {
            res.status(400).json({ error: 'Invalid location or API request.' });
        } else {
            res.status(500).json({ error: 'Failed to fetch weather data.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});

// Instructions:
// 1. Create a .env file in the backend directory.
// 2. Add your WeatherAPI key to the .env file like this: WEATHER_API_KEY=your_api_key_here
// 3. Install dependencies: npm install express axios dotenv
// 4. Run the backend: node server.js
// 5. Run the frontend: node ../frontend/index.js (assuming frontend is in a sibling directory)
// 6. Open http://localhost:3001 in your browser.