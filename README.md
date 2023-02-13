# config-plugins/react-native-daily-js

Config plugin to auto configure `react-native-daily-js` when the native code is generated (`npx expo prebuild`).

## Versioning

Ensure you use versions that work together!

| `expo` | `react-native-webrtc` | `@config-plugins/react-native-webrtc` |
| ------ | --------------------- | ------------------------------------- |
| 47.0.0 | 1.106.1               | 5.0.0                                 |
| 46.0.0 | 1.100.0               | 4.0.0                                 |
| 45.0.0 | 1.100.0               | 3.0.0                                 |
| 44.0.0 | 1.92.2                | 2.0.0                                 |
| 43.0.0 | 1.92.2                | 1.0.0                                 |


## Expo installation

> Tested against Expo SDK 47

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).
> First install the package with yarn, npm, or [`npx expo install`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
npx expo install react-native-webrtc @config-plugins/react-native-webrtc
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["@config-plugins/react-native-webrtc"]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.
