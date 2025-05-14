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

const withIosScreenCapture: ConfigPlugin = (config) => {
  config = withAppEntitlements(config);
  config = withBroadcastEntitlements(config);
  config = withInfoPlistRTC(config);
  return config;
};

const withAppEntitlements: ConfigPlugin = (config) => {
  config = withEntitlementsPlist(config, (config) => {
    const appGroupIdentifier = `group.${config.ios!.bundleIdentifier!}`;
    config.modResults['com.apple.security.application-groups'] = [
      appGroupIdentifier,
    ];
    return config;
  });
  return config;
};

const withBroadcastEntitlements: ConfigPlugin = (config) => {
  return withXcodeProject(config, async (config) => {
    const appGroupIdentifier = `group.${config.ios!.bundleIdentifier!}`;
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

    // create file
    await fs.promises.mkdir(path.dirname(entitlementsPath), {
      recursive: true,
    });
    await fs.promises.writeFile(
      entitlementsPath,
      plist.build(extensionEntitlements)
    );

    // add file to extension group
    const proj = config.modResults;
    const targetUuid = proj.findTargetKey('ScreenCaptureExtension');
    const groupUuid = proj.findPBXGroupKey({ name: 'ScreenCaptureExtension' });

    proj.addFile('ScreenCaptureExtension.entitlements', groupUuid, {
      target: targetUuid,
      lastKnownFileType: 'text.plist.entitlements',
    });

    // update build properties
    proj.updateBuildProperty(
      'CODE_SIGN_ENTITLEMENTS',
      'ScreenCaptureExtension/ScreenCaptureExtension.entitlements',
      null,
      'ScreenCaptureExtension'
    );

    return config;
  });
};

const withInfoPlistRTC: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    const appGroupIdentifier = `group.${config.ios!.bundleIdentifier!}`;
    const extensionBundleIdentifier = `${config.ios!.bundleIdentifier!}.ScreenCaptureExtension`;

    config.modResults['RTCAppGroupIdentifier'] = appGroupIdentifier;
    config.modResults['DailyScreenCaptureExtensionBundleIdentifier'] = extensionBundleIdentifier;

    return config;
  });
};

export default withIosScreenCapture;
