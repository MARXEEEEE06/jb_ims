import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import BASE_URL from '../../hooks/server/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

function SupplyChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const response = await fetch(`${BASE_URL}/gettopsupply`);
        const result = await response.json();
        setData(result.map(item => ({
          product: item.prod_name,
          supply: item.stock_quantity,
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupply();
  }, []);

  const chartData = {
    labels: data.map(item => item.product),
    datasets: [
      {
        label: 'Supply',
        data: data.map(item => item.supply),
        backgroundColor: 'rgb(75, 192, 75)',
        borderColor: 'rgb(0,0,0)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Top 10 Supply Levels' },
    },
  };

  return <Bar data={chartData} options={options} />;
}

export default SupplyChart;