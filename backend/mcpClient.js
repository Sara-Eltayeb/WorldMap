import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMCPServer } from "./mcpServer.js";

export class MCPClient {
  constructor() {
    this.client = new Client(
      { name: "world-explorer-client", version: "1.0.0" },
      { capabilities: {} }
    );
    this.server = createMCPServer();
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await Promise.all([
      this.client.connect(clientTransport),
      this.server.connect(serverTransport),
    ]);
    this.connected = true;
  }

  async callTool(toolName, args = {}) {
    if (!this.connected) await this.connect();
    const result = await this.client.callTool({
      name: toolName,
      arguments: args,
    });
    const text = result.content?.[0]?.text;
    if (result.isError) {
      const parsed = JSON.parse(text);
      throw new Error(parsed.error || "Tool call failed");
    }
    return JSON.parse(text);
  }

  async getCountries() {
    return this.callTool("get_countries");
  }

  async getCountryInfo(country) {
    const info = await this.callTool("get_country_info", { country });
    const capital = info.capital;
    let weather = null;
    let forecast = null;

    if (capital && capital !== "N/A") {
      try {
        weather = await this.callTool("get_weather", { city: capital });
      } catch {}
      try {
        forecast = await this.callTool("get_forecast", { city: capital });
      } catch {}
    }

    const primaryCurrency = info.currencies?.[0];
    let exchangeRate = null;
    if (primaryCurrency) {
      try {
        exchangeRate = await this.callTool("convert_currency", {
          from: "USD",
          to: primaryCurrency.code,
          amount: 1,
        });
      } catch {}
    }

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: info.timezones?.[0] || "UTC",
      timeZoneName: "short",
    });

    return {
      country: info.name,
      officialName: info.officialName,
      weather: weather
        ? {
            temperature: weather.temperature,
            feelsLike: weather.feelsLike,
            condition: weather.condition,
            humidity: weather.humidity,
            windSpeed: weather.windSpeed,
            windDirection: weather.windDirection,
            visibility: weather.visibility,
            uvIndex: weather.uvIndex,
            pressure: weather.pressure,
            icon: weather.icon,
          }
        : null,
      forecast: forecast || [],
      currency: primaryCurrency
        ? {
            code: primaryCurrency.code,
            name: primaryCurrency.name,
            symbol: primaryCurrency.symbol,
            exchangeRate: exchangeRate?.rate || null,
          }
        : null,
      capital: info.capital,
      population: info.population,
      continent: info.continent,
      region: info.region,
      subregion: info.subregion,
      languages: info.languages,
      time: currentTime,
      timezones: info.timezones,
      coordinates: info.coordinates,
      flag: info.flag,
      flagAlt: info.flagAlt,
      area: info.area,
      borders: info.borders,
      landlocked: info.landlocked,
      demonym: info.demonym,
      tld: info.tld,
      maps: info.maps,
    };
  }

  async getWeather(city) {
    return this.callTool("get_weather", { city });
  }

  async getForecast(city) {
    return this.callTool("get_forecast", { city });
  }

  async convertCurrency(from, to, amount = 1) {
    return this.callTool("convert_currency", { from, to, amount });
  }

  async disconnect() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }
}

let instance = null;

export async function getMCPClient() {
  if (!instance) {
    instance = new MCPClient();
    await instance.connect();
  }
  return instance;
}
