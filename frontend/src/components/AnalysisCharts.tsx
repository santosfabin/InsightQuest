import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsivePie } from '@nivo/pie';

// ===== TIPOS =====

interface MissingValue {
  column: string;
  count: number;
  [key: string]: string | number;
}

interface Distribution {
  range: string;
  count: number;
  [key: string]: string | number;
}

interface Correlation {
  feature: string;
  target1: number;
  target2: number;
  target3: number;
  [key: string]: string | number;
}

interface ScatterPoint {
  x: number;
  y: number;
  [key: string]: string | number;
}

interface ScatterData {
  id: string;
  data: ScatterPoint[];
  [key: string]: unknown;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  [key: string]: string | number;
}

interface PieData {
  id: string;
  label: string;
  value: number;
  color?: string;
  [key: string]: unknown;
}

interface LinePoint {
  x: string | number;
  y: number;
  [key: string]: unknown;
}

interface LineData {
  id: string;
  data: LinePoint[];
  [key: string]: unknown;
}

// ===== ANTES DO TREINAMENTO =====

// Gráfico de Valores Faltantes
export function MissingValuesChart({ data }: { data: MissingValue[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Valores Faltantes por Coluna</h3>
      <p className="text-sm text-gray-500 mb-6">Análise da qualidade dos dados antes do processamento</p>
      <div style={{ height: '400px' }}>
        <ResponsiveBar
          data={data}
          keys={['count']}
          indexBy="column"
          margin={{ top: 20, right: 30, bottom: 80, left: 80 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          colors={['#ef4444']}
          borderRadius={8}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Colunas',
            legendPosition: 'middle',
            legendOffset: 60
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Quantidade',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          labelTextColor="#ffffff"
          animate={true}
        />
      </div>
    </div>
  );
}

// Gráfico de Distribuição (Histogram)
export function DistributionChart({ data }: { data: Distribution[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Distribuição dos Dados</h3>
      <p className="text-sm text-gray-500 mb-6">Histograma mostrando a frequência dos valores</p>
      <div style={{ height: '400px' }}>
        <ResponsiveBar
          data={data}
          keys={['count']}
          indexBy="range"
          margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
          padding={0.2}
          colors={['#3b82f6']}
          borderRadius={8}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Faixa de Valores',
            legendPosition: 'middle',
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Frequência',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          labelTextColor="#ffffff"
        />
      </div>
    </div>
  );
}

// Correlação com Targets
export function CorrelationChart({ data }: { data: Correlation[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Correlação com Targets</h3>
      <p className="text-sm text-gray-500 mb-6">Relação entre features e os targets a serem previstos</p>
      <div style={{ height: '400px' }}>
        <ResponsiveBar
          data={data}
          keys={['target1', 'target2', 'target3']}
          indexBy="feature"
          margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
          padding={0.3}
          layout="horizontal"
          colors={['#7c3aed', '#6b7c59', '#ec4899']}
          borderRadius={6}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Correlação',
            legendPosition: 'middle',
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0
          }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 120,
              itemWidth: 100,
              itemHeight: 20,
              symbolSize: 20
            }
          ]}
        />
      </div>
    </div>
  );
}

// ===== DEPOIS DO TREINAMENTO =====

// Predições vs Real
export function PredictionsVsRealChart({ data }: { data: ScatterData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Predições vs Valores Reais</h3>
      <p className="text-sm text-gray-500 mb-6">Quanto mais próximo da linha diagonal, melhor a predição</p>
      <div style={{ height: '400px' }}>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
          xScale={{ type: 'linear', min: 0, max: 100 }}
          yScale={{ type: 'linear', min: 0, max: 100 }}
          colors={['#7c3aed']}
          nodeSize={6}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Valores Reais',
            legendPosition: 'middle',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Predições',
            legendPosition: 'middle',
            legendOffset: -60
          }}
        />
      </div>
    </div>
  );
}

// Feature Importance
export function FeatureImportanceChart({ data }: { data: FeatureImportance[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Importância das Features</h3>
      <p className="text-sm text-gray-500 mb-6">Features que mais influenciam nas predições do modelo</p>
      <div style={{ height: '400px' }}>
        <ResponsiveBar
          data={data}
          keys={['importance']}
          indexBy="feature"
          margin={{ top: 20, right: 30, bottom: 60, left: 150 }}
          padding={0.3}
          layout="horizontal"
          colors={['#10b981']}
          borderRadius={8}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Importância',
            legendPosition: 'middle',
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0
          }}
          labelTextColor="#ffffff"
        />
      </div>
    </div>
  );
}

// ===== OUTLIERS =====

// Scatter Plot com Outliers destacados
export function OutliersScatterChart({ data }: { data: ScatterData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Identificação de Outliers</h3>
      <p className="text-sm text-gray-500 mb-6">Jogadores com comportamento significativamente diferente do padrão</p>
      <div style={{ height: '400px' }}>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 140, bottom: 60, left: 80 }}
          xScale={{ type: 'linear', min: 0, max: 100 }}
          yScale={{ type: 'linear', min: 0, max: 100 }}
          colors={['#3b82f6', '#ef4444']}
          nodeSize={8}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Componente 1',
            legendPosition: 'middle',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Componente 2',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 130,
              itemWidth: 120,
              itemHeight: 20,
              symbolSize: 12
            }
          ]}
        />
      </div>
    </div>
  );
}

// ===== CLUSTERS =====

// Scatter Plot com Clusters
export function ClustersScatterChart({ data }: { data: ScatterData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Visualização de Clusters</h3>
      <p className="text-sm text-gray-500 mb-6">Agrupamento de jogadores com perfis semelhantes</p>
      <div style={{ height: '400px' }}>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 180, bottom: 60, left: 80 }}
          xScale={{ type: 'linear', min: 0, max: 100 }}
          yScale={{ type: 'linear', min: 0, max: 100 }}
          colors={['#7c3aed', '#6b7c59', '#ec4899']}
          nodeSize={8}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Componente Principal 1',
            legendPosition: 'middle',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Componente Principal 2',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 170,
              itemWidth: 160,
              itemHeight: 20,
              symbolSize: 12
            }
          ]}
        />
      </div>
    </div>
  );
}

// Distribuição de Clusters (Pie Chart)
export function ClustersDistributionChart({ data }: { data: PieData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Distribuição de Clusters</h3>
      <p className="text-sm text-gray-500 mb-6">Quantidade de jogadores em cada perfil identificado</p>
      <div style={{ height: '400px' }}>
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={2}
          cornerRadius={8}
          colors={['#7c3aed', '#6b7c59', '#ec4899']}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsTextColor="#ffffff"
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              translateY: 56,
              itemWidth: 120,
              itemHeight: 18,
              symbolSize: 18,
              symbolShape: 'circle'
            }
          ]}
        />
      </div>
    </div>
  );
}

// ===== SÉRIES TEMPORAIS =====

// Performance ao longo do tempo
export function TimeSeriesChart({ data }: { data: LineData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Evolução da Performance</h3>
      <p className="text-sm text-gray-500 mb-6">Acompanhamento de métricas ao longo do tempo</p>
      <div style={{ height: '400px' }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          curve="monotoneX"
          colors={['#7c3aed', '#ec4899']}
          lineWidth={3}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          enableArea={true}
          areaOpacity={0.15}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Período',
            legendPosition: 'middle',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Valor',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 120,
              itemWidth: 100,
              itemHeight: 20,
              symbolSize: 12
            }
          ]}
          useMesh={true}
        />
      </div>
    </div>
  );
}