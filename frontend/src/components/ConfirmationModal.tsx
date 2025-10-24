// frontend/src/components/ConfirmationModal.tsx

import { X, TriangleAlert } from "lucide-react";

interface ConfirmationModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onClose: () => void;
}

export default function ConfirmationModal({
	isOpen,
	title,
	message,
	onConfirm,
	onClose
}: ConfirmationModalProps) {
	// Se não estiver aberto, não renderiza nada
	if (!isOpen) {
		return null;
	}

	const handleConfirm = () => {
		onConfirm();
		onClose(); // Fecha o modal após confirmar
	};

	return (
		// Overlay
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
			onClick={onClose} // Fecha o modal ao clicar fora
		>
			{/* Conteúdo do Modal */}
			<div
				className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-xl m-4"
				onClick={e => e.stopPropagation()} // Impede que o clique no modal feche-o
			>
				{/* Ícone de fechar */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
				>
					<X size={24} />
				</button>

				<div className="flex flex-col items-center text-center">
					{/* Ícone de Alerta */}
					<div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
						<TriangleAlert className="w-10 h-10 text-red-500" />
					</div>

					{/* Título */}
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						{title}
					</h2>

					{/* Mensagem */}
					<p className="text-gray-600 mb-8">{message}</p>

					{/* Botões de Ação */}
					<div className="flex gap-4 w-full">
						<button
							onClick={onClose}
							className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
						>
							Cancelar
						</button>
						<button
							onClick={handleConfirm}
							className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
						>
							Confirmar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
