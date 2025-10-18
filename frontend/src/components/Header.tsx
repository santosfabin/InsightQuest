import { BarChart3, Clock, Activity } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ML Analytics</h1>
              <p className="text-xs text-gray-500">
                Análise Preditiva Inteligente
              </p>
            </div>
          </div>

          {/* Navigation Button Group */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/40 animate-pulse-subtle"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/40 animate-pulse-subtle"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <Clock className="w-5 h-5" />
              Histórico
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "preview"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/40 animate-pulse-subtle"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </header>
  );
}