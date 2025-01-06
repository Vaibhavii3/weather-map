import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});


// Function to create a custom icon
const createWeatherIcon = (iconUrl) => {
    return L.icon({
        iconUrl,
        iconSize: [50, 50], // Adjust size as needed
        iconAnchor: [25, 50], // Anchor point for the icon
        popupAnchor: [0, -50], // Position of the popup relative to the icon
    });
};

function Dashboard() {
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);
    const [searchWeather, setSearchWeather] = useState(null);
    const [sliderVisible, setSliderVisible] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State for search bar input

    const API_KEY = process.env.REACT_APP_API_KEY;

    const fetchWeatherByCity = (city) => {
        axios
            .get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
            .then((response) => {
                setSearchWeather(response.data);
                setSliderVisible(true);
            })
            .catch((error) => console.error("Error fetching city weather:", error));
    }

    // Component to handle map clicks
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                console.log('Map clicked at:', lat, lng);
                setLocation({ lat, lng });
                fetchWeather(lat, lng);
            },
        });
        return null;
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === "Enter") {
            fetchWeatherByCity(searchQuery);
        }
    };

    const handleSliderClose = () => {
        setSliderVisible(false); // Close the slider
        setSearchWeather(null);  // Clear the weather data
        setSearchQuery('');      // Clear the search input
    };

    // Fetch weather data for a given location
    const fetchWeather = async (lat, lon) => {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
            setWeather(response.data);
            setError(null);
        } catch(err) {
            console.error('Error fetching weather data:', err);
            setError('Faild to fetch weather data. Please try again.');
        }
    };

    return (
        <div className='dashboard'>
            <h1 className='dashboard-title'>Interactive Weather Map</h1>

            {/* search box  */}
            <div className='search-box'>
                <input 
                    type='text'
                    placeholder='Search by city...'
                    value={searchQuery} // Bind input value to state
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyPress}
                    className="search-input"
                    />
            </div>

            {/* weather info slider  */}

            <div className={`weather-slider ${sliderVisible ? "visible" : ""}`}>
            <button 
                onClick={handleSliderClose}
                className="slider-close-btn"
                
                >Close</button>
                {searchWeather ? (

        <div>
            <h3 className="weather-title">{searchWeather.name}</h3>
                <div className="weather-grid">
                    <p><strong>Temperature:</strong> {searchWeather.main.temp} °C</p>
                    <p><strong>Feels Like:</strong> {searchWeather.main.feels_like} °C</p>
                    <p><strong>Weather:</strong> {searchWeather.weather[0].description}</p>
                    <p><strong>Humidity:</strong> {searchWeather.main.humidity}%</p>
                    <p><strong>Pressure:</strong> {searchWeather.main.pressure} hPa</p>
                    <p><strong>Wind Speed:</strong> {searchWeather.wind.speed} m/s</p>
                    <p><strong>Wind Direction:</strong> {searchWeather.wind.deg}°</p>
                    <p><strong>Visibility:</strong> {searchWeather.visibility / 1000} km</p>
                    <p><strong>Cloudiness:</strong> {searchWeather.clouds.all}%</p>
                    <p><strong>Sunrise:</strong> {new Date(searchWeather.sys.sunrise * 1000).toLocaleTimeString()}</p>
                    <p><strong>Sunset:</strong> {new Date(searchWeather.sys.sunset * 1000).toLocaleTimeString()}</p>
                </div>
            <img
                src={`https://openweathermap.org/img/wn/${searchWeather.weather[0].icon}@2x.png`}
                alt={searchWeather.weather[0].description}
                className="weather-icon"
            />
        </div>
        ) : (
            <p>No weather data</p>
        )}
    </div>

            <MapContainer
                center={[28.6139, 77.2090]} // Default center (Delhi)
                zoom={10}
                style={{ height: '500px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler />
                {location && weather && (
                    <Marker position={[location.lat, location.lng]}
                    icon={createWeatherIcon(
                        `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
                    )}>
                        <Popup>
                            {weather ? (
                                <div>
                                    <h3 className="weather-title-2">{weather.name || "Unknown Location"}</h3>
                                    <div className="weather-grid-2">
                                    <p>Temperature: {weather.main.temp} °C</p>
                                    <p>Feels Like: {weather.main.feels_like} °C</p>
                                    <p>Weather: {weather.weather[0].description}</p>
                                    <p>Humidity: {weather.main.humidity}%</p>
                                    <p>Pressure: {weather.main.pressure} hPa</p>
                                    <p>Wind Speed: {weather.wind.speed} m/s</p>
                                    <p>Wind Direction: {weather.wind.deg}°</p>
                                    <p>Visibility: {weather.visibility / 1000} km</p>
                                    <p>Cloudiness: {weather.clouds.all}%</p>
                                    <p>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
                                    <p>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
                                </div>    
                                    <img
                                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                                        alt={weather.weather[0].description}
                                        style={{ width: "50px", height: "50px" }}
                                        />
                                </div>
                            ) : (
                                <p>Loading weather...</p>
                            )}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default Dashboard;
