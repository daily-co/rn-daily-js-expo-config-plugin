import {
  AndroidConfig, ConfigPlugin, createRunOncePlugin, withAppBuildGradle
} from "@expo/config-plugins";

import { withBuildProperties } from "expo-build-properties";

//import { IOSPermissionsProps, withPermissions } from "./withPermissions";

const withAppBuildGradleModified: ConfigPlugin<void> = (
  config
) => {
  return withAppBuildGradle(config, async file => {
    const modResults = file.modResults;
    modResults.contents = modResults.contents + '\nandroid.packagingOptions.jniLibs.useLegacyPackaging = true\n';
    return file;
  });
};

const withDaily: ConfigPlugin<void> = (
  config
) => {

  // Fixing the issue from Expo with Hermes
  // https://github.com/expo/expo/issues/17450
  config = withAppBuildGradleModified(config);

  // Android
  config = AndroidConfig.Permissions.withPermissions(config, [
    "android.permission.FOREGROUND_SERVICE",
  ]);

  return config;
};

module.exports = createRunOncePlugin(
  withDaily,
  'withDaily',
  '0.0.1'
);
