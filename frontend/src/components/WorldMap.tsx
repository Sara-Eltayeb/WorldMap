import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";

const COUNTRY_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

interface WorldMapProps {
  selectedCountry: string | null;
  onCountryClick: (name: string) => void;
  loading: boolean;
}

function countryNameNormalize(name: string) {
  const map: Record<string, string> = {
    "United States of America": "United States",
    "United Republic of Tanzania": "Tanzania",
    "Democratic Republic of the Congo": "DR Congo",
    "Republic of the Congo": "Congo",
    "Côte d'Ivoire": "Ivory Coast",
    "Czech Republic": "Czechia",
    "East Timor": "Timor-Leste",
    "Falkland Islands": "Falkland Islands (Malvinas)",
    "North Korea": "North Korea",
    "South Korea": "South Korea",
    "Macedonia": "North Macedonia",
    "Palestine": "Palestine",
    "Syria": "Syrian Arab Republic",
    "Tanzania": "United Republic of Tanzania",
    "United Kingdom": "United Kingdom",
    "Vatican City": "Vatican City",
    "Wallis and Futuna": "Wallis and Futuna Islands",
    "Western Sahara": "Western Sahara",
  };
  return map[name] || name;
}

function MapContent({
  selectedCountry,
  onCountryClick,
  loading,
}: WorldMapProps) {
  const map = useMap();
  const geoJsonLayer = useRef<L.GeoJSON | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const countryToCode = useRef<Map<string, string>>(new Map());
  const codeToCountry = useRef<Map<string, string>>(new Map());

  const getCountryNameFromFeature = useCallback(
    (feature: GeoJSON.Feature): string | null => {
      const props = feature.properties || {};
      return props.ADMIN || props.NAME || props.name || props.ADMIN0 || null;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGeoJSON() {
      try {
        const res = await fetch(COUNTRY_GEOJSON_URL);
        const data: GeoJSON.FeatureCollection = await res.json();
        if (cancelled) return;

        const nameToCode = new Map<string, string>();
        const codeToName = new Map<string, string>();

        data.features.forEach((f) => {
          const props = f.properties || {};
          const name = props.ISO_A3 || props.ISO_A2 || props.ADM0_A3 || "";
          const admin = props.ADMIN || props.NAME || "";
          if (name && admin) {
            nameToCode.set(admin.toLowerCase(), name);
            codeToName.set(name, admin);
          }
        });

        countryToCode.current = nameToCode;
        codeToCountry.current = codeToName;

        const layer = L.geoJSON(data as any, {
          style: () => ({
            fillColor: "#1e293b",
            color: "rgba(255,255,255,0.08)",
            weight: 0.5,
            fillOpacity: 0.6,
          }),
          onEachFeature: (feature, layer) => {
            const name = getCountryNameFromFeature(feature);
            if (!name) return;

            layer.on({
              mouseover: (e) => {
                const target = e.target;
                setHoveredCountry(name);
                target.setStyle({
                  fillColor: "#3b82f6",
                  fillOpacity: 0.3,
                  color: "#3b82f6",
                  weight: 1,
                });
                target.bringToFront();
              },
              mouseout: (e) => {
                const target = e.target;
                setHoveredCountry(null);
                const isSelected =
                  selectedCountry &&
                  countryNameNormalize(name) === selectedCountry;
                target.setStyle({
                  fillColor: isSelected ? "#3b82f6" : "#1e293b",
                  fillOpacity: isSelected ? 0.25 : 0.6,
                  color: isSelected
                    ? "rgba(59,130,246,0.8)"
                    : "rgba(255,255,255,0.08)",
                  weight: isSelected ? 1.5 : 0.5,
                });
              },
              click: () => {
                onCountryClick(name);
              },
            });
          },
        });

        layer.addTo(map);
        geoJsonLayer.current = layer;
      } catch (err) {
        console.warn("Failed to load GeoJSON:", err);
      }
    }

    loadGeoJSON();
    return () => {
      cancelled = true;
      if (geoJsonLayer.current) map.removeLayer(geoJsonLayer.current);
    };
  }, [map, getCountryNameFromFeature, onCountryClick]);

  useEffect(() => {
    if (geoJsonLayer.current) {
      geoJsonLayer.current.eachLayer((layer: any) => {
        const feature = layer.feature;
        const name = getCountryNameFromFeature(feature);
        if (!name) return;
        const normalized = countryNameNormalize(name);
        const isSelected = normalized === selectedCountry;

        if (isSelected) {
          layer.setStyle({
            fillColor: "#3b82f6",
            fillOpacity: 0.25,
            color: "rgba(59,130,246,0.8)",
            weight: 1.5,
          });
          layer.bringToFront();
        } else {
          layer.setStyle({
            fillColor: "#1e293b",
            fillOpacity: 0.6,
            color: "rgba(255,255,255,0.08)",
            weight: 0.5,
          });
        }
      });
    }
  }, [selectedCountry, getCountryNameFromFeature]);

  useEffect(() => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [selectedCountry, map]);

  return null;
}

function LoadingOverlay({ loading }: { loading: boolean }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function WorldMap({
  selectedCountry,
  onCountryClick,
  loading,
}: WorldMapProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MapContent
          selectedCountry={selectedCountry}
          onCountryClick={onCountryClick}
          loading={loading}
        />
      </MapContainer>
      <LoadingOverlay loading={loading} />
    </div>
  );
}
