// frontend/src/components/HistoryList.tsx

import { useState, useEffect } from "react";
import { FileText, Calendar, ArrowRight, Loader2, Info } from "lucide-react";
import { getHistoryEntries, type HistoryEntry } from "../services/db";

interface HistoryListProps {
	// Função que será chamada quando o usuário clicar para carregar uma análise
	onLoadEntry: (entry: HistoryEntry) => void;
}

export default function HistoryList({ onLoadEntry }: HistoryListProps) {
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchHistory = async () => {
			setIsLoading(true);
			const savedEntries = await getHistoryEntries();
			setEntries(savedEntries);
			setIsLoading(false);
		};
		fetchHistory();
	}, []);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
				<p className="ml-4 text-gray-600 text-lg">
					Carregando histórico...
				</p>
			</div>
		);
	}

	if (entries.length === 0) {
		return (
			<div className="bg-white rounded-3xl shadow-lg p-12 text-center">
				<Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />
				<h3 className="text-xl font-semibold text-gray-800">
					Seu histórico está vazio
				</h3>
				<p className="text-gray-500 mt-2">
					Quando você realizar uma nova análise, ela aparecerá aqui
					para consulta futura.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{entries.map(entry => (
				<div
					key={entry.id}
					className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-xl hover:ring-2 hover:ring-purple-500"
				>
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<div className="flex-grow">
							<div className="flex items-center gap-3 mb-2">
								<FileText className="w-6 h-6 text-purple-700" />
								<h3 className="text-lg font-bold text-gray-800 break-all">
									{entry.fileName}
								</h3>
							</div>
							<div className="flex items-center gap-6 text-sm text-gray-500">
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									<span>
										{new Date(
											entry.timestamp
										).toLocaleString("pt-BR")}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span>
										{entry.processedRows} /{" "}
										{entry.totalRows} linhas processadas
									</span>
								</div>
							</div>
						</div>
						<button
							onClick={() => onLoadEntry(entry)}
							className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
						>
							Carregar Análise <ArrowRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
