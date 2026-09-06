let weatherDatabase = {};

async function loadData() {
    try {
        const response = await fetch('data.json');
        weatherDatabase = await response.json();
        updateUI(weatherDatabase['seattle']);
    } catch (error) {
        console.error("Error loading weather data:", error);
        document.getElementById('aiText').innerText = "System Error: Could not connect to the database.";
    }
}

function getWeatherData() {
    const input = document.getElementById('cityInput').value.toLowerCase().trim();
    const cityData = weatherDatabase[input] || weatherDatabase["seattle"]; 
    updateUI(cityData);
}

function updateUI(data) {
    if (!data) return;

    document.getElementById('locationDisplay').innerText = data.location;
    document.getElementById('temperature').innerText = `${data.temp}°`;
    document.getElementById('condition').innerText = data.condition;
    document.getElementById('humidity').innerText = `${data.humidity}%`;
    document.getElementById('wind').innerText = `${data.wind} mph`;
    document.getElementById('feelsLike').innerText = `${data.feelsLike}°`;
    document.getElementById('uvIndex').innerText = data.uv;
    
    const iconEl = document.getElementById('weatherIcon');
    iconEl.className = `ph ${data.icon}`;

    const warningBanner = document.getElementById('warningBanner');
    if (data.warning) {
        document.getElementById('warningTitle').innerText = data.warning.title;
        document.getElementById('warningDesc').innerText = data.warning.desc;
        warningBanner.classList.remove('hidden');
    } else {
        warningBanner.classList.add('hidden');
    }

    document.getElementById('normalHigh').innerText = `${data.normals.high}°`;
    document.getElementById('normalLow').innerText = `${data.normals.low}°`;
    document.getElementById('normalPrecip').innerText = data.normals.precip;
    updateDiffBadge('diffHigh', data.temp, data.normals.high);
    updateDiffBadge('diffLow', data.feelsLike, data.normals.low);

    document.getElementById('aiText').innerText = data.aiText;

    document.body.className = ''; 
    if (data.bgType) {
        document.body.classList.add(`bg-${data.bgType}`);
    } else {
        document.body.classList.add('bg-default');
    }
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

window.onload = loadData;

document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeatherData();
    }
});
