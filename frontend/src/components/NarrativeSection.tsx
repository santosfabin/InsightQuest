import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NarrativeSectionProps {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function NarrativeSection({
  id,
  number,
  title,
  subtitle,
  summary,
  children,
  collapsible = false,
  defaultExpanded = true,
}: NarrativeSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-8">
        {/* Cabeçalho da Seção */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{number}</span>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  {title}
                </h2>
                <p className="text-gray-600 text-base">
                  {subtitle}
                </p>
              </div>
              
              {collapsible && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={isExpanded ? "Recolher seção" : "Expandir seção"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              )}
            </div>
            
            {summary && (
              <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-r-xl">
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  📌 {summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo da Seção */}
      {(!collapsible || isExpanded) && (
        <div className="space-y-6 pl-0 md:pl-16">
          {children}
        </div>
      )}
      
      {/* Divisor */}
      <div className="mt-12 mb-8 border-t-2 border-gray-100"></div>
    </section>
  );
}