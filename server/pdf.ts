import { Expense, Income, SavingsGoal, User, CURRENCY_OPTIONS } from "@shared/schema";
import { format } from "date-fns";

interface FinancialSummary {
  user: User;
  income: Income | null;
  expenses: Expense[];
  expensesByCategory: { [category: string]: number };
  savingsGoal: SavingsGoal | null;
  month: Date;
  totalExpenses: number;
  netSavings: number;
}

// Function to generate HTML content for PDF
export function generatePdfHtml(data: FinancialSummary): string {
  const { user, income, expenses, expensesByCategory, savingsGoal, month, totalExpenses, netSavings } = data;
  
  const currencyInfo = CURRENCY_OPTIONS[user.currency as keyof typeof CURRENCY_OPTIONS];
  const symbol = currencyInfo.symbol;
  
  // Format monetary values
  const formatCurrency = (amount: number): string => {
    return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return format(new Date(date), 'MMM dd, yyyy');
  };
  
  // Calculate savings goal progress
  let goalProgress = '';
  if (savingsGoal) {
    const saved = netSavings; // Simplification - in real app you'd track cumulative savings
    const targetAmount = savingsGoal.targetAmount;
    const percentComplete = Math.min(100, Math.floor((saved / targetAmount) * 100));
    const daysLeft = Math.floor((new Date(savingsGoal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    goalProgress = `
      <div>
        <h3>Savings Goal Progress</h3>
        <p>Goal: ${savingsGoal.name || 'Untitled Goal'}</p>
        <p>Target: ${formatCurrency(targetAmount)} by ${formatDate(savingsGoal.deadline)}</p>
        <p>Progress: ${formatCurrency(saved)} / ${formatCurrency(targetAmount)} (${percentComplete}%)</p>
        <p>Days remaining: ${daysLeft}</p>
      </div>
    `;
  }
  
  // Generate expense table rows
  const expenseRows = expenses.map(expense => `
    <tr>
      <td>${formatDate(expense.date)}</td>
      <td>${expense.category}</td>
      <td>${formatCurrency(expense.amount)}</td>
      <td>${expense.note || ''}</td>
    </tr>
  `).join('');
  
  // Generate category breakdown
  const categoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => {
    const percentage = Math.round((amount / totalExpenses) * 100);
    return `<p>${category}: ${formatCurrency(amount)} (${percentage}%)</p>`;
  }).join('');
  
  // Get month and year for the report title
  const monthName = format(month, 'MMMM yyyy');
  
  // Create the HTML for the PDF
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Monthly Finance Report - ${monthName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        h1 {
          color: #0d6efd;
          margin: 0;
          font-size: 24px;
        }
        h2 {
          color: #333;
          font-size: 18px;
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        h3 {
          color: #666;
          font-size: 16px;
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table, th, td {
          border: 1px solid #ddd;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .positive {
          color: #198754;
        }
        .negative {
          color: #dc3545;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Monthly Finance Report - ${monthName}</h1>
        <p>Generated for: ${user.email}</p>
        <p>Currency: ${user.currency}</p>
      </div>
      
      <div class="section">
        <h2>Income Summary</h2>
        <div class="summary-item">
          <span>Monthly Income:</span>
          <span>${income ? formatCurrency(income.amount) : formatCurrency(0)}</span>
        </div>
      </div>
      
      <div class="section">
        <h2>Expense Summary</h2>
        <div class="summary-item">
          <span>Total Expenses:</span>
          <span class="negative">${formatCurrency(totalExpenses)}</span>
        </div>
        
        <h3>Breakdown by Category</h3>
        ${categoryBreakdown}
      </div>
      
      <div class="section">
        <h2>Savings Summary</h2>
        <div class="summary-item">
          <span>Net Savings:</span>
          <span class="positive">${formatCurrency(netSavings)}</span>
        </div>
        <div class="summary-item">
          <span>Percentage of Income:</span>
          <span>${income ? Math.round((netSavings / income.amount) * 100) : 0}%</span>
        </div>
        
        ${goalProgress}
      </div>
      
      <div class="section">
        <h2>Expense Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRows}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p>Generated by FinTrack - Personal Finance Tracking App</p>
        <p>This report is for personal use only.</p>
      </div>
    </body>
    </html>
  `;
}
