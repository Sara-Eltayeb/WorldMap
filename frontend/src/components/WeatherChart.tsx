import { motion } from "framer-motion";
import { Droplets, Wind } from "lucide-react";
import type { Forecast } from "../types";

interface WeatherChartProps {
  forecast: Forecast[];
}

export default function WeatherChart({ forecast }: WeatherChartProps) {
  if (!forecast || forecast.length === 0) return null;

  const maxTemp = Math.max(...forecast.map((d) => d.maxTemp), 0);
  const minTemp = Math.min(...forecast.map((d) => d.minTemp), 0);
  const range = maxTemp - minTemp || 1;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
        5-Day Forecast
      </p>

      <div className="space-y-1.5">
        {forecast.slice(0, 5).map((day, i) => {
          const barHeight = ((day.maxTemp - minTemp) / range) * 100;
          const barTop = 100 - barHeight;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-[10px] text-gray-400 w-8 shrink-0">
                {new Date(day.date).toLocaleDateString("en", {
                  weekday: "short",
                })}
              </span>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] text-blue-400 w-5 text-right">
                  {day.minTemp}°
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barHeight}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ left: `${barTop}%`, maxWidth: "100%" }}
                  />
                </div>
                <span className="text-[10px] text-orange-400 w-5">
                  {day.maxTemp}°
                </span>
              </div>

              <div className="flex items-center gap-1.5 w-12 shrink-0">
                <Droplets className="w-2.5 h-2.5 text-blue-400" />
                <span className="text-[9px] text-gray-400">
                  {day.chanceOfRain}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
