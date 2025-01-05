import React, { useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

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
    const API_KEY = process.env.API_KEY;;

    // Component to handle map clicks
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setLocation({ lat, lng });
                fetchWeather(lat, lng);
            },
        });
        return null;
    };

    // Fetch weather data for a given location
    const fetchWeather = (lat, lon) => {
        axios
            .get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
            .then((response) => setWeather(response.data))
            .catch((error) => console.error('Error fetching weather data:', error));
    };

    return (


        <div>
            <h1>Interactive Weather Map</h1>
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
                                    <h3>{weather.name || "Unknown Location"}</h3>
                                    <p>Temperature: {weather.main.temp} °C</p>
                                    <p>Weather: {weather.weather[0].description}</p>
                                    <p>Humidity: {weather.main.humidity}%</p>
                                    <p>Wind Speed: {weather.wind.speed} m/s</p>
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
        </div>

    );
}

export default Dashboard;
