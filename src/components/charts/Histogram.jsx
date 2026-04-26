import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import BASE_URL from '../../hooks/server/config';
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

function Histogram() {
  const [rows, setRows] = useState([]);
  const [range, setRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSupplyDemand = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/supply-demand/monthly`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || "Failed to fetch supply/demand.");

        setRows(Array.isArray(payload?.data) ? payload.data : []);
        setRange(payload?.range || null);
      } catch (e) {
        setError(e?.message || "Failed to fetch supply/demand.");
        setRows([]);
        setRange(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplyDemand();
  }, []);

  const chartData = useMemo(() => {
    const labels = rows.map(item => item.product);
    const supplyData = rows.map(item => Number(item.supply || 0));
    const demandData = rows.map(item => Number(item.demand || 0));

    return {
      labels,
      datasets: [
        {
          label: 'Supply (this month)',
          data: supplyData,
          backgroundColor: 'rgb(75, 192, 75)',
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 1,
        },
        {
          label: 'Demand (this month)',
          data: demandData,
          backgroundColor: 'rgb(192, 75, 75)',
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 1,
        },
      ],
    };
  }, [rows]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: range?.start ? `Supply vs Demand (${range.start} to ${range.end})` : 'Supply vs Demand (This Month)',
      },
    },
  };

  if (loading) return <div style={{ padding: 12 }}>Loading supply/demand…</div>;
  if (error) return <div style={{ padding: 12, color: "#b00020" }}>{error}</div>;
  if (!rows.length) return <div style={{ padding: 12 }}>No supply/demand data for this month.</div>;

  return <Bar data={chartData} options={options} />;
}

export default Histogram;
