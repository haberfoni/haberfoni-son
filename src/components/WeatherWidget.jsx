import React, { useState, useEffect } from 'react';
import { Cloud, CloudSun, Sun, Loader2 } from 'lucide-react';

const CITIES = [
    { name: 'İstanbul', lat: 41.0082, lon: 28.9784 },
    { name: 'Ankara', lat: 39.9334, lon: 32.8597 },
    { name: 'İzmir', lat: 38.4192, lon: 27.1287 }
];

const WeatherWidget = () => {
    const [weatherData, setWeatherData] = useState({});
    const [currentCityIndex, setCurrentCityIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const promises = CITIES.map(async (city) => {
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code`);
                    const data = await res.json();
                    return { name: city.name, data: data.current };
                });

                const results = await Promise.all(promises);
                const weatherMap = {};
                results.forEach(result => {
                    weatherMap[result.name] = result.data;
                });

                setWeatherData(weatherMap);
                setLoading(false);
            } catch (err) {
                console.error("Weather fetch error:", err);
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    useEffect(() => {
        if (loading) return;

        const interval = setInterval(() => {
            setCurrentCityIndex((prev) => (prev + 1) % CITIES.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [loading]);

    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-gray-600 text-xs">
                <Loader2 size={14} className="animate-spin" />
                <span>Yükleniyor...</span>
            </div>
        );
    }

    const currentCity = CITIES[currentCityIndex];
    const currentWeather = weatherData[currentCity.name];

    if (!currentWeather) return null;

    // Simple icon mapping based on WMO codes
    const getWeatherIcon = (code) => {
        if (code <= 3) return <Sun size={16} className="text-yellow-500" />;
        if (code <= 48) return <CloudSun size={16} className="text-gray-500" />;
        return <Cloud size={16} className="text-gray-600" />;
    };

    return (
        <div className="flex items-center space-x-2 text-gray-700 font-medium text-xs bg-gray-100 px-3 py-1.5 rounded-lg transition-all duration-500 min-w-[100px] justify-center">
            {getWeatherIcon(currentWeather.weather_code)}
            <span>{currentCity.name}</span>
            <span className="font-bold">{Math.round(currentWeather.temperature_2m)}°</span>
        </div>
    );
};

export default WeatherWidget;
