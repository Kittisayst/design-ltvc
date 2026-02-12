import React, { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCanvas } from '../../context/CanvasContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export function ChartPanel({ onBack }) {
    const { canvasManager } = useCanvas();
    const [chartType, setChartType] = useState('bar');
    const [chartLabels, setChartLabels] = useState('Jan,Feb,Mar,Apr,May');
    const [chartData, setChartData] = useState('12,19,3,5,2');
    const [chartLabel, setChartLabel] = useState('Sales');
    const [chartColor, setChartColor] = useState('#3498db');
    const [chartFont, setChartFont] = useState('Arial');
    const chartRef = useRef(null);

    const handleAddChart = () => {
        if (!chartRef.current || !canvasManager) return;
        try {
            const base64Image = chartRef.current.toBase64Image();
            canvasManager.addImage(base64Image);
        } catch (err) {
            console.error("Failed to add chart to canvas", err);
        }
    };

    const labels = chartLabels.split(',').map(s => s.trim());
    const dataPoints = chartData.split(',').map(s => parseFloat(s.trim()) || 0);

    const data = {
        labels,
        datasets: [
            {
                label: chartLabel,
                data: dataPoints,
                backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                    ? [chartColor, '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#34495e']
                    : chartColor,
                borderColor: chartType === 'line' ? chartColor : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2.5,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { font: { family: chartFont } }
            },
            title: {
                display: true,
                text: chartLabel,
                font: { family: chartFont, size: 16 }
            },
            tooltip: {
                bodyFont: { family: chartFont },
                titleFont: { family: chartFont }
            }
        },
        scales: {
            x: { ticks: { font: { family: chartFont } } },
            y: { ticks: { font: { family: chartFont } } }
        }
    };

    // For Pie/Doughnut, remove scales/axes
    if (chartType === 'pie' || chartType === 'doughnut') {
        delete options.scales;
    }

    return (
        <div className="elements-panel">
            <div className="panel-header-row" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="icon-btn" onClick={onBack} title="Back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>Chart Generator</span>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                <div style={{ height: '200px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px' }}>
                    {chartType === 'bar' && <Bar ref={chartRef} data={data} options={options} />}
                    {chartType === 'line' && <Line ref={chartRef} data={data} options={options} />}
                    {chartType === 'pie' && <Pie ref={chartRef} data={data} options={options} />}
                    {chartType === 'doughnut' && <Doughnut ref={chartRef} data={data} options={options} />}
                </div>

                <div>
                    <label className="input-label">Chart Type</label>
                    <select
                        className="panel-select"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                    >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                    </select>
                </div>

                <div>
                    <label className="input-label">Font Family</label>
                    <select
                        className="panel-select"
                        value={chartFont}
                        onChange={(e) => setChartFont(e.target.value)}
                    >
                        <option value="Arial">Arial (Standard)</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Impact">Impact</option>
                        <option value="'Phetsarath OT', sans-serif">Phetsarath OT (Lao)</option>
                        <option value="'Noto Sans Lao', sans-serif">Noto Sans Lao</option>
                    </select>
                </div>

                {/* ... rest of inputs ... */}
                <div>
                    <label className="input-label">Dataset Label</label>
                    <input
                        type="text"
                        className="panel-input"
                        value={chartLabel}
                        onChange={(e) => setChartLabel(e.target.value)}
                    />
                </div>

                <div>
                    <label className="input-label">Labels (comma separated)</label>
                    <input
                        type="text"
                        className="panel-input"
                        value={chartLabels}
                        onChange={(e) => setChartLabels(e.target.value)}
                    />
                </div>

                <div>
                    <label className="input-label">Data (comma separated)</label>
                    <input
                        type="text"
                        className="panel-input"
                        value={chartData}
                        onChange={(e) => setChartData(e.target.value)}
                    />
                </div>

                <div>
                    <label className="input-label">Primary Color</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="color"
                            value={chartColor}
                            onChange={(e) => setChartColor(e.target.value)}
                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#888' }}>{chartColor}</span>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleAddChart}
                    style={{ marginTop: '10px' }}
                >
                    Add Chart to Canvas
                </button>
                <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    Added as a high-res Image object
                </div>
            </div>
        </div>
    );
}
