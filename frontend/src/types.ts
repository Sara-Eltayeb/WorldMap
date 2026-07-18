export interface Country {
  name: string;
  code: string;
  flag: string;
  capital: string;
  region: string;
}

export interface Weather {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  uvIndex: number;
  pressure: number;
  icon: string;
}

export interface Forecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  chanceOfRain: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number | null;
}

export interface CountryInfo {
  country: string;
  officialName: string;
  weather: Weather | null;
  forecast: Forecast[];
  currency: Currency | null;
  capital: string;
  population: number;
  continent: string;
  region: string;
  subregion: string;
  languages: string[];
  time: string;
  timezones: string[];
  coordinates: number[];
  flag: string;
  flagAlt: string;
  area: number;
  borders: string[];
  landlocked: boolean;
  demonym: string;
  tld: string[];
  maps: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CompareData {
  country1: CountryInfo;
  country2: CountryInfo;
}

export interface ConversionResult {
  from: string;
  to: string;
  rate: number;
  result: number;
  amount: number;
  date: string;
}

export type ViewState = "map" | "compare" | "favorites";
