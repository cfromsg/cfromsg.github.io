import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "./WeatherPage.css";

const WeatherPage = () => {
  // ...existing code...

  const renderWeatherElements = () => {
    if (!weatherData) return null;
    
    const elements = [];
    
    // Remove animation classes and simplify weather elements rendering
    if (weatherData.weather[0].main === "Rain" || weatherData.weather[0].main === "Drizzle") {
      elements.push(<div key="rain" className="weather-element rain-container"></div>);
    } else if (weatherData.weather[0].main === "Snow") {
      elements.push(<div key="snow" className="weather-element snow-container"></div>);
    } else if (weatherData.weather[0].main === "Thunderstorm") {
      elements.push(
        <div key="thunder" className="weather-element thunderstorm-container"></div>
      );
    } else if (weatherData.weather[0].main === "Clear") {
      elements.push(<div key="clear" className="weather-element clear-container"></div>);
    } else if (weatherData.weather[0].main === "Clouds") {
      elements.push(<div key="clouds" className="weather-element clouds-container"></div>);
    } else if (weatherData.weather[0].main === "Mist" || weatherData.weather[0].main === "Fog") {
      elements.push(<div key="mist" className="weather-element mist-container"></div>);
    }
    
    return elements;
  };

  // ...existing code...
}

export default WeatherPage;
