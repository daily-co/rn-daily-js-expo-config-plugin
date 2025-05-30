import {
  AndroidConfig, ConfigPlugin, createRunOncePlugin, withAppBuildGradle, withAndroidManifest, withPlugins
} from "@expo/config-plugins";
import withIosBroadcastExtension from "./withIosBroadcastExtension";
import withIosScreenCapture from "./withIosScreenCapture";
import {DailyPermissionsProps, withPermissions} from "./withPermissions";

const withAppBuildGradleModified: ConfigPlugin<void> = (
  config
) => {
  return withAppBuildGradle(config, async file => {
    const modResults = file.modResults;
    modResults.contents = modResults.contents + '\nandroid.packagingOptions.jniLibs.useLegacyPackaging = true\n';
    return file;
  });
};

const withDaily: ConfigPlugin<DailyPermissionsProps> = (
  config, props = {}
) => {
  const {
    enableCamera = true,
    enableMicrophone = true,
    enableScreenShare = false
  } = props;

  // Fixing the issue from Expo with Hermes
  // https://github.com/expo/expo/issues/17450
  config = withAppBuildGradleModified(config);

  config = withPermissions(config, props);

  const serviceTypes: string[] = [];
  if (enableCamera) serviceTypes.push("camera");
  if (enableMicrophone) serviceTypes.push("microphone");

  config = withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplication(config.modResults);
    if(application && !application?.service){
      application!.service = []
    }
    application?.service?.push({
      $: {
        "android:name":  "com.daily.reactlibrary.DailyOngoingMeetingForegroundService",
        "android:exported": "false",
        "android:foregroundServiceType": serviceTypes.join("|"),
      },
    })

    return config
  })

  if (enableScreenShare) {
    config = withPlugins(config, [
      withIosScreenCapture,
      withIosBroadcastExtension,
    ]);
  }

  return config;
};

module.exports = createRunOncePlugin(
  withDaily,
  'withDaily',
  '0.0.1'
);
