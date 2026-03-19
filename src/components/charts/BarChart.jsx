// src/components/BarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ data }) {
  const labels = data.map(item => item.product);
  const supplyData = data.map(item => item.supply);
  const demandData = data.map(item => item.demand);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Supply',
        data: supplyData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Demand',
        data: demandData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Supply vs Demand' },
    },
  };

  return <Bar data={chartData} options={options} />;
}

export default BarChart;