import defaults from "./telemetry";
import url from "url";
import base64 from "base-64";

export default class Client {
  telemetry: any;
  baseUrl: any;
  bearer: any;
  domain: any;

  constructor(options: any) {
    const { baseUrl, telemetry = {}, token } = options;
    if (!baseUrl) {
      throw new Error("Missing Auth0 domain");
    }
    const { name = defaults.name, version = defaults.version } = telemetry;
    this.telemetry = { name, version };
    if (name !== defaults.name) {
      this.telemetry.env = {};
      this.telemetry.env[defaults.name] = defaults.version;
    }
    const parsed = url.parse(baseUrl);
    this.baseUrl =
      parsed.protocol === "https:" || parsed.protocol === "http:"
        ? baseUrl
        : `https://${baseUrl}`;
    this.domain = parsed.hostname || baseUrl;
    if (token) {
      this.bearer = `Bearer ${token}`;
    }
  }

  post(path: any, body: any) {
    return this.request("POST", this.url(path), body);
  }

  patch(path: any, body: any) {
    return this.request("PATCH", this.url(path), body);
  }

  get(path: any, query: any) {
    return this.request("GET", this.url(path, query), null);
  }

  url(path: any, query?: any, includeTelemetry = false): any {
    let endpoint = url.resolve(this.baseUrl, path);
    if ((query && query.length !== 0) || includeTelemetry) {
      const parsed: any = url.parse(endpoint);
      parsed.query = query || {};
      if (includeTelemetry) {
        parsed.query.auth0Client = this._encodedTelemetry();
      }
      endpoint = url.format(parsed);
    }
    return endpoint;
  }

  request(method: any, url: any, body: any) {
    const options: any = {
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Auth0-Client": this._encodedTelemetry(),
      },
    };
    if (this.bearer) {
      options.headers.Authorization = this.bearer;
    }
    if (body) {
      options.body = JSON.stringify(body);
    }
    return fetch(url, options).then((response) => {
      const payload = {
        status: response.status,
        ok: response.ok,
        headers: response.headers,
      };
      return response
        .json()
        .then((json) => {
          return { ...payload, json };
        })
        .catch(() => {
          return response
            .text()
            .then((text) => {
              return { ...payload, text };
            })
            .catch(() => {
              return { ...payload, text: response.statusText };
            });
        });
    });
  }

  _encodedTelemetry() {
    return base64.encode(JSON.stringify(this.telemetry));
  }
}
