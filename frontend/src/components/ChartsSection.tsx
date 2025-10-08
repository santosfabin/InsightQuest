import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';

interface TimeSeriesData {
  period: string;
  target1: number;
  target2: number;
  target3: number;
}

interface TargetDistribution {
  name: string;
  target1: number;
  target2: number;
  target3: number;
  [key: string]: string | number; // ← Adicionado para compatibilidade com Nivo Bar
}

interface ChartsSectionProps {
  timeSeriesData: TimeSeriesData[];
  targetDistribution: TargetDistribution[];
}

export default function ChartsSection({ timeSeriesData, targetDistribution }: ChartsSectionProps) {
  // Transformar dados para o formato do Nivo Line Chart
  const lineChartData = [
    {
      id: 'Target 1',
      color: '#7c3aed',
      data: timeSeriesData.map(item => ({
        x: item.period,
        y: item.target1
      }))
    },
    {
      id: 'Target 2',
      color: '#6b7c59',
      data: timeSeriesData.map(item => ({
        x: item.period,
        y: item.target2
      }))
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Time Series Chart com Nivo */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Tendência Temporal</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveLine
            data={lineChartData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            enableGridX={false}
            colors={['#7c3aed', '#6b7c59']}
            lineWidth={3}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableArea={true}
            areaOpacity={0.15}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 45,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: 'circle',
              }
            ]}
          />
        </div>
      </div>

      {/* Distribution Chart com Nivo */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Distribuição dos Targets</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveBar
            data={targetDistribution}
            keys={['target1', 'target2', 'target3']}
            indexBy="name"
            margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            colors={['#7c3aed', '#6b7c59', '#8b5cf6']}
            borderRadius={8}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            role="application"
          />
        </div>
      </div>
    </div>
  );
}