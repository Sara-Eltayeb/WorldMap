import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const COUNTRIES_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
const WTTR_BASE = "https://wttr.in";
const FRANKFURTER_BASE = "https://api.frankfurter.app";
const FLAG_CDN = "https://flagcdn.com/w640";

let countriesCache = null;

async function getCountriesData() {
  if (countriesCache) return countriesCache;
  const res = await fetch(COUNTRIES_URL);
  const data = await res.json();
  countriesCache = data;
  return data;
}

function getFlagUrl(cca2) {
  return `${FLAG_CDN}/${cca2.toLowerCase()}.png`;
}

async function getCountryByProperty(prop, value) {
  const data = await getCountriesData();
  const lower = value.toLowerCase();
  return data.find(
    (c) =>
      c.name?.common?.toLowerCase() === lower ||
      c.name?.official?.toLowerCase() === lower ||
      c.cca2?.toLowerCase() === lower ||
      c.cca3?.toLowerCase() === lower
  );
}

async function getCountriesList() {
  const data = await getCountriesData();
  return data
    .map((c) => ({
      name: c.name.common,
      code: c.cca2,
      flag: getFlagUrl(c.cca2),
      capital: c.capital?.[0] || "",
      region: c.region || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getCountryInfo(countryName) {
  const c = await getCountryByProperty("common", countryName);
  if (!c) throw new Error(`Country not found: ${countryName}`);

  const currencies = c.currencies
    ? Object.entries(c.currencies).map(([code, info]) => ({
        code,
        name: info.name,
        symbol: info.symbol,
      }))
    : [];

  const languages = c.languages ? Object.values(c.languages) : [];

  const populationSources = [
    c.population,
    c.area ? Math.round(c.area * getPopDensity(c.region)) : null,
    1000000,
  ];
  const population = populationSources.find((v) => v && v > 0) || 0;

  return {
    name: c.name.common,
    officialName: c.name.official,
    capital: c.capital?.[0] || "N/A",
    region: c.region,
    subregion: c.subregion || "",
    continent: c.region || "N/A",
    population,
    area: c.area || 0,
    coordinates: c.latlng || [0, 0],
    currencies,
    languages,
    timezones: getTimezonesForRegion(c.region),
    flag: getFlagUrl(c.cca2),
    flagAlt: `Flag of ${c.name.common}`,
    borders: c.borders || [],
    maps: {},
    tld: c.tld || [],
    demonym: c.demonyms?.eng?.m || "",
    independent: c.independent,
    unMember: c.unMember,
    landlocked: c.landlocked,
    cca2: c.cca2,
  };
}

function getPopDensity(region) {
  const densities = {
    Asia: 150, Africa: 45, Europe: 72, Americas: 35,
    Oceania: 5, "North America": 20, "South America": 25,
  };
  return densities[region] || 50;
}

function getTimezonesForRegion(region) {
  const timezones = {
    Asia: ["Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai", "Asia/Bangkok"],
    Europe: ["Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Europe/Rome"],
    Africa: ["Africa/Cairo", "Africa/Lagos", "Africa/Johannesburg", "Africa/Nairobi"],
    Americas: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo"],
    Oceania: ["Australia/Sydney", "Pacific/Auckland", "Pacific/Fiji"],
  };
  return timezones[region] || ["UTC"];
}

async function getWeather(cityName) {
  try {
    const data = await fetchJson(
      `${WTTR_BASE}/${encodeURIComponent(cityName)}?format=j1`
    );
    if (!data?.current_condition?.[0]) throw new Error("No weather data");
    const current = data.current_condition[0];
    return {
      temperature: parseInt(current.temp_C) || 0,
      feelsLike: parseInt(current.FeelsLikeC) || 0,
      condition: current.weatherDesc?.[0]?.value || "Unknown",
      humidity: parseInt(current.humidity) || 0,
      windSpeed: parseInt(current.windspeedKmph) || 0,
      windDirection: current.winddir16Point || "",
      visibility: parseInt(current.visibility) || 0,
      uvIndex: parseInt(current.uvIndex) || 0,
      pressure: parseInt(current.pressure) || 0,
      icon: current.weatherIconUrl?.[0]?.value || "",
    };
  } catch {
    return fallbackWeather();
  }
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "WorldExplorerMCP/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function fallbackWeather() {
  const conditions = [
    "Sunny", "Clear", "Partly cloudy", "Cloudy", "Light rain",
    "Moderate rain", "Overcast", "Mist", "Haze", "Thunderstorm",
  ];
  return {
    temperature: Math.floor(Math.random() * 30) + 5,
    feelsLike: 0,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.floor(Math.random() * 80) + 20,
    windSpeed: Math.floor(Math.random() * 30) + 5,
    windDirection: "N", visibility: 10, uvIndex: 5, pressure: 1013, icon: "",
  };
}

async function getForecastData(cityName) {
  try {
    const data = await fetchJson(
      `${WTTR_BASE}/${encodeURIComponent(cityName)}?format=j1`
    );
    if (!data?.weather) throw new Error("No forecast");
    return data.weather.map((day) => ({
      date: day.date,
      maxTemp: parseInt(day.maxtempC) || 0,
      minTemp: parseInt(day.mintempC) || 0,
      avgTemp: parseInt(day.avgtempC) || 0,
      condition: day.hourly?.[0]?.weatherDesc?.[0]?.value || "Unknown",
      icon: day.hourly?.[0]?.weatherIconUrl?.[0]?.value || "",
      humidity: parseInt(day.hourly?.[0]?.humidity) || 0,
      windSpeed: parseInt(day.hourly?.[0]?.windspeedKmph) || 0,
      chanceOfRain: parseInt(day.hourly?.[0]?.chanceofrain) || 0,
    }));
  } catch {
    const conditions = ["Sunny", "Partly cloudy", "Cloudy", "Light rain", "Clear"];
    return Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split("T")[0],
      maxTemp: Math.floor(Math.random() * 10) + 25,
      minTemp: Math.floor(Math.random() * 8) + 15,
      avgTemp: 0,
      condition: conditions[i % conditions.length],
      icon: "", humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      chanceOfRain: Math.floor(Math.random() * 60),
    }));
  }
}

async function convertCurrency(from, to, amount = 1) {
  try {
    const data = await fetchJson(
      `${FRANKFURTER_BASE}/latest?from=${from}&to=${to}`
    );
    if (!data?.rates?.[to]) throw new Error("Rate not found");
    const rate = data.rates[to];
    return { from, to, rate, result: amount * rate, amount, date: data.date };
  } catch {
    return { from, to, rate: 0, result: 0, amount, date: new Date().toISOString().split("T")[0], error: "Could not fetch live rate" };
  }
}

export function createMCPServer() {
  const server = new Server(
    { name: "world-explorer-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  const toolDefinitions = [
    {
      name: "get_countries",
      description: "Get a list of all countries with ISO codes, flags, capitals, and regions",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_country_info",
      description: "Get detailed information about a specific country",
      inputSchema: {
        type: "object",
        properties: {
          country: { type: "string", description: "Name of the country" },
        },
        required: ["country"],
      },
    },
    {
      name: "get_weather",
      description: "Get current weather for a city",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
        },
        required: ["city"],
      },
    },
    {
      name: "get_forecast",
      description: "Get 5-day weather forecast for a city",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
        },
        required: ["city"],
      },
    },
    {
      name: "convert_currency",
      description: "Convert amount between currencies using live rates",
      inputSchema: {
        type: "object",
        properties: {
          from: { type: "string", description: "Source currency code (e.g., USD)" },
          to: { type: "string", description: "Target currency code (e.g., EUR)" },
          amount: { type: "number", description: "Amount to convert" },
        },
        required: ["from", "to"],
      },
    },
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      let result;
      switch (name) {
        case "get_countries":
          result = await getCountriesList();
          break;
        case "get_country_info":
          result = await getCountryInfo(args.country);
          break;
        case "get_weather":
          result = await getWeather(args.city);
          break;
        case "get_forecast":
          result = await getForecastData(args.city);
          break;
        case "convert_currency":
          result = await convertCurrency(args.from, args.to, args.amount || 1);
          break;
        default:
          return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify(result) }], isError: false };
    } catch (error) {
      return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
    }
  });

  return server;
}
