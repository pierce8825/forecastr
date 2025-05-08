declare module 'node-quickbooks' {
  interface QuickBooksConfig {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
    realmId: string;
    useSandbox?: boolean;
    debug?: boolean;
    minorversion?: number;
  }

  interface ReportOptions {
    start_date?: string;
    end_date?: string;
    report_date?: string;
    accounting_method?: string;
    summarize_column_by?: string;
    date_macro?: string;
    [key: string]: any;
  }

  class QuickBooks {
    constructor(config: QuickBooksConfig);

    // Reports
    reportProfitAndLoss(options: ReportOptions, callback: (err: Error | null, report: any) => void): void;
    reportProfitAndLossDetail(options: ReportOptions, callback: (err: Error | null, report: any) => void): void;
    reportBalanceSheet(options: ReportOptions, callback: (err: Error | null, report: any) => void): void;
    reportBalanceSheetDetail(options: ReportOptions, callback: (err: Error | null, report: any) => void): void;
    reportCashFlow(options: ReportOptions, callback: (err: Error | null, report: any) => void): void;
    reportGeneralLedgerDetail(options: ReportOptions, callback: (err: Error | null, report: any) => void): void;
    
    // Accounts
    findAccounts(options: any, callback: (err: Error | null, accounts: any) => void): void;
    
    // Other methods...
  }

  export = QuickBooks;
}