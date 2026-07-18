import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";

interface HistoryProps {
  history: string[];
  onSelect: (name: string) => void;
}

export default function History({ history, onSelect }: HistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-4 z-[800] hidden md:block">
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-gray-500" />
        <AnimatePresence>
          {history.map((name, i) => (
            <motion.button
              key={name}
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(name)}
              className="glass rounded-full px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
            >
              {name}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
