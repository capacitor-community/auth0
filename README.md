<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">Auth0</h3>
<p align="center"><strong><code>@capacitor-community/auth0</code></strong></p>
<p align="center">
  A native plugin for Auth0 authentication provider
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2020?style=flat-square" />
  <a href="https://github.com/capacitor-community/example/actions?query=workflow%3A%22CI%22"><img src="https://img.shields.io/github/workflow/status/capacitor-community/example/CI?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/example"><img src="https://img.shields.io/npm/l/@capacitor-community/example?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/example"><img src="https://img.shields.io/npm/dw/@capacitor-community/example?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/example"><img src="https://img.shields.io/npm/v/@capacitor-community/example?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-0-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer    | GitHub                                      | Social                                           |
| ------------- | ------------------------------------------- | ------------------------------------------------ |
| Priyank Patel | [priyankpat](https://github.com/priyankpat) | [@priyankpat\_](https://twitter.com/priyankpat_) |

## Installation

Using npm:

```bash
npm install @capacitor-community/auth0
```

Using yarn:

```bash
yarn add @capacitor-community/auth0
```

Sync native files:

```bash
npx cap sync
```

On iOS, no further steps are needed.

On Android, make changes to the following files:

`AndroidManifest.xml`:

Replace **AUTH0_HOST** with Tenant Domain provided by Auth0.

```xml
<activity ...>
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:host="AUTH0_HOST"
        android:pathPrefix="/android/${applicationId}/callback"
        android:scheme="${applicationId}" />
  </intent-filter>
</activity>
```

`MainActivity.java`:

```java
import com.getcapacitor.community.auth0.Auth0;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(
        savedInstanceState,
        new ArrayList<Class<? extends Plugin>>() {

          {
            // Additional plugins you've installed go here
            // Ex: add(TotallyAwesomePlugin.class);
            add(Auth0.class);
          }
        }
      );
  }
}
```

## Supported methods

| Name                            | Android | iOS | Web |
| :------------------------------ | :------ | :-- | :-- |
| authorize                           | ✅      | ✅  | ❌  |
| clearSession                      | ✅      | ✅  | ❌  |

## Usage

```typescript
import Auth0 from '@capacitor-community/auth0';

/*
 * Create a new instance of the client using the Auth0 domain and client id.
*/
const auth0 = new Auth0({
  domain: 'DOMAIN',
  clientId: 'CLIENT_ID',
});

/**
 * Platform: Android/iOS
 * This method trigger a auth0 web authentication.
 * @params scope - list of scope seperated by whitespace
 * @returns void
 */
auth0.webAuth
  .authorize({ scope: 'openid email profile' })
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));

/**
 * Platform: Android/iOS
 * This method trigger a auth0 logout.
 * @params scope - list of scope seperated by whitespace
 * @returns void
 */
auth0.webAuth.clearSession().catch(error => console.log(error));

// Management API (Users) (Coming Soon)
// Authentication API (Coming Soon)

```