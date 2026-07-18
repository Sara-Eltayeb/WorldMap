import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Globe, MapPin, BookOpen, DollarSign, Thermometer, Maximize2 } from "lucide-react";
import type { Country, CountryInfo } from "../types";
import { fetchCountryInfo } from "../api";

interface CompareViewProps {
  countries: Country[];
  onBack: () => void;
}

function CompareCard({
  info,
  label,
}: {
  info: CountryInfo | null;
  label: string;
}) {
  if (!info) {
    return (
      <div className="flex-1 glass-strong rounded-2xl border border-white/5 p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-sm">Select a country</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 glass-strong rounded-2xl border border-white/5 p-6 overflow-y-auto max-h-[70vh]"
    >
      <div className="flex items-center gap-3 mb-4">
        {info.flag && (
          <img
            src={info.flag}
            alt=""
            className="w-10 h-7 rounded object-cover ring-1 ring-white/10"
          />
        )}
        <div>
          <p className="text-lg font-bold text-white">{info.country}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Row icon={<MapPin />} label="Capital" value={info.capital} />
        <Row icon={<Users />} label="Population" value={formatPop(info.population)} />
        <Row icon={<Globe />} label="Continent" value={info.continent} />
        <Row icon={<BookOpen />} label="Language" value={info.languages?.join(", ") || "N/A"} />
        <Row icon={<Maximize2 />} label="Area" value={formatAr(info.area)} />
        {info.currency && (
          <Row icon={<DollarSign />} label="Currency" value={`${info.currency.code} (${info.currency.symbol})`} />
        )}
        {info.weather && (
          <Row icon={<Thermometer />} label="Weather" value={`${info.weather.temperature}°C - ${info.weather.condition}`} />
        )}
      </div>
    </motion.div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03]">
      <div className="text-blue-400 [&>svg]:w-3.5 [&>svg]:h-3.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-sm font-medium text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function formatPop(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatAr(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M km²`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K km²`;
  return `${n.toLocaleString()} km²`;
}

export default function CompareView({ countries, onBack }: CompareViewProps) {
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [info1, setInfo1] = useState<CountryInfo | null>(null);
  const [info2, setInfo2] = useState<CountryInfo | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const filtered1 = countries.filter((c) =>
    c.name.toLowerCase().includes(search1.toLowerCase())
  );
  const filtered2 = countries.filter((c) =>
    c.name.toLowerCase().includes(search2.toLowerCase())
  );

  const handleSelect = async (
    name: string,
    setSearch: (v: string) => void,
    setInfo: (v: CountryInfo | null) => void,
    setLoading: (v: boolean) => void
  ) => {
    setSearch(name);
    setLoading(true);
    try {
      const info = await fetchCountryInfo(name);
      setInfo(info);
    } catch {
      setInfo(null);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full pt-16 pb-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Map
          </button>
          <h2 className="text-lg font-bold text-white">Compare Countries</h2>
          <div className="w-20" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <SearchDropdown
              placeholder="Search first country..."
              search={search1}
              onSearchChange={setSearch1}
              filtered={filtered1}
              onSelect={(name) =>
                handleSelect(name, setSearch1, setInfo1, setLoading1)
              }
              loading={loading1}
            />
            <div className="mt-4">
              <CompareCard info={info1} label="Country 1" />
            </div>
          </div>

          <div className="hidden md:flex items-center pt-20">
            <ArrowRight className="w-6 h-6 text-gray-500" />
          </div>

          <div className="flex-1 w-full">
            <SearchDropdown
              placeholder="Search second country..."
              search={search2}
              onSearchChange={setSearch2}
              filtered={filtered2}
              onSelect={(name) =>
                handleSelect(name, setSearch2, setInfo2, setLoading2)
              }
              loading={loading2}
            />
            <div className="mt-4">
              <CompareCard info={info2} label="Country 2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchDropdown({
  placeholder,
  search,
  onSearchChange,
  filtered,
  onSelect,
  loading,
}: {
  placeholder: string;
  search: string;
  onSearchChange: (v: string) => void;
  filtered: Country[];
  onSelect: (name: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none border border-white/5 focus:ring-2 focus:ring-blue-500/50 transition-all"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {open && search && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-1 left-0 right-0 glass-strong rounded-xl border border-white/5 overflow-hidden z-50 max-h-48 overflow-y-auto"
        >
          {filtered.slice(0, 10).map((c) => (
            <button
              key={c.code}
              onMouseDown={() => onSelect(c.name)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-left transition-colors"
            >
              <img
                src={c.flag}
                alt=""
                className="w-5 h-3.5 rounded object-cover"
              />
              <span className="text-sm text-white">{c.name}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {c.capital}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
