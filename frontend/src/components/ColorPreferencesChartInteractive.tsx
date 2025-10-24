// ColorPreferencesChartInteractive.tsx
// VERSÃO PREMIUM - Com Reset e Contador

import { useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { RotateCcw } from 'lucide-react';

interface ColorPreference {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface ColorPreferencesChartProps {
  data: ColorPreference[];
}

export default function ColorPreferencesChart({ data }: ColorPreferencesChartProps) {
  const [hiddenColors, setHiddenColors] = useState<Set<string>>(new Set());

  const filteredData = data.filter(item => !hiddenColors.has(item.id));

  const totalVisible = filteredData.reduce((sum, item) => sum + item.value, 0);

  const handleLegendClick = (colorId: string) => {
    setHiddenColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(colorId)) {
        newSet.delete(colorId);
      } else {
        newSet.add(colorId); 
      }
      return newSet;
    });
  };

  const handleReset = () => {
    setHiddenColors(new Set());
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      {/* Header com título e botão reset */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🎨 Preferências Visuais
          </h3>
          <p className="text-sm text-gray-600">
            Distribuição de escolhas de cores
          </p>
          <p className="text-xs text-gray-500 mt-1">
            💡 Clique nas cores abaixo para mostrar/ocultar
          </p>
        </div>
        
        {hiddenColors.size > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            title="Mostrar todas as cores"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-4 text-sm">
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
          <span className="font-semibold">{filteredData.length}</span> de <span className="font-semibold">{data.length}</span> cores visíveis
        </div>
      </div>

      <div style={{ height: '350px' }}>
        <ResponsivePie
          data={filteredData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.6}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ datum: 'data.color' }}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]]
          }}
          enableArcLinkLabels={true}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#ffffff"
          legends={[]}
          tooltip={({ datum }) => (
            <div
              style={{
                background: 'white',
                padding: '9px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  background: datum.color,
                  display: 'inline-block',
                  marginRight: '8px',
                  borderRadius: '2px',
                }}
              />
              <strong>{datum.label}</strong>: {datum.value}
              <span className="text-gray-500 ml-2">
                ({((datum.value / totalVisible) * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        />
      </div>

      {/* Legenda Clicável Customizada */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {data.map((item) => {
            const isHidden = hiddenColors.has(item.id);
            const percentage = ((item.value / totalVisible) * 100).toFixed(1);
            
            return (
              <button
                key={item.id}
                onClick={() => handleLegendClick(item.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg 
                  transition-all duration-200
                  ${isHidden 
                    ? 'bg-gray-100 opacity-40 hover:opacity-60' 
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-105'
                  }
                `}
                title={isHidden ? 'Clique para mostrar' : 'Clique para ocultar'}
              >
                {/* Indicador de cor */}
                <div
                  className={`w-4 h-4 rounded ${isHidden ? 'opacity-40' : ''}`}
                  style={{ backgroundColor: item.color }}
                />
                
                {/* Label */}
                <span className={`text-sm font-medium ${isHidden ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.label}
                </span>
                
                {/* Valor e Percentual */}
                <span className={`text-xs ${isHidden ? 'text-gray-300' : 'text-gray-500'}`}>
                  {!isHidden && `${item.value} (${percentage}%)`}
                  {isHidden && `(${item.value})`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensagem quando todas estão ocultas */}
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-3">
            Todas as cores estão ocultas. Clique nas cores acima ou no botão "Resetar" para visualizar.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Mostrar Todas
          </button>
        </div>
      )}
    </div>
  );
}