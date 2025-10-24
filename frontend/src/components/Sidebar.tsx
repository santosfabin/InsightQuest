import { BarChart3, Clock, Activity } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-white shadow-xl border-r border-gray-200 flex flex-col p-6 sticky top-0 z-10">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">ML Analytics</h1>
          <p className="text-xs text-gray-500">
            Análise Preditiva
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-3">
        {/* Botão Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 w-full text-left ${
            activeTab === "dashboard"
              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/40 animate-pulse-subtle" // Estilo ATIVO original
              : "text-gray-600 hover:text-gray-800 hover:bg-white/50" // Estilo INATIVO/HOVER original
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Dashboard
        </button>
        {/* Botão Histórico */}
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 w-full text-left ${
            activeTab === "history"
              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/40 animate-pulse-subtle"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
          }`}
        >
          <Clock className="w-5 h-5" />
          Histórico
        </button>
        {/* Botão Preview */}
      </nav>

      <div className="mt-auto text-center text-xs text-gray-400">
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            /* Sombra padrão para estado normal e final da animação */
            box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.4), 0 4px 6px -4px rgba(168, 85, 247, 0.4);
          }
          50% {
            transform: scale(1.03); /* Leve aumento no meio da animação */
            /* Sombra mais pronunciada no pico da animação */
            box-shadow: 0 20px 25px -5px rgba(168, 85, 247, 0.5), 0 8px 10px -6px rgba(168, 85, 247, 0.5);
          }
        }

        /* Classe que aplica a animação */
        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

    </aside>
  );
}