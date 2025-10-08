import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, Loader2, TrendingUp } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onProcess: () => void;
  isProcessing: boolean;
  onCancel: () => void;
}

export default function FileUpload({ 
  file, 
  setFile, 
  onProcess, 
  isProcessing, 
  onCancel 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.name.endsWith('.csv')) {
      setFile(uploadedFile);
    } else {
      alert('Por favor, selecione um arquivo CSV válido');
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Por favor, selecione um arquivo CSV válido');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-4">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload de Dados</h2>
            <p className="text-gray-500">Envie sua planilha CSV para análise preditiva</p>
          </div>
          
          <div
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            
            {file ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Arquivo selecionado
                </p>
                <p className="text-gray-700 font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Arraste seu arquivo aqui ou clique para selecionar
                </p>
                <p className="text-gray-400 text-sm">
                  Suporta apenas arquivos CSV
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={onProcess}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Iniciar Análise
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}