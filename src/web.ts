import { WebPlugin } from '@capacitor/core';
import { Auth0Plugin } from './definitions';

export class Auth0Web extends WebPlugin implements Auth0Plugin {
  constructor() {
    super({
      name: 'Auth0',
      platforms: ['web']
    });
  }

  getConstants(): Promise<import("./definitions").Constants> {
    throw new Error("Method not implemented.");
  }

  showUrl(_options: { url: string; }): Promise<any> {
    throw new Error("Method not implemented.");
  }
  
  oauthParameters(): Promise<import("./definitions").OAuthParameters> {
    throw new Error("Method not implemented.");
  }
}

const Auth0 = new Auth0Web();

export { Auth0 };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Auth0);
