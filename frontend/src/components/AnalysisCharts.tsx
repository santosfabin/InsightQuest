// frontend/src/components/AnalysisCharts.tsx

import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
// Mantemos imports de outros tipos Nivo caso sejam necessários futuramente ou no Preview

// ===== TIPOS ESPECÍFICOS PARA OS GRÁFICOS USADOS NO DASHBOARD =====

// Tipo para Histograma (Distribuição de Tempo)
interface DistributionBin {
  range: string; // Ex: "0-50s", "50-100s"
  count: number;
  [key: string]: string | number; // Para Nivo
}

// Tipo Genérico para Gráfico de Pizza/Donut (Clusters e Cores)
interface PieSliceData {
  id: string | number; // ID único da fatia
  label: string; // Texto exibido
  value: number; // Valor numérico da fatia
  color?: string; // Cor opcional (se definida manualmente)
}

// Tipo para Distribuição Likert (Barras Empilhadas/Agrupadas)
interface LikertData {
  metric: string; // Ex: F0705 (Nome da Coluna/Pergunta)
  "1": number; // Contagem da resposta 1
  "2": number;
  "3": number;
  "4": number;
  "5": number;
  // Adicionar outras chaves se a escala for diferente (ex: '0')
  [key: string]: string | number; // Para Nivo
}

// Tipo para performance por cluster (Bar)
interface ClusterComparisonData {
  cluster: string; // Ex: "Cluster 0"
  avgTarget1: number;
  avgTarget2: number;
  avgTarget3: number;
  [key: string]: string | number; // Necessário para Nivo Bar usar 'keys'
}

// (Outros tipos podem ser adicionados aqui quando implementarmos mais gráficos no Dashboard)

// ===== COMPONENTES DE GRÁFICO =====

// --- Seção 1: Análise Introdutória ---

// Gráfico de Distribuição (Histograma) - Usado para Tempo
export function DistributionChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
}: {
  data: DistributionBin[];
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">
        Distribuição de frequência dos valores
      </p>
      <div style={{ height: "400px" }}>
        <ResponsiveBar
          data={data}
          keys={["count"]}
          indexBy="range"
          margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
          padding={0.1} // Menos padding para histograma
          valueScale={{ type: "linear", min: 0 }}
          colors={["#60a5fa"]} // Azul claro
          borderRadius={4}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30,
            legend: xAxisLabel,
            legendPosition: "middle",
            legendOffset: 50,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yAxisLabel,
            legendPosition: "middle",
            legendOffset: -60,
          }}
          enableLabel={false}
          tooltip={({ indexValue, value, color }) => (
            <div
              style={{
                padding: "6px 9px",
                background: "white",
                color: color,
                border: `1px solid ${color}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              <strong>
                {xAxisLabel}: {indexValue}
              </strong>
              <br />
              {yAxisLabel}: {value}
            </div>
          )}
        />
      </div>
    </div>
  );
}

// Gráfico de Pizza/Donut Genérico - Usado para Clusters e Cores
export function GenericPieChart({
  data,
  title,
  subtitle,
}: {
  data: PieSliceData[];
  title: string;
  subtitle: string;
}) {
  // Define esquema de cores ou usa cores manuais se fornecidas
  const usesManualColors = data.some((d) => d.color);
  const colorConfig = usesManualColors
    ? { datum: "data.color" } // Pega a cor definida em cada fatia
    : { scheme: "nivo" as const }; // Usa um esquema padrão se não houver cores manuais

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      <div style={{ height: "400px" }}>
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={colorConfig} // Usa a configuração de cor definida acima
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={15}
          arcLabelsTextColor="#ffffff"
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [{ on: "hover", style: { itemTextColor: "#000" } }],
            },
          ]}
          tooltip={({ datum: { id, value, color, label } }) => (
            <div
              style={{
                padding: "6px 9px",
                background: "white",
                color: color,
                border: `1px solid ${color ?? "#ccc"}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              <strong>{label || id}</strong>: {value}
            </div>
          )}
        />
      </div>
    </div>
  );
}

// Gráfico para Distribuição Likert (Barras Empilhadas)
export function LikertDistributionChart({
  data,
  title,
  subtitle,
}: {
  data: LikertData[];
  title: string;
  subtitle: string;
}) {
  const keys =
    data.length > 0
      ? Object.keys(data[0]).filter(
          (k) => k !== "metric" && !isNaN(parseInt(k))
        )
      : [];
  // Esquema de cores divergente (Vermelho -> Amarelo -> Verde)
  const colorScheme = ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      <div style={{ height: "400px" }}>
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy="metric"
          margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
          padding={0.3}
          valueScale={{ type: "linear", min: 0 }}
          indexScale={{ type: "band", round: true }}
          colors={colorScheme} // Aplica esquema de cores
          borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -15,
            legend: "Métrica/Pergunta",
            legendPosition: "middle",
            legendOffset: 50,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Número de Respostas",
            legendPosition: "middle",
            legendOffset: -60,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="#333333" // Label escuro dentro das barras claras
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [{ on: "hover", style: { itemOpacity: 1 } }],
            },
          ]}
          tooltip={(
            { id, value, indexValue } 
          ) => (
            <div
              style={{
                padding: "6px 9px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              <strong>{indexValue}</strong>
              <br />
              Resposta {id}: {value}
            </div>
          )}
        />
      </div>
    </div>
  );
}

// --- Seção Clusters (Mantida como estava e funcional) ---

// Performance Média por Cluster (Bar Chart)
export function PerformanceByClusterChart({
  data,
}: {
  data: ClusterComparisonData[];
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Performance Média por Cluster
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Comparativo das predições médias para cada perfil
      </p>
      <div style={{ height: "400px" }}>
        <ResponsiveBar
          data={data}
          keys={["avgTarget1", "avgTarget2", "avgTarget3"]}
          indexBy="cluster"
          margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: "linear", min: 0 }}
          indexScale={{ type: "band", round: true }}
          colors={["#7c3aed", "#6b7c59", "#ec4899"]}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          borderRadius={6}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Cluster",
            legendPosition: "middle",
            legendOffset: 45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Performance Média",
            legendPosition: "middle",
            legendOffset: -60,
            format: ".2f",
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [{ on: "hover", style: { itemOpacity: 1 } }],
            },
          ]}
          tooltip={({ id, value, indexValue }) => (
            <div
              style={{
                padding: "6px 9px",
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              {" "}
              <strong>{indexValue}</strong>
              <br />{" "}
              {id === "avgTarget1"
                ? "Target 1"
                : id === "avgTarget2"
                ? "Target 2"
                : "Target 3"}
              : {Number(value).toFixed(3)}{" "}
            </div>
          )}
          role="application"
          ariaLabel="Gráfico de performance média por cluster"
        />
      </div>
    </div>
  );
}

// (Os componentes que estavam no Preview mas ainda não foram integrados no Dashboard,
// como Heatmap, Scatter, FeatureImportance, etc., foram omitidos aqui, mas podem
// ser adicionados de volta quando necessário)
