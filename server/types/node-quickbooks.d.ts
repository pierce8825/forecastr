declare module 'node-quickbooks' {
  export default class QuickBooks {
    constructor(
      clientId: string,
      clientSecret: string,
      accessToken: string,
      useOAuth1: boolean,
      realmId: string,
      useSandbox: boolean,
      debug: boolean,
      headers?: any | null,
      oauthVersion?: string,
      refreshToken?: string
    );

    findAccounts(
      criteria: any,
      callback: (err: Error | null, accounts: any) => void
    ): void;

    reportProfitAndLoss(
      options: {
        start_date: string;
        end_date: string;
      },
      callback: (err: Error | null, report: any) => void
    ): void;
  }
}