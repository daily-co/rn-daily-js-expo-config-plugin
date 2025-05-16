import {
    withXcodeProject,
    ConfigPlugin,
    InfoPlist,
    withEntitlementsPlist,
    withInfoPlist,
} from '@expo/config-plugins';
import plist from '@expo/plist';
import * as fs from 'fs';
import * as path from 'path';

// Helper to safely get the bundle identifier
const getBundleIdentifier = (config: Parameters<ConfigPlugin>[0]): string => {
    const bundleId = config.ios?.bundleIdentifier;
    if (!bundleId) {
        throw new Error(
            'iOS bundleIdentifier is required for withIosScreenCapture plugin.'
        );
    }
    return bundleId;
};

/**
 * Main plugin that composes all screen capture iOS modifications.
 */
const withIosScreenCapture: ConfigPlugin = (config) => {
    config = withAppEntitlements(config);
    config = withBroadcastEntitlements(config);
    config = withInfoPlistRTC(config);
    config = withReplaceAppGroup(config);
    return config;
};

/**
 * Adds required App Group entitlement to the main app.
 */
const withAppEntitlements: ConfigPlugin = (config) => {
    return withEntitlementsPlist(config, (config) => {
        const appGroupIdentifier = `group.${getBundleIdentifier(config)}`;
        config.modResults['com.apple.security.application-groups'] = [
            appGroupIdentifier,
        ];
        return config;
    });
};

/**
 * Creates and injects entitlements into the Broadcast Extension.
 */
const withBroadcastEntitlements: ConfigPlugin = (config) => {
    return withXcodeProject(config, async (config) => {
        const bundleId = getBundleIdentifier(config);
        const appGroupIdentifier = `group.${bundleId}`;

        const extensionRootPath = path.join(
            config.modRequest.platformProjectRoot,
            'ScreenCaptureExtension'
        );
        const entitlementsPath = path.join(
            extensionRootPath,
            'ScreenCaptureExtension.entitlements'
        );

        const extensionEntitlements: InfoPlist = {
            'com.apple.security.application-groups': [appGroupIdentifier],
        };

        // Ensure directory exists
        await fs.promises.mkdir(path.dirname(entitlementsPath), {
            recursive: true,
        });
        await fs.promises.writeFile(
            entitlementsPath,
            plist.build(extensionEntitlements)
        );

        // Add file to Xcode project
        const proj = config.modResults;
        const targetUuid = proj.findTargetKey('ScreenCaptureExtension');
        const groupUuid = proj.findPBXGroupKey({name: 'ScreenCaptureExtension'});

        proj.addFile('ScreenCaptureExtension.entitlements', groupUuid, {
            target: targetUuid,
            lastKnownFileType: 'text.plist.entitlements',
        });

        proj.updateBuildProperty(
            'CODE_SIGN_ENTITLEMENTS',
            'ScreenCaptureExtension/ScreenCaptureExtension.entitlements',
            null,
            'ScreenCaptureExtension'
        );

        return config;
    });
};

/**
 * Injects required keys into Info.plist for screen capture.
 */
const withInfoPlistRTC: ConfigPlugin = (config) => {
    return withInfoPlist(config, (config) => {
        const bundleId = getBundleIdentifier(config);
        const appGroupIdentifier = `group.${bundleId}`;
        const extensionBundleIdentifier = `${bundleId}.ScreenCaptureExtension`;

        config.modResults['RTCAppGroupIdentifier'] = appGroupIdentifier;
        config.modResults['DailyScreenCaptureExtensionBundleIdentifier'] =
            extensionBundleIdentifier;

        return config;
    });
};

/**
 * Replaces the app group from the SampleHandler.swift
 */
const withReplaceAppGroup: ConfigPlugin = (config) => {
    return withXcodeProject(config, async (config) => {
        const bundleId = getBundleIdentifier(config);
        const appGroupIdentifier = `group.${bundleId}`;
        const extensionRootPath = path.join(
            config.modRequest.platformProjectRoot,
            'ScreenCaptureExtension'
        );
        // Update app group bundle id in SampleHandler code
        const code = await fs.promises.readFile(
            path.join(extensionRootPath, 'SampleHandler.swift'),
            { encoding: 'utf-8' }
        );
        await fs.promises.writeFile(
            path.join(extensionRootPath, 'SampleHandler.swift'),
            code.replace('group.example.Example', appGroupIdentifier)
        );

        return config;
    });
};

export default withIosScreenCapture;
