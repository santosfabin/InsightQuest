import { FileSpreadsheet, TrendingUp, Users, Target, CheckCircle } from 'lucide-react';

interface ExecutiveSummaryProps {
  fileName: string;
  totalRows: number;
  processedRows: number;
  avgTarget1: number;
  avgTarget2: number;
  avgTarget3: number;
  r2_target1?: number | null;
  r2_target2?: number | null;
  r2_target3?: number | null;
  keyInsights: string[];
}

export default function ExecutiveSummary({
  fileName,
  totalRows,
  processedRows,
  avgTarget1,
  avgTarget2,
  avgTarget3,
  r2_target1,
  r2_target2,
  r2_target3,
  keyInsights,
}: ExecutiveSummaryProps) {
  const processingRate = ((processedRows / totalRows) * 100).toFixed(1);
  const avgR2 = [r2_target1, r2_target2, r2_target3]
    .filter((r): r is number => r !== null && r !== undefined)
    .reduce((sum, r) => sum + r, 0) / 3;
  
  const modelQuality = avgR2 > 0.8 ? 'Excelente' : avgR2 > 0.6 ? 'Boa' : avgR2 > 0.4 ? 'Moderada' : 'Sem valor';
  const qualityColor = avgR2 > 0.8 ? 'text-green-600' : avgR2 > 0.6 ? 'text-blue-600' : avgR2 > 0.4 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl shadow-2xl p-8 text-white mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">📊 Resumo Executivo</h1>
          <p className="text-purple-100 text-lg">
            Análise Preditiva Completa - Machine Learning
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
          <p className="text-sm text-purple-100 mb-1">Arquivo Analisado</p>
          <p className="font-bold text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {fileName}
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-200" />
            <p className="text-sm text-purple-200">Registros</p>
          </div>
          <p className="text-3xl font-bold">{processedRows}</p>
          <p className="text-xs text-purple-200 mt-1">de {totalRows} ({processingRate}%)</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-200" />
            <p className="text-sm text-purple-200">Target 1 (Média)</p>
          </div>
          <p className="text-3xl font-bold">{avgTarget1.toFixed(2)}</p>
          {r2_target1 && <p className="text-xs text-purple-200 mt-1">R² = {r2_target1.toFixed(3)}</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-200" />
            <p className="text-sm text-purple-200">Target 2 (Média)</p>
          </div>
          <p className="text-3xl font-bold">{avgTarget2.toFixed(2)}</p>
          {r2_target2 && <p className="text-xs text-purple-200 mt-1">R² = {r2_target2.toFixed(3)}</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-200" />
            <p className="text-sm text-purple-200">Target 3 (Média)</p>
          </div>
          <p className="text-3xl font-bold">{avgTarget3.toFixed(2)}</p>
          {r2_target3 && <p className="text-xs text-purple-200 mt-1">R² = {r2_target3.toFixed(3)}</p>}
        </div>
      </div>

      {/* Status do Modelo */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="text-sm text-purple-200">Qualidade do Modelo</p>
              <p className={`text-2xl font-bold ${qualityColor.replace('text-', 'text-white')}`}>
                {modelQuality}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-200">R² Médio</p>
            <p className="text-3xl font-bold">{avgR2.toFixed(3)}</p>
          </div>
        </div>
      </div>

      {/* Insights Principais */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Principais Descobertas
        </h3>
        <div className="space-y-3">
          {keyInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-purple-50 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nota de Rodapé */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <p className="text-sm text-purple-200 text-center"> 
          Role para baixo para explorar os detalhes e visualizações.
        </p>
      </div>
    </div>
  );
}