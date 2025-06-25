
import React, { useEffect, useRef } from 'react';
import { GeneratedVisualization, ChartData } from '../types';

// Make Chart globally available after CDN load for type checking in this file
declare var Chart: any;

interface ChartRendererProps {
  visualization: GeneratedVisualization;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ visualization }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null); // To store the Chart.js instance

  useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') {
        return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
        console.error("ChartRenderer: Failed to get canvas context.");
        return;
    }
    
    // Brand colors from CSS variables (ensure they are loaded)
    const brandPrimary = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#FFDF00';
    const brandSecondary = getComputedStyle(document.documentElement).getPropertyValue('--brand-secondary').trim() || '#004040';
    const textOnSecondary = getComputedStyle(document.documentElement).getPropertyValue('--brand-text-on-secondary').trim() || '#E0F2F1';
    const textOnSecondaryMuted = getComputedStyle(document.documentElement).getPropertyValue('--brand-text-on-secondary-muted').trim() || '#B2DFDB';

    const brandChartPalette = [
        brandPrimary,                 // #FFDF00 (Golden Yellow)
        '#00A0A0',                    // A brighter Teal
        '#FFB000',                    // Amber (darker yellow/orange)
        '#80DEEA',                    // Light Cyan/Teal
        '#FFEDA0',                    // Pale Yellow
        '#00796B',                    // Darker Teal
    ];
    const brandChartBorders = brandChartPalette.map(color => color); // Use same colors for borders or make them slightly darker/opaque

    const chartDataWithDefaults: ChartData = {
        labels: visualization.chartData.labels,
        datasets: visualization.chartData.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || (visualization.type === 'pie' ? brandChartPalette : brandChartPalette[index % brandChartPalette.length] + 'B3'), // Add alpha for area, B3=70%
            borderColor: dataset.borderColor || brandChartBorders[index % brandChartBorders.length],
            borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : (visualization.type === 'line' || visualization.type === 'scatter' ? 2.5 : 1.5),
            fill: dataset.fill !== undefined ? dataset.fill : (visualization.type === 'line' ? {target: 'origin', above: brandChartPalette[index % brandChartPalette.length] + '4D'} : undefined), // line charts filled with low alpha
            tension: dataset.tension !== undefined ? dataset.tension : (visualization.type === 'line' ? 0.2 : undefined), 
            pointRadius: dataset.pointRadius !== undefined ? dataset.pointRadius : (visualization.type === 'scatter' || visualization.type === 'line' ? 5 : 0),
            pointBackgroundColor: dataset.pointBackgroundColor || brandChartPalette[index % brandChartPalette.length],
            pointBorderColor: '#FFFFFF', // White border for points for better visibility
            pointHoverRadius: (visualization.type === 'scatter' || visualization.type === 'line' ? 7 : 2),
        }))
    };
    
    Chart.defaults.color = textOnSecondaryMuted; 
    Chart.defaults.borderColor = brandPrimary + '33'; // Faint primary color for grid lines (20% alpha)
    Chart.defaults.font.family = "'Inter', sans-serif";

    chartRef.current = new Chart(ctx, {
      type: visualization.type,
      data: chartDataWithDefaults,
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
          title: {
            display: true,
            text: visualization.title,
            color: brandPrimary, 
            font: {
              size: 16,
              weight: '600',
            },
            padding: {
                top: 10,
                bottom: 20
            }
          },
          legend: {
            position: 'top',
            labels: {
              color: textOnSecondaryMuted, 
               font: {
                size: 12
              },
              usePointStyle: true,
              boxWidth: 10,
              padding: 15,
            }
          },
          tooltip: {
            backgroundColor: brandSecondary + 'E6', // Secondary color with 90% opacity
            titleColor: brandPrimary, 
            bodyColor: textOnSecondary, 
            borderColor: brandPrimary + '80', // Primary color with 50% alpha
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            usePointStyle: true,
            boxPadding: 4,
          }
        },
        scales: (visualization.type === 'bar' || visualization.type === 'line' || visualization.type === 'scatter') ? {
          x: {
            grid: {
              color: brandPrimary + '33', // Faint primary
              drawOnChartArea: visualization.type === 'scatter' 
            },
            ticks: {
              color: textOnSecondaryMuted, 
               font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 0,
            },
             title: {
                display: !!(visualization.chartData.datasets[0]?.label && (visualization.chartData.datasets[0].data[0] && typeof (visualization.chartData.datasets[0].data[0] as any)?.x !== 'undefined')),
                text: visualization.type === 'scatter' ? (visualization.chartData.datasets[0]?.label.split(' vs ')[1]?.split(' (')[0] || 'X-Axis') : (visualization.chartData.labels ? '' : 'X-Axis'),
                color: textOnSecondary,
                font: { size: 12, weight: '500' }
            }
          },
          y: {
            grid: {
              color: brandPrimary + '33' // Faint primary
            },
            ticks: {
              color: textOnSecondaryMuted, 
               font: {
                size: 11
              }
            },
            beginAtZero: true,
             title: {
                display: true,
                text: visualization.type === 'scatter' ? (visualization.chartData.datasets[0]?.label.split(' vs ')[0]?.split(' (')[0] || 'Y-Axis') : (visualization.chartData.datasets[0]?.label || 'Value'), 
                color: textOnSecondary,
                font: { size: 12, weight: '500' }
            }
          }
        } : undefined, 
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualization]); 

  return (
    <div key={visualization.type + visualization.title} className="bg-[var(--brand-secondary)]/60 shadow-xl rounded-xl p-4 sm:p-6 border border-[var(--brand-primary)]/40">
        <div className="relative h-[300px] sm:h-[350px] md:h-[400px]">
            <canvas ref={canvasRef}></canvas>
        </div>
    </div>
  );
};

export default ChartRenderer;