from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI(title="Energy Prediction ML Service", version="1.0.0")

# OpenWeather API configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

class PredictionRequest(BaseModel):
    userId: str
    latitude: float
    longitude: float
    resourceCapacity: float  # in Wh
    renewableResource: str  # "solar" or "wind"

class HourlyData(BaseModel):
    hour: int
    predictedGeneration: float
    weatherCondition: str
    temperature: float
    windSpeed: float
    solarIrradiance: float

class RecommendedWindow(BaseModel):
    startHour: int
    endHour: int
    confidence: float
    reason: str

class PredictionResponse(BaseModel):
    hourlyData: List[HourlyData]
    recommendedWindows: List[RecommendedWindow]
    totalPredictedGeneration: float
    averageEfficiency: float
    weatherSummary: str

def get_weather_forecast(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch weather forecast from OpenWeather API"""
    try:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        response = requests.get(OPENWEATHER_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
    except requests.RequestException as e:
        print(f"Weather API error: {e}")
        # Return mock data if API fails
        return generate_mock_weather_data()

def generate_mock_weather_data() -> Dict[str, Any]:
    """Generate mock weather data for testing"""
    mock_data = {
        "list": []
    }
    
    for i in range(24):  # 24 hours of data
        hour = datetime.now() + timedelta(hours=i)
        mock_data["list"].append({
            "dt": int(hour.timestamp()),
            "main": {
                "temp": 20 + np.random.normal(0, 5),
                "humidity": 60 + np.random.normal(0, 10)
            },
            "wind": {
                "speed": np.random.uniform(0, 10)
            },
            "weather": [{
                "main": np.random.choice(["Clear", "Clouds", "Rain"]),
                "description": "partly cloudy"
            }],
            "clouds": {"all": np.random.uniform(0, 100)}
        })
    
    return mock_data

def calculate_solar_generation(weather_data: Dict, capacity: float) -> List[HourlyData]:
    """Calculate solar energy generation based on weather data"""
    hourly_data = []
    
    for i, forecast in enumerate(weather_data["list"][:24]):  # Next 24 hours
        hour = i
        temp = forecast["main"]["temp"]
        clouds = forecast["clouds"]["all"]
        weather_main = forecast["weather"][0]["main"]
        
        # Calculate solar irradiance based on weather conditions
        base_irradiance = 1000  # W/m² (standard test conditions)
        
        # Adjust for weather conditions
        if weather_main == "Clear":
            irradiance_factor = 0.9
        elif weather_main == "Clouds":
            irradiance_factor = 0.6 - (clouds / 100) * 0.3
        elif weather_main == "Rain":
            irradiance_factor = 0.2
        else:
            irradiance_factor = 0.5
        
        # Adjust for time of day (solar angle)
        if 6 <= hour <= 18:  # Daylight hours
            time_factor = np.sin(np.pi * (hour - 6) / 12)
        else:
            time_factor = 0
        
        # Temperature derating (solar panels lose efficiency in high temps)
        temp_derating = max(0.8, 1 - (temp - 25) * 0.004)
        
        # Calculate generation
        irradiance = base_irradiance * irradiance_factor * time_factor
        efficiency = 0.2 * temp_derating  # 20% panel efficiency
        generation = capacity * efficiency * (irradiance / 1000)
        
        hourly_data.append(HourlyData(
            hour=hour,
            predictedGeneration=max(0, generation),
            weatherCondition=weather_main.lower(),
            temperature=temp,
            windSpeed=forecast["wind"]["speed"],
            solarIrradiance=irradiance
        ))
    
    return hourly_data

def calculate_wind_generation(weather_data: Dict, capacity: float) -> List[HourlyData]:
    """Calculate wind energy generation based on weather data"""
    hourly_data = []
    
    for i, forecast in enumerate(weather_data["list"][:24]):
        hour = i
        wind_speed = forecast["wind"]["speed"]
        temp = forecast["main"]["temp"]
        weather_main = forecast["weather"][0]["main"]
        
        # Wind turbine power curve (simplified)
        # Cut-in speed: 3 m/s, Rated speed: 12 m/s, Cut-out speed: 25 m/s
        if wind_speed < 3:
            power_factor = 0
        elif wind_speed < 12:
            power_factor = (wind_speed - 3) / 9  # Linear increase
        elif wind_speed < 25:
            power_factor = 1  # Rated power
        else:
            power_factor = 0  # Cut-out
        
        # Adjust for weather conditions
        if weather_main == "Rain":
            power_factor *= 0.8  # Reduced efficiency in rain
        
        generation = capacity * power_factor * 0.4  # 40% capacity factor
        
        hourly_data.append(HourlyData(
            hour=hour,
            predictedGeneration=max(0, generation),
            weatherCondition=weather_main.lower(),
            temperature=temp,
            windSpeed=wind_speed,
            solarIrradiance=0
        ))
    
    return hourly_data

def find_optimal_windows(hourly_data: List[HourlyData], resource_type: str) -> List[RecommendedWindow]:
    """Find optimal time windows for energy usage"""
    windows = []
    
    if resource_type == "solar":
        # Find peak generation periods
        generation_by_hour = {data.hour: data.predictedGeneration for data in hourly_data}
        
        # Peak period 1: Morning (10-14)
        morning_avg = np.mean([generation_by_hour.get(h, 0) for h in range(10, 15)])
        if morning_avg > 0.3 * max(generation_by_hour.values()):
            windows.append(RecommendedWindow(
                startHour=10,
                endHour=14,
                confidence=min(0.9, morning_avg / max(generation_by_hour.values())),
                reason="Peak solar generation period"
            ))
        
        # Peak period 2: Afternoon (15-17)
        afternoon_avg = np.mean([generation_by_hour.get(h, 0) for h in range(15, 18)])
        if afternoon_avg > 0.2 * max(generation_by_hour.values()):
            windows.append(RecommendedWindow(
                startHour=15,
                endHour=17,
                confidence=min(0.8, afternoon_avg / max(generation_by_hour.values())),
                reason="Good solar conditions with moderate generation"
            ))
    
    elif resource_type == "wind":
        # Find consistent wind periods
        generation_by_hour = {data.hour: data.predictedGeneration for data in hourly_data}
        wind_by_hour = {data.hour: data.windSpeed for data in hourly_data}
        
        # Find periods with consistent wind (3-15 m/s)
        for start_hour in range(0, 22):
            end_hour = start_hour + 3
            if end_hour > 23:
                break
                
            wind_speeds = [wind_by_hour.get(h, 0) for h in range(start_hour, end_hour + 1)]
            avg_wind = np.mean(wind_speeds)
            
            if 3 <= avg_wind <= 15:  # Optimal wind speed range
                avg_generation = np.mean([generation_by_hour.get(h, 0) for h in range(start_hour, end_hour + 1)])
                confidence = min(0.9, avg_generation / max(generation_by_hour.values()) if max(generation_by_hour.values()) > 0 else 0)
                
                if confidence > 0.3:
                    windows.append(RecommendedWindow(
                        startHour=start_hour,
                        endHour=end_hour,
                        confidence=confidence,
                        reason=f"Consistent wind conditions ({avg_wind:.1f} m/s)"
                    ))
    
    # Sort by confidence and return top 3
    windows.sort(key=lambda x: x.confidence, reverse=True)
    return windows[:3]

@app.get("/")
async def root():
    return {"message": "Energy Prediction ML Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/predict", response_model=PredictionResponse)
async def predict_energy(request: PredictionRequest):
    """Generate energy predictions based on weather forecast"""
    try:
        # Fetch weather data
        weather_data = get_weather_forecast(request.latitude, request.longitude)
        
        # Calculate generation based on resource type
        if request.renewableResource == "solar":
            hourly_data = calculate_solar_generation(weather_data, request.resourceCapacity)
        elif request.renewableResource == "wind":
            hourly_data = calculate_wind_generation(weather_data, request.resourceCapacity)
        else:
            raise HTTPException(status_code=400, detail="Invalid renewable resource type")
        
        # Find optimal usage windows
        recommended_windows = find_optimal_windows(hourly_data, request.renewableResource)
        
        # Calculate summary statistics
        total_generation = sum(data.predictedGeneration for data in hourly_data)
        avg_efficiency = total_generation / (request.resourceCapacity * 24) if request.resourceCapacity > 0 else 0
        
        # Generate weather summary
        conditions = [data.weatherCondition for data in hourly_data]
        most_common = max(set(conditions), key=conditions.count)
        weather_summary = f"Mostly {most_common} conditions with {avg_efficiency:.1%} average efficiency"
        
        return PredictionResponse(
            hourlyData=hourly_data,
            recommendedWindows=recommended_windows,
            totalPredictedGeneration=total_generation,
            averageEfficiency=avg_efficiency,
            weatherSummary=weather_summary
        )
        
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating predictions: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)













