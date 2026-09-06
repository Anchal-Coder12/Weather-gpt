// 1. PASTE YOUR WEATHERAPI KEY HERE:
const API_KEY = 'YOUR_API_KEY_HERE'; 

async function getWeatherData(defaultCity = null) {
    let input = defaultCity || document.getElementById('cityInput').value.toLowerCase().trim();
    if (!input) return;

    // Grab the language selected by the user
    const targetLang = document.getElementById('langSelect').value;

    try {
        // Fetch weather data, asking WeatherAPI for the condition in the correct language
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${input}&days=3&alerts=yes&lang=${targetLang}`);
        
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        updateUI(data, targetLang);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('aiText').innerText = "Could not locate that city. Please try checking your spelling.";
    }
}

async function updateUI(data, lang) {
    const current = data.current;
    const location = data.location;
    
    // We check the ENGLISH condition text for the background image mapping so it doesn't break on translations
    const englishCondition = data.forecast.forecastday[0].day.condition.text;
    const styleInfo = getWeatherType(englishCondition);

    // 1. Live Data (Now showing both C and F)
    document.getElementById('locationDisplay').innerText = `${location.name}, ${location.region || location.country}`;
    
    // Format: 72°F | 22°C
    document.getElementById('temperature').innerText = `${Math.round(current.temp_f)}°F | ${Math.round(current.temp_c)}°C`;
    
    // Condition uses the native language provided by WeatherAPI
    document.getElementById('condition').innerText = current.condition.text;
    
    document.getElementById('humidity').innerText = `${current.humidity}%`;
    document.getElementById('wind').innerText = `${Math.round(current.wind_mph)} mph`;
    document.getElementById('feelsLike').innerText = `${Math.round(current.feelslike_f)}°F | ${Math.round(current.feelslike_c)}°C`;
    document.getElementById('uvIndex').innerText = current.uv;
    
    document.getElementById('weatherIcon').className = `ph ${styleInfo.icon}`;
    document.body.className = `bg-${styleInfo.bg}`;

    // 2. Warnings
    const warningBanner = document.getElementById('warningBanner');
    if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
        document.getElementById('warningTitle').innerText = data.alerts.alert[0].event;
        document.getElementById('warningDesc').innerText = data.alerts.alert[0].headline || data.alerts.alert[0].desc;
        warningBanner.classList.remove('hidden');
    } else {
        warningBanner.classList.add('hidden');
    }

    // 3. Extended Outlook (Now showing both C and F)
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = ''; 

    data.forecast.forecastday.forEach(day => {
        const dateObj = new Date(day.date.replace(/-/g, '\/')); 
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStyle = getWeatherType(day.day.condition.text);

        forecastGrid.innerHTML += `
            <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px;">
                <p style="color: var(--text-muted); margin-bottom: 0.5rem;">${dayName}</p>
                <i class="ph ${dayStyle.icon}" style="font-size: 2.5rem; color: var(--accent);"></i>
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <strong>H: ${Math.round(day.day.maxtemp_f)}°F | ${Math.round(day.day.maxtemp_c)}°C</strong><br>
                    <strong>L: ${Math.round(day.day.mintemp_f)}°F | ${Math.round(day.day.mintemp_c)}°C</strong>
                </div>
            </div>
        `;
    });

    // 4. Mock Climate Normals (Both C and F)
    const mockNormalHighF = Math.round(current.temp_f) - (Math.floor(Math.random() * 10) - 5);
    const mockNormalLowF = Math.round(current.temp_f) - 15;
    const mockNormalHighC = Math.round((mockNormalHighF - 32) * 5/9);
    const mockNormalLowC = Math.round((mockNormalLowF - 32) * 5/9);
    
    document.getElementById('normalHigh').innerText = `${mockNormalHighF}°F | ${mockNormalHighC}°C`;
    document.getElementById('normalLow').innerText = `${mockNormalLowF}°F | ${mockNormalLowC}°C`;
    document.getElementById('normalPrecip').innerText = "2.1 in";
    
    updateDiffBadge('diffHigh', Math.round(current.temp_f), mockNormalHighF);
    updateDiffBadge('diffLow', Math.round(current.feelslike_f), mockNormalLowF);

    // 5. Multi-Language GPT Analysis via API
    const englishAIText = `Based on current meteorological data, ${location.name} is experiencing ${englishCondition.toLowerCase()} conditions. Wind speeds are tracking at ${Math.round(current.wind_mph)} mph. The temperature is ${Math.round(current.temp_f)}°F (${Math.round(current.temp_c)}°C), though it feels closer to ${Math.round(current.feelslike_f)}°F.`;
    
    if (lang === 'en') {
        document.getElementById('aiText').innerText = englishAIText;
    } else {
        document.getElementById('aiText').innerText = "Generating translated analysis...";
        try {
            // Fetch translation from Google Translate's free endpoint
            const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(englishAIText)}`;
            const transRes = await fetch(translateUrl);
            const transData = await transRes.json();
            
            // Reconstruct the translated sentence
            let translatedText = "";
            transData[0].forEach(part => translatedText += part[0]);
            
            document.getElementById('aiText').innerText = translatedText;
        } catch (e) {
            console.error("Translation API Error:", e);
            document.getElementById('aiText').innerText = englishAIText; // Fallback to English
        }
    }
}

function getWeatherType(conditionText) {
    if (!conditionText) return { bg: 'default', icon: 'ph-sun' };
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

window.onload = () => getWeatherData("Seattle");

document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeatherData();
    }
});
