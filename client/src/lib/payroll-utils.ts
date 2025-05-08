
export function calculatePayrollTaxes(grossPay: number) {
  // Example tax rates - adjust according to your needs
  const federalTax = grossPay * 0.22;  // 22% federal tax
  const stateTax = grossPay * 0.05;    // 5% state tax
  const socialSecurity = grossPay * 0.062;  // 6.2% social security
  const medicare = grossPay * 0.0145;   // 1.45% medicare
  
  return {
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalTaxes: federalTax + stateTax + socialSecurity + medicare
  };
}

export function calculateNetPay(grossPay: number, benefits: number = 0) {
  const taxes = calculatePayrollTaxes(grossPay);
  const benefitsDeduction = grossPay * (benefits / 100);
  return grossPay - taxes.totalTaxes - benefitsDeduction;
}
