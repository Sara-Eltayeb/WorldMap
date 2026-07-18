import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import WorldMap from "./components/WorldMap";
import Sidebar from "./components/Sidebar";
import CompareView from "./components/CompareView";
import History from "./components/History";
import Footer from "./components/Footer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { fetchCountries, fetchCountryInfo } from "./api";
import type { Country, CountryInfo, ViewState } from "./types";

export default function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewState>("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useLocalStorage<string[]>("we-history", []);
  const [favorites, setFavorites] = useLocalStorage<string[]>("we-favorites", []);
  const [compareCountries, setCompareCountries] = useState<string[]>([]);

  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .catch(() => setError("Failed to load countries"));
  }, []);

  const handleCountryClick = useCallback(
    async (name: string) => {
      setLoading(true);
      setError("");
      try {
        const info = await fetchCountryInfo(name);
        setSelectedCountry(info);
        setHistory((prev) => {
          const filtered = prev.filter((c) => c !== name);
          return [name, ...filtered].slice(0, 10);
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load country info");
      } finally {
        setLoading(false);
      }
    },
    [setHistory]
  );

  const toggleFavorite = useCallback(
    (name: string) => {
      setFavorites((prev) =>
        prev.includes(name)
          ? prev.filter((c) => c !== name)
          : [name, ...prev]
      );
    },
    [setFavorites]
  );

  const handleCloseSidebar = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const match = countries.find(
        (c) => c.name.toLowerCase() === query.toLowerCase()
      );
      if (match) handleCountryClick(match.name);
    },
    [countries, handleCountryClick]
  );

  const handleSelectFromHistory = useCallback(
    (name: string) => {
      const country = countries.find((c) => c.name === name);
      if (country) {
        setSearchQuery(name);
        handleCountryClick(name);
      }
    },
    [countries, handleCountryClick]
  );

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-dark-400">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        suggestions={filteredCountries.slice(0, 8)}
        view={view}
        onViewChange={setView}
        onSelectSuggestion={(name) => {
          setSearchQuery(name);
          const match = countries.find((c) => c.name === name);
          if (match) handleCountryClick(match.name);
        }}
        favorites={favorites}
        onSelectFavorite={(name) => {
          handleCountryClick(name);
          setSearchQuery(name);
        }}
      />

      <AnimatePresence mode="wait">
        {view === "compare" ? (
          <CompareView
            key="compare"
            countries={countries}
            onBack={() => setView("map")}
          />
        ) : (
          <div className="w-full h-full pt-16" key="map-view">
            <WorldMap
              selectedCountry={selectedCountry?.country || null}
              onCountryClick={handleCountryClick}
              loading={loading}
            />

            <History
              history={history}
              onSelect={handleSelectFromHistory}
            />

            <AnimatePresence>
              {selectedCountry && (
                <Sidebar
                  country={selectedCountry}
                  onClose={handleCloseSidebar}
                  isFavorite={favorites.includes(selectedCountry.country)}
                  onToggleFavorite={() => toggleFavorite(selectedCountry.country)}
                />
              )}
            </AnimatePresence>

            {error && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-xl text-red-400 text-sm z-[1000]">
                {error}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
