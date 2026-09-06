// 1. PASTE YOUR WEATHERAPI KEY HERE:
const API_KEY = '949331db874440f9bdf130649260609'; 

async function getWeatherData(defaultCity = null) {
    // Get the city from the input, or use the default if provided
    let input = defaultCity || document.getElementById('cityInput').value.toLowerCase().trim();
    if (!input) return;

    try {
        // Fetch Current data, 3-Day Forecast, and Alerts in one single call
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${input}&days=3&alerts=yes`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('aiText').innerText = "Could not locate that city. Please try checking your spelling.";
    }
}

function updateUI(data) {
    const current = data.current;
    const location = data.location;
    
    // Determine the styling based on the weather text (e.g., "Patchy rain possible")
    const styleInfo = getWeatherType(current.condition.text);

    // 1. Live Data
    document.getElementById('locationDisplay').innerText = `${location.name}, ${location.region || location.country}`;
    document.getElementById('temperature').innerText = `${Math.round(current.temp_f)}°`;
    document.getElementById('condition').innerText = current.condition.text;
    document.getElementById('humidity').innerText = `${current.humidity}%`;
    document.getElementById('wind').innerText = `${Math.round(current.wind_mph)} mph`;
    document.getElementById('feelsLike').innerText = `${Math.round(current.feelslike_f)}°`;
    document.getElementById('uvIndex').innerText = current.uv;
    
    // Update main icon and background
    document.getElementById('weatherIcon').className = `ph ${styleInfo.icon}`;
    document.body.className = `bg-${styleInfo.bg}`;

    // 2. Warnings (Check if alerts exist in the JSON)
    const warningBanner = document.getElementById('warningBanner');
    if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
        document.getElementById('warningTitle').innerText = data.alerts.alert[0].event;
        document.getElementById('warningDesc').innerText = data.alerts.alert[0].headline || data.alerts.alert[0].desc;
        warningBanner.classList.remove('hidden');
    } else {
        warningBanner.classList.add('hidden');
    }

    // 3. Extended Outlook
    // Find the grid container inside the extended forecast section
    const forecastGrid = document.querySelector('.extended-forecast').lastElementChild;
    forecastGrid.innerHTML = ''; // Clear out the old HTML

    // Loop through the 3 days of forecast data
    data.forecast.forecastday.forEach(day => {
        // Convert the date string (YYYY-MM-DD) into a day name (e.g., "Mon")
        const dateObj = new Date(day.date.replace(/-/g, '\/')); 
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStyle = getWeatherType(day.day.condition.text);

        forecastGrid.innerHTML += `
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">
                <p style="color: var(--text-muted); margin-bottom: 0.5rem;">${dayName}</p>
                <i class="ph ${dayStyle.icon}" style="font-size: 2rem; color: var(--accent);"></i>
                <p style="margin-top: 0.5rem;"><strong>${Math.round(day.day.maxtemp_f)}° / ${Math.round(day.day.mintemp_f)}°</strong></p>
            </div>
        `;
    });

    // 4. Mock Climate Normals & AI Text 
    // (WeatherAPI free tier doesn't offer 30-year climate normals, so we dynamically generate plausible data here so your UI doesn't break)
    const mockNormalHigh = Math.round(current.temp_f) - (Math.floor(Math.random() * 10) - 5);
    const mockNormalLow = Math.round(current.temp_f) - 15;
    
    document.getElementById('normalHigh').innerText = `${mockNormalHigh}°`;
    document.getElementById('normalLow').innerText = `${mockNormalLow}°`;
    document.getElementById('normalPrecip').innerText = "2.1 in";
    
    updateDiffBadge('diffHigh', Math.round(current.temp_f), mockNormalHigh);
    updateDiffBadge('diffLow', Math.round(current.feelslike_f), mockNormalLow);

    // Simulated AI Output based on the live data
    document.getElementById('aiText').innerText = `Based on current meteorological data, ${location.name} is experiencing ${current.condition.text.toLowerCase()} conditions. Wind speeds are tracking at ${Math.round(current.wind_mph)} mph. The temperature is ${Math.round(current.temp_f)}°F, though it feels closer to ${Math.round(current.feelslike_f)}°F.`;
}

// Helper function to map text to icons and backgrounds
function getWeatherType(conditionText) {
    const text = conditionText.toLowerCase();
    if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return { bg: 'rainy', icon: 'ph-cloud-rain' };
    if (text.includes('thunder') || text.includes('storm')) return { bg: 'stormy', icon: 'ph-cloud-lightning' };
    if (text.includes('snow') || text.includes('ice') || text.includes('blizzard') || text.includes('pellets')) return { bg: 'cloudy', icon: 'ph-snowflake' };
    if (text.includes('cloud') || text.includes('overcast') || text.includes('fog') || text.includes('mist')) return { bg: 'cloudy', icon: 'ph-cloud' };
    if (text.includes('sun') || text.includes('clear')) return { bg: 'default', icon: 'ph-sun' };
    return { bg: 'default', icon: 'ph-cloud-sun' }; 
}

function updateDiffBadge(elementId, current, normal) {
    const el = document.getElementById(elementId);
    const diff = current - normal;
    
    if (diff > 0) {
        el.innerText = `+${diff}° Above Avg`;
        el.className = 'diff above';
    } else if (diff < 0) {
        el.innerText = `${diff}° Below Avg`;
        el.className = 'diff below';
    } else {
        el.innerText = 'Average';
        el.className = 'diff';
    }
}

// Load Seattle by default on startup
window.onload = () => getWeatherData("Seattle");

// Allow users to press "Enter" in the search bar
document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeatherData();
    }
});
