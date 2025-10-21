// frontend/src/components/PredictionsTable.tsx

import type { ApiPredictionRow } from "../services/api";

interface PredictionsTableProps {
	predictions: ApiPredictionRow[];
}

// Função auxiliar para formatar com segurança os valores que podem ser nulos
const formatNullableValue = (
	value: number | null,
	fallback: string = "N/A"
): string => {
	// Se o valor for um número, formate-o. Caso contrário, retorne o texto alternativo.
	if (typeof value === "number") {
		return value.toFixed(3);
	}
	return fallback;
};

export default function PredictionsTable({
	predictions
}: PredictionsTableProps) {
	return (
		<div className="bg-white rounded-3xl shadow-lg p-8">
			<h3 className="text-xl font-bold text-gray-800 mb-6">
				Resultados da Predição
			</h3>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
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
									{/* CORREÇÃO APLICADA AQUI */}
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											pred.PREDICAO_Target1 === null
												? "bg-gray-100 text-gray-500"
												: "bg-purple-100 text-purple-700"
										}`}
									>
										{formatNullableValue(
											pred.PREDICAO_Target1
										)}
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
										{formatNullableValue(
											pred.PREDICAO_Target2
										)}
									</span>
								</td>
								<td className="py-4 px-4">
									{/* CORREÇÃO APLICADA AQUI */}
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											pred.PREDICAO_Target3 === null
												? "bg-gray-100 text-gray-500"
												: "bg-blue-100 text-blue-700"
										}`}
									>
										{formatNullableValue(
											pred.PREDICAO_Target3
										)}
									</span>
								</td>
								<td className="py-4 px-4">
									<span className="text-gray-700 text-sm">
										{/* Exemplo de como acessar dados originais com segurança */}
										{String(
											pred.original_data[
												"Código de Acesso"
											] ?? "N/A"
										)}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
