/**
 * Financial calculation utilities for the application
 */

/**
 * Calculate the compound annual growth rate (CAGR)
 * @param startValue The starting value
 * @param endValue The ending value
 * @param years The number of years
 * @returns The CAGR as a decimal
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

/**
 * Calculate the compound monthly growth rate
 * @param startValue The starting value
 * @param endValue The ending value
 * @param months The number of months
 * @returns The monthly growth rate as a decimal
 */
export function calculateMonthlyGrowthRate(startValue: number, endValue: number, months: number): number {
  if (startValue <= 0 || months <= 0) return 0;
  return Math.pow(endValue / startValue, 1 / months) - 1;
}

/**
 * Calculate the burn rate
 * @param expenses Total expenses for the period
 * @param revenue Total revenue for the period
 * @returns The burn rate amount
 */
export function calculateBurnRate(expenses: number, revenue: number): number {
  return Math.max(0, expenses - revenue);
}

/**
 * Calculate cash runway
 * @param cashBalance Current cash balance
 * @param burnRate Monthly burn rate
 * @returns Runway in months
 */
export function calculateRunway(cashBalance: number, burnRate: number): number {
  if (burnRate <= 0) return Infinity;
  return cashBalance / burnRate;
}

/**
 * Calculate the total cost of an employee
 * @param baseSalary Base salary amount
 * @param benefitsRate Benefits as a percentage of salary (decimal)
 * @param taxRate Tax rate as a percentage of salary (decimal)
 * @returns Total annual cost
 */
export function calculateEmployeeCost(
  baseSalary: number,
  benefitsRate: number,
  taxRate: number
): number {
  return baseSalary * (1 + benefitsRate + taxRate);
}

/**
 * Project future value based on growth rate
 * @param currentValue The current value
 * @param growthRate The growth rate (as a decimal)
 * @param periods Number of periods to project forward
 * @returns The projected value
 */
export function projectFutureValue(
  currentValue: number,
  growthRate: number,
  periods: number
): number {
  return currentValue * Math.pow(1 + growthRate, periods);
}

/**
 * Calculate Customer Acquisition Cost (CAC)
 * @param marketingCost Total marketing cost
 * @param salesCost Total sales cost
 * @param newCustomers Number of new customers acquired
 * @returns The CAC value
 */
export function calculateCAC(
  marketingCost: number,
  salesCost: number,
  newCustomers: number
): number {
  if (newCustomers <= 0) return 0;
  return (marketingCost + salesCost) / newCustomers;
}

/**
 * Calculate Customer Lifetime Value (LTV)
 * @param averageRevenue Average revenue per customer
 * @param grossMargin Gross margin as a decimal
 * @param churnRate Monthly churn rate as a decimal
 * @returns The LTV value
 */
export function calculateLTV(
  averageRevenue: number,
  grossMargin: number,
  churnRate: number
): number {
  if (churnRate <= 0 || churnRate >= 1) return 0;
  return (averageRevenue * grossMargin) / churnRate;
}

/**
 * Format currency for display
 * @param value The numeric value to format
 * @param currency The currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "$"
): string {
  return `${currency}${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format percentage for display
 * @param value The decimal value to format as percentage
 * @param includeSign Whether to include a + or - sign
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  includeSign: boolean = false
): string {
  const formattedValue = `${Math.abs(value * 100).toFixed(1)}%`;
  if (!includeSign) return formattedValue;
  return value >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
}

/**
 * Generate months for projections
 * @param startMonth Starting month (0-11)
 * @param startYear Starting year
 * @param count Number of months to generate
 * @returns Array of month strings in "MMM YYYY" format
 */
export function generateMonthsArray(
  startMonth: number,
  startYear: number,
  count: number
): string[] {
  const months = [];
  let currentMonth = startMonth;
  let currentYear = startYear;

  for (let i = 0; i < count; i++) {
    const date = new Date(currentYear, currentMonth);
    const monthString = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push(monthString);

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return months;
}

/**
 * Format month string in "YYYY-MM" format to a more readable format
 * @param monthStr Month in "YYYY-MM" format
 * @returns Formatted month string (e.g., "Jan 2023")
 */
export function formatMonthYearFromString(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Calculate the percentage of a value relative to another value
 * @param value The value to calculate percentage for
 * @param total The total value
 * @returns The percentage as a decimal
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return value / total;
}
