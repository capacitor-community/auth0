declare module "@capacitor/core" {
  interface PluginRegistry {
    Auth0: Auth0Plugin;
  }
}

export interface Auth0Plugin {
  showUrl(options: { url: string }): Promise<any>;
  oauthParameters(): Promise<OAuthParameters>;
  getConstants(): Promise<Constants>;
}

export interface OAuthParameters {
  verifier: string;
  code_challenge: string;
  code_challenge_method: string;
  state: string;
}

export interface Constants {
  bundleIdentifier: string;
}
