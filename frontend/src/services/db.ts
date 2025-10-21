// frontend/src/services/db.ts

import Dexie, { type Table } from 'dexie';
import type { ApiResponse } from './api'; // Importa a interface que você já tem

// 1. Define a estrutura da nossa entrada de histórico
export interface HistoryEntry {
  id?: number; // Chave primária, opcional porque é autoincrementada
  timestamp: Date;
  fileName: string;
  totalRows: number;
  processedRows: number;
  results: ApiResponse; // O payload completo da API
}

// 2. Cria uma classe que gerencia o banco de dados
class InsightQuestDB extends Dexie {
  // A propriedade 'history' representa a nossa "tabela" (Object Store)
  history!: Table<HistoryEntry>;

  constructor() {
    super('InsightQuestDB'); // Nome do banco de dados
    this.version(1).stores({
      // Define o schema da tabela 'history'
      // '++id' = chave primária autoincrementável
      // 'timestamp' = campo indexado para podermos ordenar por ele
      history: '++id, timestamp',
    });
  }
}

// 3. Instancia o banco de dados
const db = new InsightQuestDB();

// --- FUNÇÕES EXPORTADAS PARA USO NA APLICAÇÃO ---

/**
 * Adiciona uma nova entrada de análise ao histórico.
 * @param fileName O nome do arquivo analisado.
 * @param apiResponse O objeto de resposta completo da API.
 */
export const addHistoryEntry = async (fileName: string, apiResponse: ApiResponse): Promise<void> => {
  try {
    const entry: HistoryEntry = {
      fileName,
      results: apiResponse,
      timestamp: new Date(),
      totalRows: apiResponse.total_rows,
      processedRows: apiResponse.processed_rows,
    };
    await db.history.add(entry);
    console.log('Análise salva no histórico com sucesso.');
  } catch (error) {
    console.error('Falha ao salvar a análise no histórico:', error);
  }
};

/**
 * Retorna todas as entradas do histórico, ordenadas da mais recente para a mais antiga.
 * @returns Uma promessa que resolve para um array de HistoryEntry.
 */
export const getHistoryEntries = async (): Promise<HistoryEntry[]> => {
  try {
    // .reverse() ordena de forma decrescente. .toArray() executa a query.
    return await db.history.orderBy('timestamp').reverse().toArray();
  } catch (error) {
    console.error('Falha ao buscar o histórico:', error);
    return []; // Retorna um array vazio em caso de erro
  }
};