// Simulação de dados que viriam do backend Python após análise

export const mockAnalysisData = {
  // ============= ANTES DO TREINAMENTO =============
  beforeTraining: {
    // Gráfico de Valores Faltantes por Coluna
    missingValues: [
      { column: 'player_kills', count: 12 },
      { column: 'player_deaths', count: 8 },
      { column: 'game_duration', count: 5 },
      { column: 'team_gold', count: 15 },
      { column: 'player_damage', count: 3 }
    ],

    // Distribuição de uma feature (Histogram)
    distribution: [
      { range: '0-10', count: 15 },
      { range: '10-20', count: 28 },
      { range: '20-30', count: 45 },
      { range: '30-40', count: 38 },
      { range: '40-50', count: 20 },
      { range: '50-60', count: 10 }
    ],

    // Correlação entre Features (simplificado)
    correlation: [
      { feature: 'Kills', target1: 0.85, target2: 0.62, target3: 0.73 },
      { feature: 'Deaths', target1: -0.45, target2: 0.38, target3: 0.21 },
      { feature: 'Assists', target1: 0.72, target2: 0.81, target3: 0.68 },
      { feature: 'Gold', target1: 0.68, target2: 0.55, target3: 0.88 },
      { feature: 'Damage', target1: 0.79, target2: 0.73, target3: 0.71 }
    ]
  },

  // ============= DEPOIS DO TREINAMENTO =============
  afterTraining: {
    // Predições vs Real (Scatter Plot)
    predictionsVsReal: [
      {
        id: 'Target 1',
        data: Array.from({ length: 50 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 100 + (Math.random() - 0.5) * 10
        }))
      }
    ],

    // Feature Importance
    featureImportance: [
      { feature: 'player_kills', importance: 0.28 },
      { feature: 'game_duration', importance: 0.22 },
      { feature: 'team_gold', importance: 0.18 },
      { feature: 'player_damage', importance: 0.15 },
      { feature: 'assists', importance: 0.10 },
      { feature: 'deaths', importance: 0.07 }
    ],

    // Matriz de Confusão (para classificação)
    confusionMatrix: [
      { predicted: 'Vitória', actualVictory: 85, actualDefeated: 12 },
      { predicted: 'Derrota', actualVictory: 8, actualDefeated: 78 }
    ],

    // Métricas gerais
    metrics: {
      accuracy: 0.94,
      precision: 0.92,
      recall: 0.91,
      f1Score: 0.915
    }
  },

  // ============= OUTLIERS (Jogadores Fora do Padrão) =============
  outliers: {
    // Scatter Plot com destaque
    scatterData: [
      {
        id: 'Jogadores Normais',
        data: Array.from({ length: 140 }, () => ({
          x: Math.random() * 50 + 25,
          y: Math.random() * 50 + 25
        }))
      },
      {
        id: 'Outliers (Fora do Padrão)',
        data: [
          { x: 10, y: 85 },
          { x: 90, y: 15 },
          { x: 5, y: 10 },
          { x: 92, y: 88 },
          { x: 15, y: 90 },
          { x: 85, y: 12 }
        ]
      }
    ],

    // Radar Chart comparando outlier com média
    radarComparison: [
      {
        metric: 'Kills',
        outlier: 35,
        média: 12,
        fullMark: 40
      },
      {
        metric: 'Deaths',
        outlier: 2,
        média: 8,
        fullMark: 15
      },
      {
        metric: 'Assists',
        outlier: 28,
        média: 10,
        fullMark: 30
      },
      {
        metric: 'Damage',
        outlier: 45000,
        média: 18000,
        fullMark: 50000
      },
      {
        metric: 'Gold',
        outlier: 18000,
        média: 12000,
        fullMark: 20000
      }
    ],

    // Lista de jogadores outliers
    playersList: [
      { id: 1, name: 'Player_Alpha', reason: 'Kills muito acima da média', deviation: 2.8 },
      { id: 2, name: 'Player_Beta', reason: 'Deaths muito abaixo da média', deviation: -2.5 },
      { id: 3, name: 'Player_Gamma', reason: 'Damage extremamente alto', deviation: 3.2 }
    ]
  },

  // ============= CLUSTERS =============
  clusters: {
    // Scatter Plot colorido por cluster
    scatterData: [
      {
        id: 'Cluster 1: Agressivos',
        data: Array.from({ length: 45 }, () => ({
          x: Math.random() * 30 + 50,
          y: Math.random() * 30 + 50
        }))
      },
      {
        id: 'Cluster 2: Defensivos',
        data: Array.from({ length: 62 }, () => ({
          x: Math.random() * 30 + 10,
          y: Math.random() * 30 + 10
        }))
      },
      {
        id: 'Cluster 3: Balanceados',
        data: Array.from({ length: 47 }, () => ({
          x: Math.random() * 30 + 30,
          y: Math.random() * 30 + 30
        }))
      }
    ],

    // Distribuição (Pie Chart)
    distribution: [
      { id: 'Agressivos', label: 'Cluster 1', value: 45, color: '#7c3aed' },
      { id: 'Defensivos', label: 'Cluster 2', value: 62, color: '#6b7c59' },
      { id: 'Balanceados', label: 'Cluster 3', value: 47, color: '#ec4899' }
    ],

    // Características de cada cluster
    characteristics: [
      { cluster: 'Agressivos', avgKills: 18.5, avgDeaths: 12.3, avgAssists: 8.2, avgWinRate: 0.58 },
      { cluster: 'Defensivos', avgKills: 8.2, avgDeaths: 5.1, avgAssists: 15.8, avgWinRate: 0.52 },
      { cluster: 'Balanceados', avgKills: 12.8, avgDeaths: 8.5, avgAssists: 11.3, avgWinRate: 0.62 }
    ]
  },

  // ============= EVOLUÇÃO TEMPORAL (se houver datas) =============
  timeSeries: {
    // Performance ao longo do tempo
    performance: [
      {
        id: 'Win Rate',
        data: [
          { x: 'Semana 1', y: 0.45 },
          { x: 'Semana 2', y: 0.52 },
          { x: 'Semana 3', y: 0.58 },
          { x: 'Semana 4', y: 0.55 },
          { x: 'Semana 5', y: 0.62 },
          { x: 'Semana 6', y: 0.68 }
        ]
      },
      {
        id: 'Avg Kills',
        data: [
          { x: 'Semana 1', y: 8.2 },
          { x: 'Semana 2', y: 9.5 },
          { x: 'Semana 3', y: 11.2 },
          { x: 'Semana 4', y: 10.8 },
          { x: 'Semana 5', y: 12.5 },
          { x: 'Semana 6', y: 13.8 }
        ]
      }
    ]
  }
};