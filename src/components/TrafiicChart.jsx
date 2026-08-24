import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const data = [
  { day: "Mon", traffic: 120 },
  { day: "Tue", traffic: 220 },
  { day: "Wed", traffic: 180 },
  { day: "Thu", traffic: 250 },
  { day: "Fri", traffic: 300 }
];

function TrafficChart() {
  return (
    <LineChart
      width={700}
      height={300}
      data={data}
    >
      <XAxis dataKey="day" />

      <YAxis />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="traffic"
      />
    </LineChart>
  );
}

export default TrafficChart;