// frontend/src/components/AnalysisCharts.tsx

import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie, type PieTooltipProps } from "@nivo/pie";

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
				whiteSpace: "nowrap"
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
				borderTop: "1px solid #eee"
			}}
		>
			{data.map(item => (
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
							marginRight: "8px"
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

// ===== COMPONENTES DE GRÁFICO =====
export function GenericPieChart({
	data,
	title,
	subtitle
}: {
	data: PieSliceData[];
	title: string;
	subtitle: string;
}) {
	const usesManualColors = data.some(d => d.color);
	const colorConfig = usesManualColors
		? (datum: { data: PieSliceData }) => datum.data.color || "#ccc"
		: { scheme: "nivo" as const };
	return (
		<div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col h-[500px]">
			<div>
				<h3 className="text-xl font-bold text-gray-800 mb-2">
					{title}
				</h3>
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
						modifiers: [["darker", 0.2]]
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
	yAxisLabel
}: {
	data: DistributionBin[];
	title: string;
	xAxisLabel: string;
	yAxisLabel: string;
}) {
	return (
		<div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col min-h-[500px]">
			<div>
				<h3 className="text-xl font-bold text-gray-800 mb-2">
					{title}
				</h3>
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
						legendOffset: 50
					}}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: yAxisLabel,
						legendPosition: "middle",
						legendOffset: -60
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
								fontSize: "12px"
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
	subtitle
}: {
	data: LikertData[];
	title: string;
	subtitle: string;
}) {
	const keys =
		data.length > 0
			? Object.keys(data[0]).filter(
					k => k !== "metric" && !isNaN(parseInt(k))
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
						modifiers: [["darker", 0.6]]
					}}
					axisBottom={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: -15,
						legend: "Métrica/Pergunta",
						legendPosition: "middle",
						legendOffset: 50
					}}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: "Número de Respostas",
						legendPosition: "middle",
						legendOffset: -60
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
							effects: [
								{ on: "hover", style: { itemOpacity: 1 } }
							]
						}
					]}
				/>
			</div>
		</div>
	);
}

export function PerformanceByClusterChart({
	data
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
						modifiers: [["darker", 1.6]]
					}}
					borderRadius={6}
					axisBottom={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: "Cluster",
						legendPosition: "middle",
						legendOffset: 45
					}}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: "Performance Média",
						legendPosition: "middle",
						legendOffset: -60,
						format: ".2f"
					}}
					labelSkipWidth={12}
					labelSkipHeight={12}
					labelTextColor={{
						from: "color",
						modifiers: [["darker", 1.6]]
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
							effects: [
								{ on: "hover", style: { itemOpacity: 1 } }
							]
						}
					]}
				/>
			</div>
		</div>
	);
}
