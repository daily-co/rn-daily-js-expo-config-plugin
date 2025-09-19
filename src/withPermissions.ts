import { type ConfigPlugin, withInfoPlist } from "@expo/config-plugins";
import { AndroidConfig } from "@expo/config-plugins";

const CAMERA_USAGE = "Allow $(PRODUCT_NAME) to access your camera";
const MICROPHONE_USAGE = "Allow $(PRODUCT_NAME) to access your microphone";

export type DailyPermissionsProps = {
    enableScreenShare?: boolean;
    enableCamera?: boolean;
    enableMicrophone?: boolean;
    cameraPermission?: string;
    microphonePermission?: string;
};

export const withPermissions: ConfigPlugin<DailyPermissionsProps> = (
    config,
    props = {},
) => {
    const {
        enableCamera = true,
        enableMicrophone = true,
        enableScreenShare = false,
        cameraPermission,
        microphonePermission,
    } = props;

    // Android permissions list
    const androidPermissions: string[] = [
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.INTERNET",
        "android.permission.WAKE_LOCK",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.FOREGROUND_SERVICE"
    ];

    if (enableCamera) {
        androidPermissions.push(
            "android.permission.CAMERA",
            "android.permission.FOREGROUND_SERVICE_CAMERA"
        );
    }

    if (enableMicrophone) {
        androidPermissions.push(
            "android.permission.RECORD_AUDIO",
            "android.permission.MODIFY_AUDIO_SETTINGS",
            "android.permission.FOREGROUND_SERVICE_MICROPHONE"
        );
    }

    if (enableScreenShare) {
        androidPermissions.push(
            "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION"
        );
    }

    config = AndroidConfig.Permissions.withPermissions(config, androidPermissions);

    // iOS permissions
    return withInfoPlist(config, (config) => {
        if (enableCamera) {
            config.modResults.NSCameraUsageDescription =
                cameraPermission ||
                config.modResults.NSCameraUsageDescription ||
                CAMERA_USAGE;
        }

        if (enableMicrophone) {
            config.modResults.NSMicrophoneUsageDescription =
                microphonePermission ||
                config.modResults.NSMicrophoneUsageDescription ||
                MICROPHONE_USAGE;
        }

        return config;
    });
};
