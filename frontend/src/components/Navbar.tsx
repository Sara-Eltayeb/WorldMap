import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  X,
  Columns2,
  Heart,
  Star,
  ChevronDown,
} from "lucide-react";
import type { ViewState, Country } from "../types";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearch: (q: string) => void;
  suggestions: Country[];
  view: ViewState;
  onViewChange: (v: ViewState) => void;
  onSelectSuggestion: (name: string) => void;
  favorites: string[];
  onSelectFavorite: (name: string) => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  onSearch,
  suggestions,
  view,
  onViewChange,
  onSelectSuggestion,
  favorites,
  onSelectFavorite,
}: NavbarProps) {
  const [focused, setFocused] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <motion.div
          className="flex items-center gap-2 shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm hidden sm:block">
            <span className="gradient-text">World Explorer</span>
          </span>
        </motion.div>

        <div className="flex-1 max-w-md mx-auto relative">
          <div
            className={`flex items-center gap-2 glass rounded-xl px-3 h-10 transition-all duration-300 ${
              focused
                ? "ring-2 ring-blue-500/50 glow-blue"
                : "ring-1 ring-white/5"
            }`}
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery) onSearch(searchQuery);
                if (e.key === "Escape") {
                  onSearchChange("");
                  inputRef.current?.blur();
                }
              }}
              placeholder='Search countries... (Ctrl+K)'
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none border-none"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange("")} className="shrink-0">
                <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {focused && searchQuery && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full mt-1 left-0 right-0 glass-strong rounded-xl overflow-hidden z-50 border border-white/5"
              >
                {suggestions.map((c) => (
                  <button
                    key={c.code}
                    onMouseDown={() => onSelectSuggestion(c.name)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <img
                      src={c.flag}
                      alt=""
                      className="w-5 h-3.5 object-cover rounded"
                    />
                    <span className="text-sm text-white">{c.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {c.capital}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange(view === "compare" ? "map" : "compare")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === "compare"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFavs(!showFavs)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                favorites.length > 0
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favorites.length > 0 ? "fill-amber-400" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {favorites.length > 0 ? favorites.length : "Favorites"}
              </span>
            </button>

            <AnimatePresence>
              {showFavs && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-64 glass-strong rounded-xl border border-white/5 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/5">
                    <span className="text-xs font-medium text-gray-400">
                      Favorite Countries
                    </span>
                  </div>
                  {favorites.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      <Star className="w-4 h-4 mx-auto mb-1 opacity-50" />
                      No favorites yet
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {favorites.map((name) => (
                        <button
                          key={name}
                          onClick={() => {
                            onSelectFavorite(name);
                            setShowFavs(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left text-sm text-white transition-colors"
                        >
                          <Heart className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
