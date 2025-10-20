
// Importa a interface correta que vem da API
import type { ApiPredictionRow } from '../services/api';

// REMOVIDO: A interface antiga 'Prediction' não é mais necessária
// interface Prediction {
//   match: number;
//   target1: number;
//   target2: number;
//   target3: number;
//   confidence: number;
// }

// A props agora espera um array do tipo ApiPredictionRow[]
interface PredictionsTableProps {
  predictions: ApiPredictionRow[];
}

export default function PredictionsTable({ predictions }: PredictionsTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Resultados da Predição</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left text-gray-600 font-semibold py-4 px-4">#</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Predição Target 1</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Predição Target 2</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Predição Target 3</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Código de Acesso (Original)</th>
              {/* Adicione mais cabeçalhos aqui se quiser mostrar mais dados originais */}
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-semibold text-gray-800">{index + 1}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {pred.PREDICAO_Target1.toFixed(3)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {pred.PREDICAO_Target2.toFixed(3)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {pred.PREDICAO_Target3.toFixed(3)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-700 text-sm">
                  </span>
                </td>
                {/* Adicione mais células aqui para colunas originais adicionais */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}