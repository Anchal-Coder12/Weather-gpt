// Mock database to simulate an API response from a backend
const mockWeatherData = {
    "seattle": {
        location: "Seattle, WA",
        temp: 52,
        condition: "Light Rain",
        icon: "ph-cloud-rain",
        humidity: 87,
        wind: 12,
        feelsLike: 48,
        uv: 1,
        warning: null,
        normals: {
            high: 58,
            low: 44,
            precip: "3.5"
        },
        aiText: "Current conditions are slightly cooler and wetter than the 30-year climate normal for this time of year. The dominant low-pressure system off the coast is driving continuous maritime moisture into the region."
    },
    "miami": {
        location: "Miami, FL",
        temp: 88,
        condition: "Severe Thunderstorms",
        icon: "ph-cloud-lightning",
        humidity: 75,
        wind: 25,
        feelsLike: 95,
        uv: 8,
        warning: {
            title: "Severe Thunderstorm Warning",
            desc: "Active until 4:00 PM EDT. Expect wind gusts up to 60mph and heavy downpours."
        },
        normals: {
            high: 84,
            low: 72,
            precip: "5.1"
        },
        aiText: "Temperatures are tracking above the historical baseline. Elevated atmospheric instability is triggering severe convective activity. Recommend staying indoors until the warning expires."
    }
};

function getWeatherData() {
    const input = document.getElementById('cityInput').value.toLowerCase().trim();
    const cityData = mockWeatherData[input] || mockWeatherData["seattle"]; // Default to Seattle if unknown

    updateUI(cityData);
}

function updateUI(data) {
    // 1. Update Live Data
    document.getElementById('locationDisplay').innerText = data.location;
    document.getElementById('temperature').innerText = `${data.temp}°`;
    document.getElementById('condition').innerText = data.condition;
    document.getElementById('humidity').innerText = `${data.humidity}%`;
    document.getElementById('wind').innerText = `${data.wind} mph`;
    document.getElementById('feelsLike').innerText = `${data.feelsLike}°`;
    document.getElementById('uvIndex').innerText = data.uv;
    
    // Update Icon class
    const iconEl = document.getElementById('weatherIcon');
    iconEl.className = `ph ${data.icon}`;

    // 2. Update Warnings
    const warningBanner = document.getElementById('warningBanner');
    if (data.warning) {
        document.getElementById('warningTitle').innerText = data.warning.title;
        document.getElementById('warningDesc').innerText = data.warning.desc;
        warningBanner.classList.remove('hidden');
    } else {
        warningBanner.classList.add('hidden');
    }

    // 3. Update Climate Normals
    document.getElementById('normalHigh').innerText = `${data.normals.high}°`;
    document.getElementById('normalLow').innerText = `${data.normals.low}°`;
    document.getElementById('normalPrecip').innerText = data.normals.precip;

    // Calculate baseline differences dynamically
    updateDiffBadge('diffHigh', data.temp, data.normals.high);
    // Rough estimation using feelsLike vs low for demonstration purposes
    updateDiffBadge('diffLow', data.feelsLike, data.normals.low);

    // 4. Update AI Output
    document.getElementById('aiText').innerText = data.aiText;
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

// Load default data on startup
window.onload = () => {
    updateUI(mockWeatherData['seattle']);
};