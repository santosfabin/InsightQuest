import React from "react"; // Import React for FC type
import { ResponsiveBar, type BarTooltipProps } from "@nivo/bar";
import { ResponsivePie, type PieTooltipProps } from "@nivo/pie";
// 👇 CORRIGIDO: Importar PointTooltipProps corretamente
import {
  ResponsiveLine,
  type PointTooltipProps as NivoPointTooltipProps,
} from "@nivo/line";
import {
  ResponsiveScatterPlot,
  type ScatterPlotTooltipProps,
  type ScatterPlotLayerProps,
} from "@nivo/scatterplot";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import type { TooltipProps } from "@nivo/heatmap";
import type {
  HeatmapDataRow,
  HeatmapDataItem,
  RoundResponseData,
  RoundTimeData,
} from "../services/api";

// ===== TIPOS DE DADOS =====
interface ColorFamilyDetails {
  color: string;
  rule: string;
  example: string;
}
interface PieSliceData {
  id: string | number;
  label: string | number;
  value: number;
  color?: string;
  details?: ColorFamilyDetails;
}
interface DistributionBin {
  range: string;
  count: number;
  [key: string]: string | number;
}
interface LikertData {
  metric: string;
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
  [key: string]: string | number;
}
interface ClusterComparisonData {
  cluster: string;
  avgTarget1: number;
  avgTarget2: number;
  avgTarget3: number;
  [key: string]: string | number;
}
interface ScatterPoint {
  x: number;
  y: number;
  player: string;
  target1?: number;
  cluster?: number;
}
interface ScatterData {
  id: string;
  data: ScatterPoint[];
}

// 🆕 NOVO: Tipos para Evolução de Performance
interface PerformanceEvolutionPoint {
  x: string; // Rodada (R1, R2, R3, Total)
  y: number; // Taxa de Acerto (%)
}
interface PerformanceEvolutionData {
  id: string; // Cluster ID (e.g., 'Cluster 0')
  data: PerformanceEvolutionPoint[];
}

// ===== TOOLTIP CUSTOMIZADO =====
const CustomPieTooltip = ({ datum }: PieTooltipProps<PieSliceData>) => {
  const { label, value, color, details } = datum.data;
  return (
    <div
      style={{
        padding: "8px 12px",
        background: "white",
        border: `1px solid ${color ?? "#ccc"}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        borderRadius: "4px",
        fontSize: "14px",
        whiteSpace: "nowrap",
      }}
    >
      <p style={{ fontWeight: "bold", margin: 0, color: color }}>
        {String(label)}: {value}
      </p>
      {details?.example && (
        <div style={{ color: "#333", marginTop: "4px" }}>
          <span style={{ fontWeight: 600 }}>Range:</span>
          <span style={{ marginLeft: "4px" }}>{details.example}</span>
        </div>
      )}
    </div>
  );
};

// ===== LEGENDA CUSTOMIZADA =====
const CustomScrollableLegend = ({ data }: { data: PieSliceData[] }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 16px",
        padding: "10px 0",
        borderTop: "1px solid #eee",
      }}
    >
      {data.map((item) => (
        <div
          key={String(item.id)}
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <span
            style={{
              display: "inline-block",
              width: "14px",
              height: "14px",
              backgroundColor: item.color,
              borderRadius: "50%",
              marginRight: "8px",
            }}
          />
          <span style={{ fontSize: "12px", color: "#666" }}>
            {String(item.label)}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomScatterTooltip = ({
  node,
}: ScatterPlotTooltipProps<ScatterPoint>) => {
  const { x, y, data } = node;
  return (
    <div
      style={{
        padding: "8px 12px",
        background: "white",
        border: `1px solid ${node.color ?? "#ccc"}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        borderRadius: "4px",
        fontSize: "14px",
      }}
    >
      <p style={{ fontWeight: "bold", margin: 0, color: node.color }}>
        {String((data as ScatterPoint).player) || `Ponto`}
      </p>
      <div style={{ color: "#333", marginTop: "4px" }}>
        <strong>Real:</strong> {x}
        <br />
        <strong>Predito:</strong> {y}
      </div>
    </div>
  );
};

const CustomTempoVsPerformanceTooltip = ({
  node,
}: ScatterPlotTooltipProps<ScatterPoint>) => {
  const { x, y, data } = node;
  const pointData = data as ScatterPoint;

  return (
    <div
      style={{
        padding: "10px 14px",
        background: "white",
        border: `2px solid ${node.color ?? "#ccc"}`,
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        borderRadius: "6px",
        fontSize: "13px",
        minWidth: "180px",
      }}
    >
      <p
        style={{
          fontWeight: "bold",
          margin: "0 0 8px 0",
          color: node.color,
          fontSize: "14px",
        }}
      >
        {String(pointData.player) || `Jogador`}
      </p>
      <div style={{ color: "#333", lineHeight: "1.6" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <strong>⏱️ Tempo Total:</strong>
          <span style={{ marginLeft: "8px" }}>{x.toFixed(1)}s</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <strong>✅ Acertos:</strong>
          <span style={{ marginLeft: "8px" }}>{y}</span>
        </div>
        {pointData.target1 !== undefined && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
              paddingTop: "6px",
              borderTop: "1px solid #eee",
            }}
          >
            <strong>🎯 Target 1:</strong>
            <span style={{ marginLeft: "8px", color: "#7c3aed" }}>
              {pointData.target1.toFixed(2)}
            </span>
          </div>
        )}
        {pointData.cluster !== undefined && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "4px",
            }}
          >
            <strong>📊 Cluster:</strong>
            <span style={{ marginLeft: "8px" }}>
              Cluster {pointData.cluster}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 👇 CORRIGIDO: Explicitamente tipar como React Function Component
const CustomPerformanceEvolutionTooltip: React.FC<
  NivoPointTooltipProps<PerformanceEvolutionData>
> = ({ point }) => {
  // O objeto 'point' contém as informações do ponto específico que foi interagido
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "white",
        border: `2px solid ${point.seriesColor}`, // Corrigido para seriesColor
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        borderRadius: "6px",
        fontSize: "13px",
        minWidth: "150px",
      }}
    >
      <p
        style={{
          fontWeight: "bold",
          margin: "0 0 8px 0",
          color: point.seriesColor,
          fontSize: "14px",
        }}
      >
        {point.seriesId} {/* Corrigido para seriesId */}
      </p>
      <div style={{ color: "#333", lineHeight: "1.6" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <strong>Rodada:</strong>
          {/* Acessar data.xFormatted para o valor formatado do eixo x */}
          <span style={{ marginLeft: "8px" }}>{point.data.xFormatted}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Taxa de Acerto:</strong>
          <span
            style={{
              marginLeft: "8px",
              color: point.seriesColor,
              fontWeight: "bold",
            }}
          >
            {/* Acessar data.yFormatted para o valor formatado do eixo y */}
            {Number(point.data.yFormatted).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const DiagonalLineLayer = ({
  xScale,
  yScale,
}: ScatterPlotLayerProps<ScatterPoint>) => {
  const xMin = xScale.domain()[0];
  const xMax = xScale.domain()[1];
  const yMin = yScale.domain()[0];
  const yMax = yScale.domain()[1];

  const min = Math.min(xMin, yMin);
  const max = Math.max(xMax, yMax);

  const p1 = { x: xScale(min), y: yScale(min) };
  const p2 = { x: xScale(max), y: yScale(max) };

  return (
    <line
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke="#ef4444"
      strokeWidth={2}
      strokeDasharray="6, 6"
    />
  );
};

const CustomHeatmapTooltip = ({ cell }: TooltipProps<HeatmapDataItem>) => {
  if (!cell || !cell.data) return null;
  return (
    <div className="bg-white p-3 shadow-xl rounded border border-gray-200 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold text-purple-700">{cell.serieId}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Correlação com</span>
        <span className="font-bold text-blue-600">{cell.data.x}:</span>
      </div>
      <div className="text-lg font-bold text-black text-center mt-1">
        {Number(cell.data.y).toFixed(3)}
      </div>
    </div>
  );
};

const CustomStackedResponsesTooltip = (
  props: BarTooltipProps<RoundResponseData>
) => {
  const { id, value, indexValue, data, color } = props;
  const total = data.total || 1;
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

  let formattedId = String(id);
  if (id === "hits") formattedId = "Acertos";
  if (id === "errors") formattedId = "Erros";
  if (id === "omissions") formattedId = "Omissões";

  return (
    <div
      style={{
        background: "white",
        padding: "9px 12px",
        border: `1px solid ${color}`,
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontSize: "14px",
      }}
    >
      <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
        {indexValue}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            background: color,
            marginRight: "7px",
          }}
        ></span>
        <span>{formattedId}: </span>
        <strong style={{ marginLeft: "5px" }}>{value}</strong>
        <span style={{ marginLeft: "5px", color: "#666" }}>
          ({percentage}%)
        </span>
      </div>
    </div>
  );
};

export function StackedResponsesChart({ data }: { data: RoundResponseData[] }) {
  const percentData = data.map((d) => {
    const total = d.total || 1;
    return {
      round: d.round,
      hits: total > 0 ? (d.hits / total) * 100 : 0,
      errors: total > 0 ? (d.errors / total) * 100 : 0,
      omissions: total > 0 ? (d.omissions / total) * 100 : 0,
      rawHits: d.hits,
      rawErrors: d.errors,
      rawOmissions: d.omissions,
      rawTotal: d.total,
    };
  });

  const tooltipDataMap = new Map(data.map((d) => [d.round, d]));

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 h-[500px] flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Composição das Respostas por Rodada (%)
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Percentual de acertos, erros e omissões em cada etapa.
        </p>
      </div>
      <div className="flex-grow">
        <ResponsiveBar
          data={percentData}
          keys={["hits", "errors", "omissions"]}
          indexBy="round"
          margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear", min: 0, max: 100 }}
          indexScale={{ type: "band", round: true }}
          colors={["#22c55e", "#ef4444", "#a3a3a3"]}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Rodada / Total",
            legendPosition: "middle",
            legendOffset: 45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "% do Total de Respostas",
            legendPosition: "middle",
            legendOffset: -45,
            format: (v) => `${v}%`,
          }}
          enableLabel={false}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 65,
              itemsSpacing: 20,
              itemWidth: 80,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 16,
              data: [
                { id: "hits", label: "Acertos", color: "#22c55e" },
                { id: "errors", label: "Erros", color: "#ef4444" },
                { id: "omissions", label: "Omissões", color: "#a3a3a3" },
              ],
            },
          ]}
          tooltip={(props) => {
            const rawData = tooltipDataMap.get(props.indexValue as string);
            if (!rawData) return null;
            const tooltipProps: BarTooltipProps<RoundResponseData> = {
              ...props,
              value:
                props.id === "hits"
                  ? rawData.hits
                  : props.id === "errors"
                  ? rawData.errors
                  : rawData.omissions,
              data: rawData,
            };
            return <CustomStackedResponsesTooltip {...tooltipProps} />;
          }}
        />
      </div>
    </div>
  );
}

export function AverageTimeChart({ data }: { data: RoundTimeData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 h-[500px] flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Tempo Médio Gasto por Rodada (Segundos)
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Média de tempo que todos os jogadores levaram em cada etapa.
        </p>
      </div>
      <div className="flex-grow">
        <ResponsiveBar
          data={data}
          keys={["avgTime"]}
          indexBy="round"
          margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
          padding={0.3}
          valueScale={{ type: "linear", min: 0 }}
          indexScale={{ type: "band", round: true }}
          colors={["#3b82f6"]}
          borderRadius={4}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Rodada",
            legendPosition: "middle",
            legendOffset: 45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Tempo Médio (s)",
            legendPosition: "middle",
            legendOffset: -60,
            format: ".2f",
          }}
          enableLabel={true}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="#ffffff"
          labelFormat=".1f"
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
              <strong>{indexValue}:</strong> {Number(value).toFixed(2)}s
            </div>
          )}
        />
      </div>
    </div>
  );
}

export function CorrelationHeatmapChart({ data }: { data: HeatmapDataRow[] }) {
  const chartHeight = Math.max(500, data.length * 28 + 100);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div className="pt-2 pb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Heatmap de Correlação
        </h3>
        <p className="text-sm text-gray-500">
          Quais features mais influenciam as predições?
        </p>
        <p className="text-xs text-gray-400 mt-1">
          (Azul = Positivo, Vermelho = Negativo, Branco = Perto de 0)
        </p>
      </div>

      <div className="h-[600px] overflow-y-auto">
        <div style={{ height: `${chartHeight}px` }}>
          <ResponsiveHeatMap
            data={data}
            margin={{ top: 0, right: 90, bottom: 80, left: 220 }}
            valueFormat=">.2f"
            colors={{
              type: "diverging",
              scheme: "red_blue",
              minValue: -1,
              maxValue: 1,
              divergeAt: 0.5,
            }}
            axisTop={null}
            axisRight={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Predição",
              legendPosition: "middle",
              legendOffset: 45,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 10,
              tickRotation: 0,
            }}
            enableLabels={true}
            labelTextColor="#333333"
            legends={[
              {
                anchor: "bottom",
                translateX: 0,
                translateY: 70,
                length: 400,
                thickness: 10,
                direction: "row",
                tickPosition: "after",
                tickSize: 3,
                tickSpacing: 4,
                tickOverlap: false,
                tickFormat: ">.1f",
                title: "Correlação (-1 a +1)",
                titleAlign: "start",
                titleOffset: 4,
              },
            ]}
            tooltip={CustomHeatmapTooltip}
          />
        </div>
      </div>
    </div>
  );
}

export function PredictionsVsRealChart({
  data,
  targetName,
}: {
  data: ScatterData[];
  targetName: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col h-[500px]">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Predição vs. Real: {targetName}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Comparação direta entre valores reais (Eixo X) e preditos (Eixo Y).
        </p>
      </div>
      <div className="flex-grow">
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 30, bottom: 70, left: 80 }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          colors="#3b82f6"
          nodeSize={12}
          layers={[
            "grid",
            "axes",
            DiagonalLineLayer,
            "nodes",
            "mesh",
            "legends",
          ]}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Valor Real",
            legendPosition: "middle",
            legendOffset: 46,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Valor Predito",
            legendPosition: "middle",
            legendOffset: -60,
          }}
          tooltip={CustomScatterTooltip}
        />
      </div>
    </div>
  );
}

export function TempoVsPerformanceChart({ data }: { data: ScatterData[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col h-[550px]">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          ⏱️ Tempo Total vs Performance (Acertos)
        </h3>
        <p className="text-sm text-gray-500 mb-1">
          Relação entre tempo gasto e quantidade de acertos
        </p>
        <p className="text-xs text-gray-400 mb-4">
          📊 Dados: <strong>T0498</strong> (eixo X) vs <strong>Q0413</strong>{" "}
          (Total de Acertos - eixo Y), colorido por Cluster
        </p>
      </div>
      <div className="flex-grow">
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 30, bottom: 90, left: 80 }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          colors={{ scheme: "category10" }}
          nodeSize={11}
          blendMode="normal"
          layers={["grid", "axes", "nodes", "mesh", "legends"]}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "⏱️ Tempo Total (T0498 - segundos)",
            legendPosition: "middle",
            legendOffset: 46,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "✅ Total de Acertos (Q0413)",
            legendPosition: "middle",
            legendOffset: -60,
          }}
          tooltip={CustomTempoVsPerformanceTooltip}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 70,
              itemsSpacing: 10,
              itemWidth: 100,
              itemHeight: 18,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 18,
              symbolShape: "circle",
            },
          ]}
        />
      </div>
    </div>
  );
}

// 🆕 NOVO COMPONENTE: Evolução de Performance por Rodada
export function PerformanceEvolutionChart({
  data,
}: {
  data: PerformanceEvolutionData[];
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col h-[500px]">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          📈 Evolução de Performance por Rodada
        </h3>
        <p className="text-sm text-gray-500 mb-1">
          Como a taxa de acerto (%) evolui ao longo das rodadas
        </p>
        <p className="text-xs text-gray-400 mb-4">
          📊 Dados: Taxa de acerto nas rodadas 1, 2, 3 e total geral - separado por grupo
        </p>
      </div>
      <div className="flex-grow">
        <ResponsiveLine<PerformanceEvolutionData>
          data={data}
          margin={{ top: 20, right: 130, bottom: 70, left: 80 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: 100,
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.1f" // Formato para tooltip
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Rodada",
            legendOffset: 46,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Taxa de Acerto (%)",
            legendOffset: -60,
            legendPosition: "middle",
            format: (v) => `${v}%`, // Formato para o eixo Y
          }}
          enableGridX={false}
          colors={{ scheme: "category10" }}
          lineWidth={3}
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.1}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 110,
              itemHeight: 20,
              itemOpacity: 0.85,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          tooltip={CustomPerformanceEvolutionTooltip}
        />
      </div>
    </div>
  );
}

// ===== COMPONENTES DE GRÁFICO (MANTIDOS) =====
export function GenericPieChart({
  data,
  title,
  subtitle,
}: {
  data: PieSliceData[];
  title: string;
  subtitle: string;
}) {
  const usesManualColors = data.some((d) => d.color);
  const colorConfig = usesManualColors
    ? (datum: { data: PieSliceData }) => datum.data.color || "#ccc"
    : { scheme: "nivo" as const };
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col h-[500px]">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      </div>
      <div className="flex-grow">
        <ResponsivePie
          data={data}
          margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
          innerRadius={0.5}
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={colorConfig}
          borderWidth={1}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={15}
          arcLabelsTextColor="#ffffff"
          legends={[]}
          tooltip={CustomPieTooltip}
        />
      </div>
      <CustomScrollableLegend data={data} />
    </div>
  );
}

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
    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col min-h-[500px]">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">
          Distribuição de frequência dos valores
        </p>
      </div>
      <div className="flex-grow">
        <ResponsiveBar
          data={data}
          keys={["count"]}
          indexBy="range"
          margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
          padding={0.1}
          valueScale={{ type: "linear", min: 0 }}
          colors={["#60a5fa"]}
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
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.6]],
          }}
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
          labelTextColor="#333333"
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
        />
      </div>
    </div>
  );
}

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
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          borderRadius={6}
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
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
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
        />
      </div>
    </div>
  );
}
