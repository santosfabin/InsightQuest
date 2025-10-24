// frontend/src/components/TopBottomPerformersChart.tsx

import { ResponsiveBar } from "@nivo/bar";

interface TopBottomPerformersChartProps {
  predictions: Array<{
    PREDICAO_Target1: number | null;
    PREDICAO_Target2: number | null;
    PREDICAO_Target3: number | null;
  }>;
}

export default function TopBottomPerformersChart({
  predictions,
}: TopBottomPerformersChartProps) {
  // Função para obter top 3 e bottom 3 de um target específico
  const getTopBottom = (
    targetKey: "PREDICAO_Target1" | "PREDICAO_Target2" | "PREDICAO_Target3"
  ) => {
    const validPredictions = predictions
      .map((p, idx) => ({ value: p[targetKey], index: idx + 1 }))
      .filter((p) => p.value !== null && !isNaN(p.value as number))
      .sort((a, b) => (b.value as number) - (a.value as number));

    const top3 = validPredictions.slice(0, 3);
    const bottom3 = validPredictions.slice(-3).reverse();

    return { top3, bottom3 };
  };

  const target1Data = getTopBottom("PREDICAO_Target1");
  const target2Data = getTopBottom("PREDICAO_Target2");
  const target3Data = getTopBottom("PREDICAO_Target3");

  // Preparar dados para o gráfico - Top Performers
  const topData = [
    {
      target: "Target 1",
      "1º Lugar": target1Data.top3[0]?.value || 0,
      "2º Lugar": target1Data.top3[1]?.value || 0,
      "3º Lugar": target1Data.top3[2]?.value || 0,
    },
    {
      target: "Target 2",
      "1º Lugar": target2Data.top3[0]?.value || 0,
      "2º Lugar": target2Data.top3[1]?.value || 0,
      "3º Lugar": target2Data.top3[2]?.value || 0,
    },
    {
      target: "Target 3",
      "1º Lugar": target3Data.top3[0]?.value || 0,
      "2º Lugar": target3Data.top3[1]?.value || 0,
      "3º Lugar": target3Data.top3[2]?.value || 0,
    },
  ];

  // Preparar dados para o gráfico - Bottom Performers
  const bottomData = [
    {
      target: "Target 1",
      Menor: target1Data.bottom3[0]?.value || 0,
      "2º Menor": target1Data.bottom3[1]?.value || 0,
      "3º Menor": target1Data.bottom3[2]?.value || 0,
    },
    {
      target: "Target 2",
      Menor: target2Data.bottom3[0]?.value || 0,
      "2º Menor": target2Data.bottom3[1]?.value || 0,
      "3º Menor": target2Data.bottom3[2]?.value || 0,
    },
    {
      target: "Target 3",
      Menor: target3Data.bottom3[0]?.value || 0,
      "2º Menor": target3Data.bottom3[1]?.value || 0,
      "3º Menor": target3Data.bottom3[2]?.value || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🏆 Maiores Valores por Target
          </h3>
          <p className="text-sm text-gray-600">
            Top 3 predições mais altas em cada target
          </p>
        </div>

        <div style={{ height: "350px" }}>
          <ResponsiveBar
            data={topData}
            keys={["1º Lugar", "2º Lugar", "3º Lugar"]}
            indexBy="target"
            layout="horizontal"
            margin={{ top: 20, right: 130, bottom: 50, left: 80 }}
            padding={0.4}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#8b5cf6", "#a78bfa", "#c4b5fd"]}
            borderRadius={8}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Valor",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendPosition: "middle",
              legendOffset: -70,
            }}
            enableLabel={false}
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
                symbolSize: 12,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            tooltip={({ id, value, indexValue }) => (
              <div
                style={{
                  background: "white",
                  padding: "9px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                <strong>{indexValue}</strong>
                <br />
                {id}: <strong>{value.toFixed(2)}</strong>
              </div>
            )}
            role="application"
            ariaLabel="Top performers bar chart"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {["Target 1", "Target 2", "Target 3"].map((target, idx) => {
            const data =
              idx === 0 ? target1Data : idx === 1 ? target2Data : target3Data;
            return (
              <div key={target} className="bg-purple-50 rounded-lg p-3">
                <div className="font-semibold text-purple-900 mb-2">
                  {target}
                </div>
                <div className="space-y-1">
                  <div className="text-purple-700">
                    1º: {data.top3[0]?.value?.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-purple-600">
                    2º: {data.top3[1]?.value?.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-purple-500">
                    3º: {data.top3[2]?.value?.toFixed(2) || "N/A"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Performers */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            📉 Menores Valores por Target
          </h3>
          <p className="text-sm text-gray-600">
            Top 3 predições mais baixas em cada target
          </p>
        </div>

        <div style={{ height: "350px" }}>
          <ResponsiveBar
            data={bottomData}
            keys={["Menor", "2º Menor", "3º Menor"]}
            indexBy="target"
            layout="horizontal"
            margin={{ top: 20, right: 130, bottom: 50, left: 80 }}
            padding={0.4}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#ef4444", "#f87171", "#fca5a5"]}
            borderRadius={8}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Valor",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendPosition: "middle",
              legendOffset: -70,
            }}
            enableLabel={false}
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
                symbolSize: 12,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            tooltip={({ id, value, indexValue }) => (
              <div
                style={{
                  background: "white",
                  padding: "9px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                <strong>{indexValue}</strong>
                <br />
                {id}: <strong>{value.toFixed(2)}</strong>
              </div>
            )}
            role="application"
            ariaLabel="Bottom performers bar chart"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {["Target 1", "Target 2", "Target 3"].map((target, idx) => {
            const data =
              idx === 0 ? target1Data : idx === 1 ? target2Data : target3Data;
            return (
              <div key={target} className="bg-red-50 rounded-lg p-3">
                <div className="font-semibold text-red-900 mb-2">{target}</div>
                <div className="space-y-1">
                  <div className="text-red-700">
                    1º: {data.bottom3[0]?.value?.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-red-600">
                    2º: {data.bottom3[1]?.value?.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-red-500">
                    3º: {data.bottom3[2]?.value?.toFixed(2) || "N/A"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
