import {
  ConfigPlugin, createRunOncePlugin, withAppBuildGradle
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

module.exports = createRunOncePlugin(
  withAppBuildGradleModified,
  'withAppBuildGradleMOdified',
  '1.0.0'
);

//export default createRunOncePlugin(withDaily, pkg.name, pkg.version);
