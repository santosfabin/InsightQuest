import type { ApiPredictionRow } from "../services/api";

interface PredictionsTableProps {
  predictions: ApiPredictionRow[];
}

const formatNullableValue = (
  value: number | null,
  fallback: string = "N/A"
): string => {
  if (typeof value === "number") {
    return value.toFixed(3);
  }
  return fallback;
};

export default function PredictionsTable({
  predictions,
}: PredictionsTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
        Resultados da Predição
      </h3>
      <div className="max-h-[60vh] overflow-y-auto relative pr-2">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-[68px] bg-white z-10">
              <tr className="border-b-2 border-gray-100">
                <th className="text-left text-gray-600 font-semibold py-4 px-4">
                  #
                </th>
                <th className="text-left text-gray-600 font-semibold py-4 px-4">
                  Predição Target 1
                </th>
                <th className="text-left text-gray-600 font-semibold py-4 px-4">
                  Predição Target 2
                </th>
                <th className="text-left text-gray-600 font-semibold py-4 px-4">
                  Predição Target 3
                </th>
                <th className="text-left text-gray-600 font-semibold py-4 px-4">
                  Código de Acesso (Original)
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-50 hover:bg-purple-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-800">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pred.PREDICAO_Target1 === null
                          ? "bg-gray-100 text-gray-500"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {formatNullableValue(pred.PREDICAO_Target1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {/* CORREÇÃO APLICADA AQUI */}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pred.PREDICAO_Target2 === null
                          ? "bg-gray-100 text-gray-500"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {formatNullableValue(pred.PREDICAO_Target2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pred.PREDICAO_Target3 === null
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {formatNullableValue(pred.PREDICAO_Target3)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pred.codigo_acesso || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
