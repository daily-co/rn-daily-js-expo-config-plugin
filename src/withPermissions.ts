import { type ConfigPlugin, withInfoPlist } from "expo/config-plugins";
import {AndroidConfig} from "@expo/config-plugins";

const CAMERA_USAGE = "Allow $(PRODUCT_NAME) to access your camera";
const MICROPHONE_USAGE = "Allow $(PRODUCT_NAME) to access your microphone";

export type IOSPermissionsProps = {
    cameraPermission?: string;
    microphonePermission?: string;
};

export const withPermissions: ConfigPlugin<IOSPermissionsProps | void> = (
    config,
    props,
) => {

    // Android
    // We are only adding it now inside the app.json, this way allow the users to define which permissions they wish to enable
    //config = AndroidConfig.Permissions.withPermissions(config, [
    //    "android.permission.FOREGROUND_SERVICE", "android.permission.FOREGROUND_SERVICE_CAMERA", "android.permission.FOREGROUND_SERVICE_MICROPHONE",
    //    "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION", "android.permission.POST_NOTIFICATIONS"
    //]);

    //iOS
    return withInfoPlist(config, (config) => {
        const { cameraPermission, microphonePermission } = props || {};

        config.modResults.NSCameraUsageDescription =
            cameraPermission ||
            config.modResults.NSCameraUsageDescription ||
            CAMERA_USAGE;

        config.modResults.NSMicrophoneUsageDescription =
            microphonePermission ||
            config.modResults.NSMicrophoneUsageDescription ||
            MICROPHONE_USAGE;

        return config;
    });
};
