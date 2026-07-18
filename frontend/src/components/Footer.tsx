import { Globe, Code2, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[800] glass-strong border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <span className="hidden sm:flex items-center gap-1">
            <Globe className="w-3 h-3" />
            World Explorer MCP
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Powered by{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              MCP
            </a>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="hidden sm:flex items-center gap-1">
            <Code2 className="w-3 h-3" />
            Built with Express + React
          </span>
          <span>
            Data via{" "}
            <a
              href="https://restcountries.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              REST Countries
            </a>
            {" & "}
            <a
              href="https://wttr.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              wttr.in
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
