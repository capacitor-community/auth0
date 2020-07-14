import Agent from "./agent";
import { Plugins } from "@capacitor/core";

import url from "url";
import AuthError from "../auth/authError";
import verifyToken from "../jwt";

const { Auth0, Device } = Plugins;

const callbackUri = (domain: any): any => {
  return new Promise((resolve, reject) => {
    Auth0.getConstants().then((consts: any) => {
      Device.getInfo().then((info: any) => {
        console.log(info);

        if (consts && info) {
          const platform = info.platform;
          const identifier = consts.bundleIdentifier;

          resolve(
            `${identifier.toLowerCase()}://${domain}/${platform}/${identifier}/callback`
          );
        } else {
          reject();
        }
      }).catch((err1) => reject(err1));
    }).catch((err2) => reject(err2));
  });
};

/**
 * Helper to perform Auth against Auth0 hosted login page
 *
 * It will use `/authorize` endpoint of the Authorization Server (AS)
 * with Code Grant and Proof Key for Challenge Exchange (PKCE).
 *
 * @export
 * @class WebAuth
 * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
 */
export default class WebAuth {
  client: any;
  domain: any;
  clientId: any;
  agent: any;

  constructor(auth: any) {
    this.client = auth;
    const { clientId, domain }: any = auth;
    this.domain = domain;
    this.clientId = clientId;
    this.agent = new Agent();
  }

  /**
   * Starts the AuthN/AuthZ transaction against the AS in the in-app browser.
   *
   * In iOS it will use `SFSafariViewController` and in Android Chrome Custom Tabs.
   *
   * To learn more about how to customize the authorize call, check the Universal Login Page
   * article at https://auth0.com/docs/hosted-pages/login
   *
   * @param {Object}  parameters Parameters to send on the AuthN/AuthZ request.
   * @param {String}  [parameters.state] Random string to prevent CSRF attacks and used to discard unexepcted results. By default its a cryptographically secure random.
   * @param {String}  [parameters.nonce] Random string to prevent replay attacks of id_tokens.
   * @param {String}  [parameters.audience] Identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token
   * @param {String}  [parameters.scope] Scopes requested for the issued tokens. e.g. `openid profile`
   * @param {String}  [parameters.connection] The name of the identity provider to use, e.g. "google-oauth2" or "facebook". When not set, it will display Auth0's Universal Login Page.
   * @param {Number}  [parameters.max_age] The allowable elapsed time in seconds since the last time the user was authenticated (optional).
   * @param {Object}  options Other configuration options.
   * @param {Number}  [options.leeway] The amount of leeway, in seconds, to accommodate potential clock skew when validating an ID token's claims. Defaults to 60 seconds if not specified.
   * @param {Boolean} [options.ephemeralSession] Disable Single-Sign-On (SSO). It only affects iOS with versions 13 and above.
   * @returns {Promise}
   * @see https://auth0.com/docs/api/authentication#authorize-client
   *
   * @memberof WebAuth
   */
  authorize(parameters: any = {}, options: any = {}) {
    const { clientId, domain, client, agent } = this;

    return agent
      .newTransaction()
      .then(({ state, verifier, ...defaults }: any) => {

        return callbackUri(domain).then((redirectUri: string) => {
          console.error(redirectUri);

          const expectedState = parameters.state || state;
          let query = {
            ...defaults,
            clientId,
            responseType: "code",
            redirectUri,
            state: expectedState,
            ...parameters,
          };
          const authorizeUrl = this.client.authorizeUrl(query);

          return agent
            .show(authorizeUrl, options.ephemeralSession)
            .then((redirectUrl: any) => {
              console.warn('ss', redirectUrl);
              if (!redirectUrl || !redirectUrl.startsWith(redirectUri)) {
                throw new AuthError({
                  json: {
                    error: "a0.redirect_uri.not_expected",
                    error_description: `Expected ${redirectUri} but got ${redirectUrl}`,
                  },
                  status: 0,
                });
              }
              const query = url.parse(redirectUrl, true).query;
              const { code, state: resultState, error } = query;
              if (error) {
                throw new AuthError({ json: query, status: 0 });
              }
              if (resultState !== expectedState) {
                throw new AuthError({
                  json: {
                    error: "a0.state.invalid",
                    error_description: `Invalid state received in redirect url`,
                  },
                  status: 0,
                });
              }

              return client
                .exchange({ code, verifier, redirectUri })
                .then((credentials: any) => {
                  return verifyToken(credentials.idToken, {
                    domain,
                    clientId,
                    nonce: parameters.nonce,
                    maxAge: parameters.max_age,
                    scope: parameters.scope,
                    leeway: options.leeway,
                  }).then(() => Promise.resolve(credentials));
                });
            })
            .catch((error: any) => {
              throw new AuthError({ json: error, status: 0 });
            });
        }).catch((err1: any) => {
          console.error(err1);
        });
      })
      .catch((err: any) => {
        console.log(err);
        throw new AuthError({ json: err, status: 0 });
      });
  }

  /**
   *  Removes Auth0 session and optionally remove the Identity Provider session.
   *
   *  In iOS it will use `SFSafariViewController` and in Android Chrome Custom Tabs.
   *
   * @param {Object} parameters Parameters to send
   * @param {Bool} [parameters.federated] Optionally remove the IdP session.
   * @returns {Promise}
   * @see https://auth0.com/docs/logout
   *
   * @memberof WebAuth
   */
  clearSession(options: any = {}) {
    const { client, agent, domain, clientId } = this;
    options.clientId = clientId;
    options.returnTo = callbackUri(domain);
    options.federated = options.federated || false;
    const logoutUrl = client.logoutUrl(options);
    return agent.show(logoutUrl, false, true);
  }
}
