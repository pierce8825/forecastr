
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateNetPay, calculatePayrollTaxes } from "@/lib/payroll-utils";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface PaystubGeneratorProps {
  personnelRole?: any;
}

export function PaystubGenerator({ personnelRole }: PaystubGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePaystub = async () => {
    if (!personnelRole) return;
    
    setIsGenerating(true);
    try {
      const monthlyGross = Number(personnelRole.annualSalary) / 12;
      const taxes = calculatePayrollTaxes(monthlyGross);
      const netPay = calculateNetPay(monthlyGross, Number(personnelRole.benefits));

      const doc = new jsPDF();
      
      // Add company header
      doc.setFontSize(20);
      doc.text("Company Paystub", 20, 20);
      
      // Add employee info
      doc.setFontSize(12);
      doc.text(`Employee: ${personnelRole.title}`, 20, 40);
      doc.text(`Pay Period: ${new Date().toLocaleDateString()}`, 20, 50);
      
      // Add earnings table
      doc.autoTable({
        startY: 60,
        head: [["Earnings", "Amount"]],
        body: [
          ["Gross Pay", `$${monthlyGross.toFixed(2)}`],
          ["Federal Tax", `$${taxes.federalTax.toFixed(2)}`],
          ["State Tax", `$${taxes.stateTax.toFixed(2)}`],
          ["Social Security", `$${taxes.socialSecurity.toFixed(2)}`],
          ["Medicare", `$${taxes.medicare.toFixed(2)}`],
          ["Benefits", `$${(monthlyGross * Number(personnelRole.benefits) / 100).toFixed(2)}`],
          ["Net Pay", `$${netPay.toFixed(2)}`]
        ]
      });
      
      // Download the PDF
      doc.save(`paystub-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Error generating paystub:", error);
    }
    setIsGenerating(false);
  };

  return (
    <Button 
      onClick={generatePaystub} 
      disabled={isGenerating || !personnelRole}
    >
      {isGenerating ? "Generating..." : "Generate Paystub"}
    </Button>
  );
}
