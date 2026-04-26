const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

app.get('/weather/:city', async (req, res) => {
  const city = req.params.city;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric' // Or 'imperial' for Fahrenheit
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});