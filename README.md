# @daily-co/config-plugin-rn-daily-js

[Expo](https://docs.expo.dev/introduction/expo/) is an open-source framework for apps that run natively on Android, iOS, and the web.

This project cannot be used with an [Expo Go](https://docs.expo.dev/workflow/expo-go/) app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

When a project requires custom native code or a config plugin, we need to transition from using [Expo Go](https://docs.expo.dev/workflow/expo-go/)
to a [development build](https://docs.expo.dev/development/introduction/).

Using this plugin It will autoconfigure the [react-native-daily-js](https://github.com/daily-co/react-native-daily-js) requirements when the native code is generated (`npx expo prebuild`).

## Versioning

Ensure you use versions that work together!

| `expo` | `@daily-co/react-native-webrtc` | `@config-plugins/react-native-webrtc` | `@daily-co/react-native-daily-js` |`@daily-co/config-plugin-rn-daily-js` |
|--------|---------------------------------|---------------------------------------| --------------------------------- |------------------------------------- |
| 47.x   | 1.94.1-daily.8                  | 5.0.0                                 | 0.36.0                            |0.0.1                                 |


## Expo installation

> Tested against Expo SDK 47
> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

### Install `react-native-daily-js` dependencies

Install the `react-native-daily-js` dependencies as mentioned [here](https://github.com/daily-co/react-native-daily-js#installation).

```sh
npm i @daily-co/react-native-daily-js @react-native-async-storage/async-storage@^1.15.7 react-native-background-timer@^2.3.1
npm i --save-exact @daily-co/react-native-webrtc@1.94.1-daily.8
```

### Install Expo config plugins

```sh
npm i @config-plugins/react-native-webrtc @daily-co/config-plugin-rn-daily-js
```

After installing these packages, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`.
 - For iOS you also need to add the `voip` background permission.

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": [
          "voip"
        ]
      }
    },
    "plugins": [
      "@config-plugins/react-native-webrtc",
      "@daily-co/config-plugin-rn-daily-js",
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 24
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ]
  }
}
```

## Expo build

After installing all the dependencies, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

## Extra customization

The `@config-plugins/react-native-webrtc` provides props for extra customization, for instance, to define the messages when we ask for permissions. 
Look at the [plugin API](https://github.com/expo/config-plugins/tree/main/packages/react-native-webrtc) to understand how you can use It.
