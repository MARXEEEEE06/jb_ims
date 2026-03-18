// src/components/Histogram.jsx
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

function Histogram({ dataArray }) {
  // dataArray: array of numbers, e.g. [1,2,2,3,3,3,4]
  
  // Create frequency map
  const freq = {};
  dataArray.forEach((num) => {
    freq[num] = (freq[num] || 0) + 1;
  });

  const labels = Object.keys(freq);
  const data = {
    labels,
    datasets: [
      {
        label: 'Frequency',
        data: Object.values(freq),
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Histogram' },
    },
  };

  return <Bar data={data} options={options} />;
}

export default Histogram;