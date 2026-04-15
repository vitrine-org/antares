import React from 'react';
import {
    IconSun, IconSunHigh, IconCloud, IconMist,
    IconCloudRain, IconCloudSnow, IconCloudStorm, IconCloudBolt, IconSnowflake,
    IconCloudOff, IconLoader2,
} from '@tabler/icons-react';
import { useSystemInfo } from './useSystemInfo';
import { useSettings } from './useSettings';
import { useWeather } from './useWeather';
import Utils from './utils';
import CircularProgress from './CircularProgress';

/* ── helpers ─────────────────────────────────────────────────────── */

function pct(used, total) {
    return total > 0 ? Math.round((used / total) * 100) : 0;
}

/* ── weather icons ───────────────────────────────────────────────── */

const WEATHER_ICON_MAP = {
    0: IconSun,
    1: IconSunHigh,
    2: IconCloud,
    3: IconCloud,
    45: IconMist,
    48: IconMist,
    51: IconCloudRain,
    53: IconCloudRain,
    55: IconCloudRain,
    56: IconCloudRain,
    57: IconCloudRain,
    61: IconCloudRain,
    63: IconCloudRain,
    65: IconCloudRain,
    66: IconCloudRain,
    67: IconCloudRain,
    71: IconCloudSnow,
    73: IconCloudSnow,
    75: IconCloudSnow,
    77: IconSnowflake,
    80: IconCloudRain,
    81: IconCloudRain,
    82: IconCloudRain,
    85: IconCloudSnow,
    86: IconCloudSnow,
    95: IconCloudStorm,
    96: IconCloudBolt,
    99: IconCloudBolt,
};

/* ── weather block ───────────────────────────────────────────────── */

function WeatherBlock({ city, weather, error, accentColor, unit, textColor }) {
    const symbol = unit === 'fahrenheit' ? '°F' : '°C';

    if (!weather && error) return (
        <div className="antares-weather">
            <div className='antares-w-icon-container' style={{ background: accentColor }}>
                <IconCloudOff size={32} strokeWidth={1.5} />
            </div>
            <p style={{ color: textColor }}>Weather unavailable</p>
        </div>
    );

    if (!weather) return (
        <div className="antares-weather">
            <div className='antares-w-icon-container' style={{ background: accentColor }}>
                <IconLoader2 size={32} strokeWidth={1.5} />
            </div>
            <p style={{ color: textColor }}>Loading weather…</p>
        </div>
    );

    const WeatherIcon = WEATHER_ICON_MAP[weather.code] ?? IconCloud;

    return (
        <div className="antares-weather">
            <div className='antares-w-icon-container' style={{ background: accentColor }}>
                <WeatherIcon size={32} strokeWidth={1.5} style={{ color: textColor }} />
            </div>
            <p style={{ color: textColor }}>
                Today weather in {city}<br />
                is {weather.description} with temperature {weather.temperature}{symbol}<br />
                it feels like {weather.feelsLike}{symbol}, and humidity is {weather.humidity}%
            </p>
        </div>
    );
}

/* ── main ────────────────────────────────────────────────────────── */

export default function App() {
    const info = useSystemInfo();
    const settings = useSettings();
    const { weather, error: weatherError } = useWeather({
        enabled: settings.showWeather,
        city: settings.weatherCity,
        unit: settings.temperatureUnit,
    });

    if (!info) {
        return (<></>);
    }

    const { cpu, memory, battery } = info;
    const memPct = pct(memory.used, memory.total);
    const accentColor = settings.accentColor;
    const textColor = settings.theme === 'light' ? '#212121' : '#f8f8f2';

    const now = new Date();
    const year = now.getFullYear();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const { hour, minute } = Utils.timeToWords(now);

    return (
        <div className="antares-container">
            <p className='antares-day-of-week' style={{ color: textColor }}>
                <span style={{ color: accentColor }}>.</span>{weekday}
            </p>
            <p className='antares-date' style={{ color: textColor }}>
                {day} {month} {year}
            </p>
            {settings.showWeather && (
                <WeatherBlock
                    city={settings.weatherCity}
                    weather={weather}
                    error={weatherError}
                    unit={settings.temperatureUnit}
                    accentColor={accentColor}
                    textColor={textColor}
                />
            )}
            <div className='antares-divider' style={{ background: textColor }} />
            <div className='antares-stats'>
                <div className='antares-stat-single'>
                    <CircularProgress value={cpu.usage} color={accentColor} />
                    <p style={{ color: textColor }}>CPU<br /><span style={{ fontWeight: 600 }}>{cpu.usage}%</span></p>
                </div>
                <div className='antares-stat-single'>
                    <CircularProgress value={memPct} color={accentColor} />
                    <p style={{ color: textColor }}>RAM<br /><span style={{ fontWeight: 600 }}>{memPct}%</span></p>
                </div>
                {battery.hasBattery && settings.showBattery && (
                    <div className='antares-stat-single'>
                        <CircularProgress
                            value={battery.level}
                            color={accentColor}
                        />
                        <p style={{ color: textColor }}>Battery<br /><span style={{ fontWeight: 600 }}>{battery.charging ? 'Charging' : `${battery.level}%`}</span></p>
                    </div>
                )}
            </div>
            <p className='antares-time' style={{ color: textColor }}>
                Time is {hour}.{minute}
            </p>
        </div >
    );
}
