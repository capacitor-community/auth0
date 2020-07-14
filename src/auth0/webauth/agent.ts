import { Plugins } from "@capacitor/core";

const { Device, App } = Plugins;

export default class Agent {
  show(url: any, ephemeralSession = false, closeOnLoad = false) {
    if (!Plugins.Auth0) {
      return Promise.reject(
        new Error(
          "Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md."
        )
      );
    }

    return new Promise(async (resolve, reject) => {
      const platform = (await Device.getInfo()).platform;

      const urlHandler = (event: any) => {
        console.warn('e', event);
        // App.removeListener('appUrlOpen', urlHandler);
        resolve(event.url);
      }

      console.log('-->', (await App.getLaunchUrl()));

      const params =
        platform === "ios" ? [ephemeralSession, closeOnLoad] : [closeOnLoad];
      console.log(url, params);

      App.addListener('appUrlOpen', urlHandler);

      (Plugins.Auth0 as any).showUrl({ url }).then((data: any) => {
        // App.removeListener('appUrlOpen');
        console.log('---', data);

        if (data && data.error) {
          reject(data);
        } else if (closeOnLoad) {
          resolve();
        } else {
          resolve(data);
        }
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

  newTransaction() {
    if (!Plugins.Auth0) {
      return Promise.reject(
        new Error(
          "Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md."
        )
      );
    }

    return new Promise((resolve, _reject) => {
      (Plugins.Auth0 as any).oauthParameters().then((params: any) => resolve(params));
    });
  }
}
