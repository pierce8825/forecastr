declare module 'intuit-oauth' {
  export default class OAuthClient {
    constructor(options: {
      clientId: string;
      clientSecret: string;
      environment: string;
      redirectUri: string;
    });

    authorizeUri(options: {
      scope: string[];
      state: string;
    }): string;

    createToken(url: string): Promise<{
      getJson(): {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        realmId: string;
      };
    }>;

    refresh(): Promise<{
      getJson(): {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    }>;

    setToken(token: { 
      access_token?: string; 
      refresh_token?: string;
    }): void;

    revoke(options: { token: string }): Promise<any>;
  }
}