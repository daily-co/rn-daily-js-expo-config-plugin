import {
  AndroidConfig, ConfigPlugin, createRunOncePlugin, withAppBuildGradle, withAndroidManifest
} from "@expo/config-plugins";

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
    "android.permission.FOREGROUND_SERVICE", "android.permission.FOREGROUND_SERVICE_CAMERA", "android.permission.FOREGROUND_SERVICE_MICROPHONE",
    "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION", "android.permission.POST_NOTIFICATIONS"
  ]);

  config = withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplication(config.modResults);
    if(application && !application?.service){
      application!.service = []
    }
    application?.service?.push({
      $: {
        "android:name":  "com.daily.reactlibrary.DailyOngoingMeetingForegroundService",
        "android:exported": "false",
        // @ts-ignore
        "android:foregroundServiceType": "camera|microphone"
      },
    })
    return config
  })

  return config;
};

module.exports = createRunOncePlugin(
  withDaily,
  'withDaily',
  '0.0.1'
);
