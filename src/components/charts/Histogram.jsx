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

function Histogram({ data }) {
  // dataArray: array of numbers, e.g. [1,2,2,3,3,3,4]
  
  // Create frequency map
  // const freq = {};
  // dataArray.forEach((num) => {
  //   freq[num] = (freq[num] || 0) + 1;
  // });

  const labels = data.map(item => item.product);  // ["Widget A", "Widget B", ...]
  const supplyData = data.map(item => item.supply); // [50,30,80,...]
  const demandData = data.map(item => item.demand); // [40,60,70,...]

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Supply',
        // data: Object.values(supplyData),
        data: supplyData,
        backgroundColor: 'rgb(75, 192, 75)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
      },
      {
        label: 'Demand',
        // data: Object.values(demandData),
        data: demandData,
        backgroundColor: 'rgb(192, 75, 75)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 1,
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

export default Histogram;