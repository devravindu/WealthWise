import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/lib/currency';
import { Currency } from '@shared/schema';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ExpenseChartProps = {
  expensesByCategory: Record<string, number>;
  currency: Currency;
};

// Define color scheme for categories
const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#6366f1', // indigo
  '#6b7280', // gray
];

export default function ExpenseChart({ expensesByCategory, currency }: ExpenseChartProps) {
  const [chartData, setChartData] = useState<Array<{ name: string; value: number; percentage: number }>>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // Prepare data for the chart
  useEffect(() => {
    if (!expensesByCategory || Object.keys(expensesByCategory).length === 0) {
      setChartData([]);
      setTotalExpenses(0);
      return;
    }
    
    const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    setTotalExpenses(total);
    
    const data = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: Math.round((amount / total) * 100)
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending
    
    setChartData(data);
  }, [expensesByCategory]);
  
  if (Object.keys(expensesByCategory).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No expense data available for this month.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {chartData.slice(0, 5).map((entry, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${COLORS[index % COLORS.length]}15`,
                color: COLORS[index % COLORS.length],
              }}
            >
              <span
                className="w-2 h-2 mr-1 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              {entry.name}: {formatCurrency(entry.value, currency)} ({entry.percentage}%)
            </span>
          ))}
        </div>
      </div>
      
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, currency), "Amount"]}
              labelFormatter={(name) => `Category: ${name}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
