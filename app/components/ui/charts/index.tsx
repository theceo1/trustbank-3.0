import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: any;
  className?: string;
  gradient?: boolean;
}

export function LineChart({ data, className, gradient }: ChartProps) {
  return (
    <div className={className}>
      <Line data={data} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        }
      }} />
    </div>
  );
}

export function BarChart({ data, className }: ChartProps) {
  return (
    <div className={className}>
      <Bar data={data} options={{
        responsive: true,
        maintainAspectRatio: false,
      }} />
    </div>
  );
}