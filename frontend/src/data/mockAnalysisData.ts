// frontend/src/data/mockAnalysisData.ts

// Adicionar tipos e constantes no topo do arquivo
interface OriginalData {
  'Código de Acesso': string;
  Cluster_0: number;
  Cluster_1: number;
  taxa_acerto_total: number;
  tempo_medio_questao: number;
  media_emocional: number;
  qualidade_sono: number;
  satisfacao_jogo: number;
  taxa_acerto_total_vs_cluster_mean: number;
  dia_semana: number;
  Cor0202: string;
  Feature_A: number;
  Feature_B: number;
  Feature_C: number;
}

interface Prediction {
  PREDICAO_Target1: number;
  PREDICAO_Target2: number;
  PREDICAO_Target3: number;
  original_data: OriginalData;
}

// Constante tipada para keys de cluster (reutilizar)
const CLUSTER_KEYS = ['Cluster_0', 'Cluster_1'] as const;

// SIMULAÇÃO DA RESPOSTA COMPLETA DA API (ApiResponse) - Mais detalhada
const generateMockPredictions = (count: number): Prediction[] => {
  return Array.from({ length: count }, (_, i) => {
    const cluster = Math.random() > 0.6 ? 1 : 0; // Cluster 0 (60%), Cluster 1 (40%)
    const baseTarget1 = cluster === 0 ? Math.random() * 40 + 10 : Math.random() * 45 + 15; // 10-50 vs 15-60
    const baseTarget2 = cluster === 0 ? Math.random() * 45 + 5 : Math.random() * 50 + 10;  // 5-50 vs 10-60
    const baseTarget3 = cluster === 0 ? Math.random() * 50 + 20 : Math.random() * 55 + 25; // 20-70 vs 25-80
    const dia = Math.floor(Math.random() * 7); // 0-6 (Dom-Sab)
    const weekendMultiplier = (dia === 0 || dia === 6) ? 0.95 : 1.05; // Performance ligeiramente pior no fds
    const colorHex = Math.random() > 0.7 ? '#0000FF' : (Math.random() > 0.4 ? '#FF0000' : (Math.random() > 0.2 ? '#00FF00' : '#FFFF00')); // Azul(30%), Vermelho(30%), Verde(20%), Amarelo(20%)
    const deviation = (Math.random() - 0.5) * 15; // Desvio aleatório da média do cluster

    return {
      PREDICAO_Target1: Math.max(0, baseTarget1 * weekendMultiplier + Math.random() * 5 - 2.5), // Adiciona ruído e garante >= 0
      PREDICAO_Target2: Math.max(0, baseTarget2 * weekendMultiplier + Math.random() * 5 - 2.5),
      PREDICAO_Target3: Math.max(0, baseTarget3 * weekendMultiplier + Math.random() * 5 - 2.5),
      original_data: {
        'Código de Acesso': `PLAYER_${i + 1}`,
        'Cluster_0': cluster === 0 ? 1 : 0, // One-hot encoded cluster
        'Cluster_1': cluster === 1 ? 1 : 0,
        // Features chave para caracterizar clusters (simuladas)
        'taxa_acerto_total': cluster === 0 ? Math.random() * 0.3 + 0.5 : Math.random() * 0.2 + 0.7, // 0.5-0.8 vs 0.7-0.9
        'tempo_medio_questao': cluster === 0 ? Math.random() * 5 + 10 : Math.random() * 4 + 8, // 10-15s vs 8-12s
        'media_emocional': cluster === 0 ? Math.random() * 1 + 3 : Math.random() * 1 + 3.5, // 3-4 vs 3.5-4.5
        'qualidade_sono': Math.random() * 3 + 1, // 1-4
        'satisfacao_jogo': Math.random() * 4 + 1, // 1-5
        // Feature de desvio (simulada)
        'taxa_acerto_total_vs_cluster_mean': deviation,
        // Dia da semana (simulado)
        'dia_semana': dia, // Número 0-6
        // Cor (simulada)
        'Cor0202': colorHex, // Exemplo de coluna de cor original
        // Adicionando algumas features numéricas aleatórias para heatmap
        'Feature_A': Math.random() * 100,
        'Feature_B': Math.random() * 50,
        'Feature_C': Math.random() * 200,
        // ... outras colunas originais poderiam estar aqui
      }
    };
  });
};

const mockRawPredictions: Prediction[] = generateMockPredictions(150);

export const mockApiResponse = {
  total_rows: 150,
  processed_rows: 150,
  predictions: mockRawPredictions,
};

// ===============================================
// DADOS PRÉ-PROCESSADOS PARA O PREVIEW
// ===============================================

// --- Visão Geral (Cards) ---
export const mockSummaryData = {
    totalRows: mockApiResponse.total_rows,
    processedRows: mockApiResponse.processed_rows,
    accuracy: 0.88 // Placeholder, accuracy real viria do modelo ou cálculo
};

const calculateAverages = (predictions: typeof mockRawPredictions) => {
    const num = predictions.length;
    if (num === 0) return { avgT1: 0, avgT2: 0, avgT3: 0 };
    const sumT1 = predictions.reduce((sum, p) => sum + (p.PREDICAO_Target1 || 0), 0);
    const sumT2 = predictions.reduce((sum, p) => sum + (p.PREDICAO_Target2 || 0), 0);
    const sumT3 = predictions.reduce((sum, p) => sum + (p.PREDICAO_Target3 || 0), 0);
    return { avgT1: sumT1 / num, avgT2: sumT2 / num, avgT3: sumT3 / num };
};
const averages = calculateAverages(mockRawPredictions);
export const mockTargetAverages = {
    target1: { mean: averages.avgT1, std: 12, distribution: 'Normal' }, // Std/Dist são placeholders
    target2: { mean: averages.avgT2, std: 15, distribution: 'Positiva' },
    target3: { mean: averages.avgT3, std: 18, distribution: 'Bimodal' },
};

// --- Análise Inicial ---
export const mockMissingValues = [
    // Simula poucos valores faltantes pois a API já deve tratar
    { column: 'Feature_A', count: 2 },
    { column: 'Feature_C', count: 1 },
    { column: 'qualidade_sono', count: 3 } // Exemplo
];

// Gera dados para Histograma (Target 1)
export const mockDistribution = Array.from({ length: 10 }).map((_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`, // Faixas de 0-10, 10-20, etc.
    // Conta quantas predições de Target1 caem em cada faixa
    count: mockRawPredictions.filter(p => p.PREDICAO_Target1 >= i * 10 && p.PREDICAO_Target1 < (i + 1) * 10).length,
}));

// Dados para Heatmap de Correlação (Simulado)
const featuresForHeatmap = ['taxa_acerto_total', 'tempo_medio_questao', 'media_emocional', 'qualidade_sono', 'satisfacao_jogo', 'Feature_A', 'Feature_B', 'Feature_C'];
const targetsForHeatmap = ['Target1', 'Target2', 'Target3']; // Usando nomes curtos para o heatmap
export const mockCorrelationHeatmap = featuresForHeatmap.map(feature => {
    // Cria um objeto base para a linha do heatmap
    const heatmapRow = {
        id: feature.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase()), // Formata nome da feature
        data: [] as { x: string; y: number }[] // Inicializa array de dados da linha
    };
    // Preenche os dados de correlação simulada para cada target
    targetsForHeatmap.forEach(target => {
        heatmapRow.data.push({
            x: target, // Nome do target no eixo X
            y: parseFloat((Math.random() * 2 - 1).toFixed(2)) // Correlação simulada entre -1 e 1
        });
    });
    return heatmapRow;
});


// --- Clusters ---
// (Cálculo da distribuição e performance por cluster - igual ao Dashboard.tsx)
const clusterCounts = mockRawPredictions.reduce((acc, p) => {
    const clusterNum = CLUSTER_KEYS.findIndex(key => p.original_data[key] === 1);
    if (clusterNum !== -1) {
        acc[clusterNum] = (acc[clusterNum] || 0) + 1;
    }
    return acc;
}, {} as { [key: number]: number });

export const mockClusterDistribution = Object.entries(clusterCounts).map(([id, value]) => ({
    id: `Cluster ${id}`,
    label: `Cluster ${id}`,
    value,
})).sort((a, b) => parseInt(a.id.split(' ')[1]) - parseInt(b.id.split(' ')[1]));


const clusterAggregates = mockRawPredictions.reduce((acc, p) => {
    const clusterNum = CLUSTER_KEYS.findIndex(key => p.original_data[key] === 1);
    if (clusterNum !== -1) {
        if (!acc[clusterNum]) {
            acc[clusterNum] = { count: 0, sumTaxaAcerto: 0, sumTempoMedio: 0, sumMediaEmocional: 0 };
        }
        acc[clusterNum].count++;
        acc[clusterNum].sumTaxaAcerto += p.original_data['taxa_acerto_total'] || 0;
        acc[clusterNum].sumTempoMedio += p.original_data['tempo_medio_questao'] || 0;
        acc[clusterNum].sumMediaEmocional += p.original_data['media_emocional'] || 0;
    }
    return acc;
}, {} as { [key: number]: { count: number; sumTaxaAcerto: number; sumTempoMedio: number; sumMediaEmocional: number } });

export const mockClusterCharacteristics = Object.entries(clusterAggregates).map(([id, data]) => ({
    cluster: `Cluster ${id}`,
    'Taxa Acerto': data.count > 0 ? data.sumTaxaAcerto / data.count : 0,
    'Tempo Médio': data.count > 0 ? data.sumTempoMedio / data.count : 0,
    'Humor Médio': data.count > 0 ? data.sumMediaEmocional / data.count : 0,
})).sort((a, b) => parseInt(a.cluster.split(' ')[1]) - parseInt(b.cluster.split(' ')[1]));


export const mockPerformanceByCluster = Object.entries(clusterAggregates).map(([id]) => {
     const predictionsInCluster = mockRawPredictions.filter(p => {
         const clusterNum = CLUSTER_KEYS.findIndex(key => p.original_data[key] === 1);
         return clusterNum === parseInt(id);
     });
     const sumT1 = predictionsInCluster.reduce((sum, p) => sum + (p.PREDICAO_Target1 || 0), 0);
     const sumT2 = predictionsInCluster.reduce((sum, p) => sum + (p.PREDICAO_Target2 || 0), 0);
     const sumT3 = predictionsInCluster.reduce((sum, p) => sum + (p.PREDICAO_Target3 || 0), 0);
     const count = predictionsInCluster.length; // Usa a contagem real filtrada

    return {
        cluster: `Cluster ${id}`,
        avgTarget1: count > 0 ? sumT1 / count : 0,
        avgTarget2: count > 0 ? sumT2 / count : 0,
        avgTarget3: count > 0 ? sumT3 / count : 0,
    };
}).sort((a, b) => parseInt(a.cluster.split(' ')[1]) - parseInt(b.cluster.split(' ')[1]));


// --- Análise Preditiva ---
const performanceByDay = mockRawPredictions.reduce((acc, p) => {
    const day = p.original_data['dia_semana'];
    if (day !== undefined && day >= 0 && day <= 6) {
        if (!acc[day]) {
            acc[day] = { count: 0, sumT1: 0, sumT2: 0, sumT3: 0 };
        }
        acc[day].count++;
        acc[day].sumT1 += p.PREDICAO_Target1 || 0;
        acc[day].sumT2 += p.PREDICAO_Target2 || 0;
        acc[day].sumT3 += p.PREDICAO_Target3 || 0;
    }
    return acc;
}, {} as { [key: number]: { count: number; sumT1: number; sumT2: number; sumT3: number } });

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const mockPerformanceByDay = dayNames.map((name, index) => ({
    day: name,
    'Target 1': performanceByDay[index] ? performanceByDay[index].sumT1 / performanceByDay[index].count : 0,
    'Target 2': performanceByDay[index] ? performanceByDay[index].sumT2 / performanceByDay[index].count : 0,
    'Target 3': performanceByDay[index] ? performanceByDay[index].sumT3 / performanceByDay[index].count : 0,
}));


const performanceByColor = mockRawPredictions.reduce((acc, p) => {
    const color = p.original_data['Cor0202'] === '#0000FF' ? 'Azul' : 'Outros'; // Simplificado: Azul vs Outros
    if (!acc[color]) {
        acc[color] = { count: 0, sumT1: 0, sumT2: 0, sumT3: 0 };
    }
    acc[color].count++;
    acc[color].sumT1 += p.PREDICAO_Target1 || 0;
    acc[color].sumT2 += p.PREDICAO_Target2 || 0;
    acc[color].sumT3 += p.PREDICAO_Target3 || 0;
    return acc;
}, {} as { [key: string]: { count: number; sumT1: number; sumT2: number; sumT3: number } });

export const mockPerformanceByColor = Object.entries(performanceByColor).map(([color, data]) => ({
    colorGroup: color,
    'Target 1': data.count > 0 ? data.sumT1 / data.count : 0,
    'Target 2': data.count > 0 ? data.sumT2 / data.count : 0,
    'Target 3': data.count > 0 ? data.sumT3 / data.count : 0,
}));


export const mockDeviationScatter = [{
    id: 'Desvio da Média do Cluster vs Target 1',
    data: mockRawPredictions.map(p => ({
        x: p.original_data['taxa_acerto_total_vs_cluster_mean'] || 0, // Eixo X: Desvio
        y: p.PREDICAO_Target1 || 0,                                  // Eixo Y: Target 1
        player: p.original_data['Código de Acesso']                  // Info extra para tooltip
    }))
}];


export const mockFeatureImportance = [
    { feature: 'tempo_medio_questao', importance: 0.28 },
    { feature: 'media_emocional', importance: 0.22 },
    { feature: 'Cluster_1', importance: 0.18 },
    { feature: 'taxa_acerto_total', importance: 0.15 },
    { feature: 'qualidade_sono', importance: 0.10 },
    { feature: 'dia_semana', importance: 0.07 },
    { feature: 'Feature_A', importance: 0.05 },
    { feature: 'satisfacao_jogo', importance: 0.03 },
].sort((a, b) => b.importance - a.importance); // Ordena por importância


export const mockPredictionsVsReal = [{
    id: 'Target 1',
    data: mockRawPredictions.map(p => {
        // Simula valor real próximo da predição com algum ruído
        const noise = (Math.random() - 0.5) * (averages.avgT1 * 0.2); // Ruído de até +/- 10% da média
        const realValue = p.PREDICAO_Target1 + noise;
        return {
            x: Math.max(0, realValue), // Valor "Real" no eixo X (garante >= 0)
            y: p.PREDICAO_Target1       // Predição no eixo Y
        };
    })
}];