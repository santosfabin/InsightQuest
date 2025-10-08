
interface Prediction {
  match: number;
  target1: number;
  target2: number;
  target3: number;
  confidence: number;
}

interface PredictionsTableProps {
  predictions: Prediction[];
}

export default function PredictionsTable({ predictions }: PredictionsTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Predições Recentes</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Partida</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Target 1</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Target 2</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Target 3</th>
              <th className="text-left text-gray-600 font-semibold py-4 px-4">Confiança</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred) => (
              <tr key={pred.match} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-semibold text-gray-800">#{pred.match}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {pred.target1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {pred.target2}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {pred.target3}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-24">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all"
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {(pred.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}