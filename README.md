# @daily-co/config-plugin-rn-daily-js

Expo is an open-source framework for apps that run natively on Android, iOS, and the web. More details [here](https://docs.expo.dev/introduction/expo/).

This project is an Expo config plugin to autoconfigure `react-native-daily-js` when the native code is generated (`npx expo prebuild`).

Since `react-native-daily-js` and `@daily-co/react-native-webrtc` this package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/). 

More details about how to create your own development client instead of expo go in order to use native code which are not by default included on Expo can be found [here](https://docs.expo.dev/development/introduction/).

## Versioning

Ensure you use versions that work together!

| `expo` | `@daily-co/react-native-webrtc` | `@config-plugins/react-native-webrtc` | `@daily-co/react-native-daily-js` |`@daily-co/config-plugin-rn-daily-js` |
|--------|---------------------------------|---------------------------------------| --------------------------------- |------------------------------------- |
| 47.x   | 1.94.1-daily.8                  | 5.0.0                                 | 0.36.0                            |0.0.1                                 |


## Expo installation

> Tested against Expo SDK 47
> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

> Install the `react-native-daily-js` dependencies as mentioned [here](https://github.com/daily-co/react-native-daily-js#installation).
```sh
npm i @daily-co/react-native-daily-js @react-native-async-storage/async-storage@^1.15.7 react-native-background-timer@^2.3.1
npm i --save-exact @daily-co/react-native-webrtc@1.94.1-daily.8
```

> Install Expo config plugins
```sh
npm i @config-plugins/react-native-webrtc @daily-co/config-plugin-rn-daily-js
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
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

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.
