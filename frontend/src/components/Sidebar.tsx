import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  Sun,
  Users,
  Globe,
  BookOpen,
  Thermometer,
  Heart,
  Download,
  DollarSign,
  Wind,
  Droplets,
  Eye,
  ArrowUpDown,
  Maximize2,
} from "lucide-react";
import type { CountryInfo } from "../types";
import WeatherChart from "./WeatherChart";

interface SidebarProps {
  country: CountryInfo;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const shimmerVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

function InfoRow({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <motion.div
      custom={delay}
      variants={shimmerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
        <div className="text-blue-400 [&>svg]:w-4 [&>svg]:h-4">{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
          {label}
        </p>
        <p className="text-sm font-medium text-white truncate">{value}</p>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <motion.div
      custom={delay}
      variants={shimmerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
    >
      <div className="text-blue-400 [&>svg]:w-4 [&>svg]:h-4 mb-1">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-gray-500">
        {label}
      </p>
    </motion.div>
  );
}

function formatPopulation(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatArea(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M km²`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K km²`;
  return `${n.toLocaleString()} km²`;
}

function formatNumber(n: number) {
  return n?.toLocaleString() || "0";
}

export default function Sidebar({
  country,
  onClose,
  isFavorite,
  onToggleFavorite,
}: SidebarProps) {
  const [showForecast, setShowForecast] = useState(false);
  const weatherIcon = country.weather?.icon;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(country, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${country.country.replace(/\s+/g, "_")}_info.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed top-16 right-0 bottom-12 w-full sm:w-[400px] lg:w-[420px] z-[900] overflow-hidden"
    >
      <div className="h-full glass-strong border-l border-white/5 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {country.flag && (
              <motion.img
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                src={country.flag}
                alt={country.flagAlt || `${country.country} flag`}
                className="w-8 h-6 rounded object-cover shadow-lg ring-1 ring-white/10"
              />
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {country.country}
              </h2>
              {country.officialName && country.officialName !== country.country && (
                <p className="text-[10px] text-gray-500 truncate">
                  {country.officialName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg transition-all ${
                isFavorite
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-amber-400" : ""}`}
              />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {country.weather && (
            <motion.div
              variants={shimmerVariants}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                    Current Weather
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {country.weather.temperature}°C
                  </p>
                  <p className="text-sm text-gray-400">
                    {country.weather.condition}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-1">
                    {weatherIcon ? (
                      <img
                        src={weatherIcon}
                        alt=""
                        className="w-12 h-12 inline-block"
                      />
                    ) : (
                      <Sun className="w-12 h-12 text-amber-400 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Feels like {country.weather.feelsLike}°C
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="text-center">
                  <Wind className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                  <p className="text-xs font-medium text-white">
                    {country.weather.windSpeed}
                  </p>
                  <p className="text-[9px] text-gray-500">km/h</p>
                </div>
                <div className="text-center">
                  <Droplets className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                  <p className="text-xs font-medium text-white">
                    {country.weather.humidity}%
                  </p>
                  <p className="text-[9px] text-gray-500">Humidity</p>
                </div>
                <div className="text-center">
                  <Eye className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                  <p className="text-xs font-medium text-white">
                    {country.weather.visibility}
                  </p>
                  <p className="text-[9px] text-gray-500">km</p>
                </div>
              </div>
              {country.forecast.length > 0 && (
                <button
                  onClick={() => setShowForecast(!showForecast)}
                  className="mt-3 w-full text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 py-1"
                >
                  <Thermometer className="w-3 h-3" />
                  {showForecast ? "Hide forecast" : "Show 5-day forecast"}
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              )}
              {showForecast && country.forecast.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <WeatherChart forecast={country.forecast} />
                </div>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {country.weather && (
              <>
                <StatCard
                  icon={<Thermometer />}
                  label="Feels Like"
                  value={`${country.weather.feelsLike}°`}
                  delay={1}
                />
                <StatCard
                  icon={<Wind />}
                  label="Wind"
                  value={`${country.weather.windSpeed}`}
                  delay={2}
                />
              </>
            )}
            {country.currency && (
              <StatCard
                icon={<DollarSign />}
                label={country.currency.code}
                value={country.currency.symbol || country.currency.code}
                delay={3}
              />
            )}
            {country.population > 0 && (
              <StatCard
                icon={<Users />}
                label="Population"
                value={formatPopulation(country.population)}
                delay={4}
              />
            )}
          </div>

          <div className="space-y-1">
            {country.capital && country.capital !== "N/A" && (
              <InfoRow
                icon={<MapPin />}
                label="Capital"
                value={country.capital}
                delay={5}
              />
            )}
            {country.continent && (
              <InfoRow
                icon={<Globe />}
                label="Continent"
                value={country.continent}
                delay={6}
              />
            )}
            {country.subregion && (
              <InfoRow
                icon={<Globe />}
                label="Subregion"
                value={country.subregion}
                delay={7}
              />
            )}
            {country.languages && country.languages.length > 0 && (
              <InfoRow
                icon={<BookOpen />}
                label={country.languages.length > 1 ? "Languages" : "Language"}
                value={country.languages.join(", ")}
                delay={8}
              />
            )}
            {country.time && (
              <InfoRow
                icon={<Clock />}
                label="Local Time"
                value={country.time}
                delay={9}
              />
            )}
            {country.coordinates &&
              country.coordinates.length === 2 && (
                <InfoRow
                  icon={<MapPin />}
                  label="Coordinates"
                  value={`${country.coordinates[0].toFixed(2)}°, ${country.coordinates[1].toFixed(2)}°`}
                  delay={10}
                />
              )}
            {country.area > 0 && (
              <InfoRow
                icon={<Maximize2 />}
                label="Area"
                value={formatArea(country.area)}
                delay={11}
              />
            )}
            {country.currency?.exchangeRate && (
              <InfoRow
                icon={<DollarSign />}
                label="1 USD →"
                value={`${country.currency.exchangeRate.toFixed(4)} ${country.currency.code}`}
                delay={12}
              />
            )}
            {country.timezones && country.timezones.length > 0 && (
              <InfoRow
                icon={<Clock />}
                label="Timezone"
                value={country.timezones[0]}
                delay={13}
              />
            )}
            {country.borders && country.borders.length > 0 && (
              <InfoRow
                icon={<Globe />}
                label="Borders"
                value={`${country.borders.length} countries`}
                delay={14}
              />
            )}
            {country.tld && country.tld.length > 0 && (
              <InfoRow
                icon={<Globe />}
                label="TLD"
                value={country.tld.join(", ")}
                delay={15}
              />
            )}
          </div>

          <motion.div
            custom={16}
            variants={shimmerVariants}
            initial="hidden"
            animate="visible"
            className="pt-2 text-[10px] text-center text-gray-600"
          >
            Data retrieved via MCP tools ·{" "}
            {new Date().toLocaleDateString()}
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
