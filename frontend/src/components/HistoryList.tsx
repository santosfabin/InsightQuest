import { useState, useEffect } from "react";
import {
	FileText,
	Calendar,
	ArrowRight,
	Trash2,
	Info,
	Loader2
} from "lucide-react";
import {
	getHistoryEntries,
	deleteHistoryEntry,
	clearHistory,
	type HistoryEntry
} from "../services/db";
import ConfirmationModal from "./ConfirmationModal.tsx";

interface HistoryListProps {
	onLoadEntry: (entry: HistoryEntry) => void;
}

export default function HistoryList({ onLoadEntry }: HistoryListProps) {
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [modalState, setModalState] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {}
	});

	useEffect(() => {
		const fetchHistory = async () => {
			setIsLoading(true);
			const savedEntries = await getHistoryEntries();
			setEntries(savedEntries);
			setIsLoading(false);
		};
		fetchHistory();
	}, []);

	const openModal = (
		title: string,
		message: string,
		onConfirm: () => void
	) => {
		setModalState({ isOpen: true, title, message, onConfirm });
	};

	const closeModal = () => {
		setModalState({
			isOpen: false,
			title: "",
			message: "",
			onConfirm: () => {}
		});
	};

	const handleDelete = (id: number) => {
		openModal(
			"Apagar Análise",
			"Tem certeza que deseja apagar esta análise? A ação não pode ser desfeita.",
			async () => {
				await deleteHistoryEntry(id);
				setEntries(current => current.filter(entry => entry.id !== id));
			}
		);
	};

	const handleClearAll = () => {
		openModal(
			"Limpar Histórico",
			"Deseja realmente apagar TODO o histórico? Esta ação é irreversível.",
			async () => {
				await clearHistory();
				setEntries([]);
			}
		);
	};

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
		<>
			<div className="space-y-4">
				{/* Botão para limpar o histórico */}
				<div className="flex justify-end">
					<button
						onClick={handleClearAll}
						className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-gray-500 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors"
					>
						<Trash2 className="w-4 h-4" />
						Limpar Histórico
					</button>
				</div>

				{entries.map(entry => (
					<div
						key={entry.id}
						className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-xl hover:ring-2 hover:ring-purple-500"
					>
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							{/* Lado Esquerdo: Informações do Arquivo */}
							<div className="flex-grow w-full">
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

							{/* Lado Direito: Grupo de Botões */}
							<div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
								<button
									onClick={() => onLoadEntry(entry)}
									className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-md flex items-center gap-2 w-full justify-center"
								>
									Carregar Análise
									<ArrowRight className="w-4 h-4" />
								</button>
								<button
									onClick={() => handleDelete(entry.id!)}
									title="Apagar análise"
									className="p-3 bg-gray-100 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
								>
									<Trash2 className="w-5 h-5" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Renderiza o modal */}
			<ConfirmationModal
				isOpen={modalState.isOpen}
				title={modalState.title}
				message={modalState.message}
				onConfirm={modalState.onConfirm}
				onClose={closeModal}
			/>
		</>
	);
}
