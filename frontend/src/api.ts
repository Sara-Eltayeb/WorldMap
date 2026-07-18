import type { ApiResponse, Country, CountryInfo, CompareData, ConversionResult, Forecast } from "./types";

const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data;
}

export async function fetchCountries(): Promise<Country[]> {
  return request<Country[]>("/countries");
}

export async function fetchCountryInfo(country: string): Promise<CountryInfo> {
  return request<CountryInfo>("/countries/info", {
    method: "POST",
    body: JSON.stringify({ country }),
  });
}

export async function fetchCompare(
  country1: string,
  country2: string
): Promise<CompareData> {
  return request<CompareData>("/countries/compare", {
    method: "POST",
    body: JSON.stringify({ country1, country2 }),
  });
}

export async function fetchWeather(city: string): Promise<CountryInfo["weather"]> {
  return request<CountryInfo["weather"]>("/countries/weather", {
    method: "POST",
    body: JSON.stringify({ city }),
  });
}

export async function fetchForecast(city: string): Promise<Forecast[]> {
  return request<Forecast[]>("/countries/forecast", {
    method: "POST",
    body: JSON.stringify({ city }),
  });
}

export async function fetchConversion(
  from: string,
  to: string,
  amount?: number
): Promise<ConversionResult> {
  return request<ConversionResult>("/countries/convert", {
    method: "POST",
    body: JSON.stringify({ from, to, amount }),
  });
}
