"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withAppBuildGradleModified = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, async (file) => {
        const modResults = file.modResults;
        modResults.contents = modResults.contents + '\nandroid.packagingOptions.jniLibs.useLegacyPackaging = true\n';
        return file;
    });
};
const withDaily = (config) => {
    // Fixing the issue from Expo with Hermes
    // https://github.com/expo/expo/issues/17450
    config = withAppBuildGradleModified(config);
    // Android
    config = config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        "android.permission.FOREGROUND_SERVICE",
    ]);
    config = (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        const application = config_plugins_1.AndroidConfig.Manifest.getMainApplication(config.modResults);
        if (application && !application?.service) {
            application.service = [];
        }
        application?.service?.push({
            $: { "android:name": "com.daily.reactlibrary.DailyOngoingMeetingForegroundService" },
        });
        return config;
    });
    return config;
};
module.exports = (0, config_plugins_1.createRunOncePlugin)(withDaily, 'withDaily', '0.0.1');
