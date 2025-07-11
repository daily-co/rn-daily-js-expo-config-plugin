import {
  withXcodeProject,
  ConfigPlugin,
  InfoPlist,
  withDangerousMod,
  XcodeProject,
} from '@expo/config-plugins';
import plist from '@expo/plist';
import * as fs from 'fs';
import * as path from 'path';

import { quoted } from './utils';

const EXTENSION_NAME = 'ScreenCaptureExtension';
const IPHONE_DEPLOYMENT_TARGET = '15.1';
const withIosBroadcastExtension: ConfigPlugin = (config) => {
  config = withBroadcastExtensionHandler(config);
  config = withBroadcastExtensionPlist(config);
  config = withBroadcastExtensionXcodeTarget(config);
  return config;
};

const withBroadcastExtensionHandler: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const extensionRootPath = path.join(
        config.modRequest.platformProjectRoot,
        EXTENSION_NAME
      );
      await fs.promises.mkdir(extensionRootPath, { recursive: true });
      await fs.promises.copyFile(
        path.join(__dirname, 'static', 'SampleHandlerTemplate.swift'),
        path.join(extensionRootPath, 'SampleHandler.swift')
      );
      return config;
    },
  ]);
};

const withBroadcastExtensionPlist: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const extensionRootPath = path.join(
        config.modRequest.platformProjectRoot,
        EXTENSION_NAME
      );
      const extensionPlistPath = path.join(extensionRootPath, 'Info.plist');

      const extensionPlist: InfoPlist = {
        NSExtension: {
          NSExtensionPointIdentifier: 'com.apple.broadcast-services-upload',
          NSExtensionPrincipalClass: '$(PRODUCT_MODULE_NAME).SampleHandler',
          RPBroadcastProcessMode: 'RPBroadcastProcessModeSampleBuffer',
        },
      };

      await fs.promises.mkdir(path.dirname(extensionPlistPath), {
        recursive: true,
      });
      await fs.promises.writeFile(
        extensionPlistPath,
        plist.build(extensionPlist)
      );

      return config;
    },
  ]);
};

const withBroadcastExtensionXcodeTarget: ConfigPlugin = (config) => {
  return withXcodeProject(config, async (config) => {
    const appName = config.modRequest.projectName!;
    const extensionName = EXTENSION_NAME;
    const extensionBundleIdentifier = `${config.ios!
      .bundleIdentifier!}.ScreenCaptureExtension`;
    const currentProjectVersion = config.ios!.buildNumber || '1';
    const marketingVersion = config.version!;

    await addBroadcastExtensionXcodeTarget(config.modResults, {
      appName,
      extensionName,
      extensionBundleIdentifier,
      currentProjectVersion,
      marketingVersion,
    });

    return config;
  });
};

type AddXcodeTargetParams = {
  appName: string;
  extensionName: string;
  extensionBundleIdentifier: string;
  currentProjectVersion: string;
  marketingVersion: string;
};

const addBroadcastExtensionXcodeTarget = async (
  proj: XcodeProject,
  {
    appName,
    extensionName,
    extensionBundleIdentifier,
    currentProjectVersion,
    marketingVersion,
  }: AddXcodeTargetParams
) => {
  if (proj.getFirstProject().firstProject.targets?.length > 1) return;

  const targetUuid = proj.generateUuid();
  const groupName = 'Embed App Extensions';

  const xCConfigurationList = addXCConfigurationList(proj, {
    extensionBundleIdentifier,
    currentProjectVersion,
    marketingVersion,
    extensionName,
    appName,
  });

  const productFile = addProductFile(proj, extensionName, groupName);

  const target = addToPbxNativeTargetSection(proj, {
    extensionName,
    targetUuid,
    productFile,
    xCConfigurationList,
  });

  addToPbxProjectSection(proj, target);

  addTargetDependency(proj, target);

  const frameworkFile = proj.addFramework('ReplayKit.framework', {
    target: target.uuid,
    link: false,
  });
  const replayKitFrameworkPath: string = frameworkFile.path;
  console.log(`Added ReplayKit.framework to target ${target.uuid}`);

  const dailyScreenShareFramework = 'Pods/ReactNativeDailyJSScreenShareExtension/ReactNativeDailyJSScreenShareExtension.xcframework';
  const customFrameworkFile = proj.addFramework(dailyScreenShareFramework, {
    target: target.uuid,
    customFramework: true,
    embed: true,
  });
  const dailyScreenShareFrameworkPath: string = customFrameworkFile.path;
  console.log(`Added ReactNativeDailyJSScreenShareExtension.framework to target ${target.uuid}`);

  addBuildPhases(proj, {
    groupName,
    productFile,
    targetUuid,
    frameworkPaths:{
      replayKit: replayKitFrameworkPath,
      dailyScreenShare: dailyScreenShareFrameworkPath
    }
  });

  addPbxGroup(proj, productFile);
};

const addXCConfigurationList = (
  proj: XcodeProject,
  {
    extensionBundleIdentifier,
    currentProjectVersion,
    marketingVersion,
    extensionName,
    appName,
  }: AddXcodeTargetParams
) => {
  const commonBuildSettings: any = {
    CLANG_ANALYZER_NONNULL: 'YES',
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: 'YES_AGGRESSIVE',
    CLANG_CXX_LANGUAGE_STANDARD: quoted('gnu++17'),
    CLANG_ENABLE_OBJC_WEAK: 'YES',
    CLANG_WARN_DOCUMENTATION_COMMENTS: 'YES',
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: 'YES',
    CLANG_WARN_UNGUARDED_AVAILABILITY: 'YES_AGGRESSIVE',
    // CODE_SIGN_ENTITLEMENTS: `${appName}/${appName}.entitlements`,
    CODE_SIGN_STYLE: 'Automatic',
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    GCC_C_LANGUAGE_STANDARD: 'gnu11',
    GENERATE_INFOPLIST_FILE: 'YES',
    INFOPLIST_FILE: `${extensionName}/Info.plist`,
    INFOPLIST_KEY_CFBundleDisplayName: `${extensionName}`,
    INFOPLIST_KEY_NSHumanReadableCopyright: quoted(''),
    IPHONEOS_DEPLOYMENT_TARGET: IPHONE_DEPLOYMENT_TARGET,
    LD_RUNPATH_SEARCH_PATHS: quoted(
      '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks'
    ),
    MARKETING_VERSION: marketingVersion,
    MTL_FAST_MATH: 'YES',
    PRODUCT_BUNDLE_IDENTIFIER: quoted(extensionBundleIdentifier),
    PRODUCT_NAME: quoted('$(TARGET_NAME)'),
    SKIP_INSTALL: 'YES',
    SWIFT_EMIT_LOC_STRINGS: 'YES',
    SWIFT_VERSION: '5.0',
    TARGETED_DEVICE_FAMILY: quoted('1,2'),
  };

  const buildConfigurationsList = [
    {
      name: 'Debug',
      isa: 'XCBuildConfiguration',
      buildSettings: {
        ...commonBuildSettings,
        DEBUG_INFORMATION_FORMAT: 'dwarf',
        MTL_ENABLE_DEBUG_INFO: 'INCLUDE_SOURCE',
        SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG',
        SWIFT_OPTIMIZATION_LEVEL: quoted('-Onone'),
      },
    },
    {
      name: 'Release',
      isa: 'XCBuildConfiguration',
      buildSettings: {
        ...commonBuildSettings,
        COPY_PHASE_STRIP: 'NO',
        DEBUG_INFORMATION_FORMAT: quoted('dwarf-with-dsym'),
        SWIFT_OPTIMIZATION_LEVEL: quoted('-Owholemodule'),
      },
    },
  ];

  const xCConfigurationList = proj.addXCConfigurationList(
    buildConfigurationsList,
    'Release',
    `Build configuration list for PBXNativeTarget ${quoted(extensionName)}`
  );

  console.log(`Added XCConfigurationList ${xCConfigurationList.uuid}`);

  // update other build properties
  proj.updateBuildProperty(
    'ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES',
    'YES',
    null,
    proj.getFirstTarget().firstTarget.name
  );

  proj.updateBuildProperty('IPHONEOS_DEPLOYMENT_TARGET', IPHONE_DEPLOYMENT_TARGET);


  return xCConfigurationList;
};

const addProductFile = (
  proj: XcodeProject,
  extensionName: string,
  groupName: string
) => {
  const productFile = {
    basename: `${extensionName}.appex`,
    fileRef: proj.generateUuid(),
    uuid: proj.generateUuid(),
    group: groupName,
    explicitFileType: 'wrapper.app-extension',
    settings: {
      ATTRIBUTES: ['RemoveHeadersOnCopy'],
    },
    includeInIndex: 0,
    path: `${extensionName}.appex`,
    sourceTree: 'BUILT_PRODUCTS_DIR',
  };

  proj.addToPbxFileReferenceSection(productFile);
  console.log(`Added PBXFileReference: ${productFile.fileRef}`);

  proj.addToPbxBuildFileSection(productFile);
  console.log(`Added PBXBuildFile: ${productFile.fileRef}`);

  return productFile;
};

const addToPbxNativeTargetSection = (
  proj: XcodeProject,
  {
    extensionName,
    targetUuid,
    productFile,
    xCConfigurationList,
  }: {
    extensionName: string;
    targetUuid: string;
    productFile: any;
    xCConfigurationList: any;
  }
) => {
  const target = {
    uuid: targetUuid,
    pbxNativeTarget: {
      isa: 'PBXNativeTarget',
      buildConfigurationList: xCConfigurationList.uuid,
      buildPhases: [],
      buildRules: [],
      dependencies: [],
      name: extensionName,
      productName: extensionName,
      productReference: productFile.fileRef,
      productType: quoted('com.apple.product-type.app-extension'),
    },
  };

  proj.addToPbxNativeTargetSection(target);

  console.log(`Added PBXNativeTarget ${target.uuid}`);

  return target;
};

const addToPbxProjectSection = (proj: XcodeProject, target: any) => {
  proj.addToPbxProjectSection(target);

  console.log(`Added target to pbx project section ${target.uuid}`);

  // Add target attributes to project section
  if (
    !proj.pbxProjectSection()[proj.getFirstProject().uuid].attributes
      .TargetAttributes
  ) {
    proj.pbxProjectSection()[
      proj.getFirstProject().uuid
    ].attributes.TargetAttributes = {};
  }

  proj.pbxProjectSection()[
    proj.getFirstProject().uuid
  ].attributes.LastSwiftUpdateCheck = 1340;

  proj.pbxProjectSection()[
    proj.getFirstProject().uuid
  ].attributes.TargetAttributes[target.uuid] = {
    CreatedOnToolsVersion: '13.4.1',
    ProvisioningStyle: 'Automatic',
  };
};

const addTargetDependency = (proj: XcodeProject, target: any) => {
  if (!proj.hash.project.objects['PBXTargetDependency']) {
    proj.hash.project.objects['PBXTargetDependency'] = {};
  }
  if (!proj.hash.project.objects['PBXContainerItemProxy']) {
    proj.hash.project.objects['PBXContainerItemProxy'] = {};
  }

  proj.addTargetDependency(proj.getFirstTarget().uuid, [target.uuid]);

  console.log(`Added target dependecy for target ${target.uuid}`);
};

type AddBuildPhaseParams = {
  groupName: string;
  productFile: any;
  targetUuid: string;
  frameworkPaths: {
    replayKit: string;
    dailyScreenShare: string;
  };
};

const addBuildPhases = (
    proj: XcodeProject,
  { groupName, productFile, targetUuid, frameworkPaths }: AddBuildPhaseParams
) => {
  const buildPath = quoted('');

  // Sources build phase
  const { uuid: sourcesBuildPhaseUuid } = proj.addBuildPhase(
    [`SampleHandler.swift`],
      'PBXSourcesBuildPhase',
      'Sources',
      targetUuid,
      'app_extension',
      buildPath
  );
  console.log(`Added PBXSourcesBuildPhase ${sourcesBuildPhaseUuid}`);

  // Copy files build phase
  const { uuid: copyFilesBuildPhaseUuid } = proj.addBuildPhase(
      [productFile.path],
      'PBXCopyFilesBuildPhase',
      groupName,
      proj.getFirstTarget().uuid,
      'app_extension',
      buildPath
  );
  console.log(`Added PBXCopyFilesBuildPhase ${copyFilesBuildPhaseUuid}`);

  // Frameworks build phase
  const { uuid: replayKitFrameworksBuildPhaseUuid } = proj.addBuildPhase(
    [frameworkPaths.replayKit],
    'PBXFrameworksBuildPhase',
    'Frameworks',
    targetUuid,
    'app_extension',
    buildPath
  );
  console.log(`Added PBXFrameworksBuildPhase ${replayKitFrameworksBuildPhaseUuid}`);
  const { uuid: dailyFrameworksBuildPhaseUuid } = proj.addBuildPhase(
      [frameworkPaths.dailyScreenShare],
      'PBXCopyFilesBuildPhase',
      'Frameworks',
      targetUuid,
      'app_extension',
      buildPath
  );
  console.log(`Added PBXCopyFilesBuildPhase ${dailyFrameworksBuildPhaseUuid}`);

  // Resources build phase
  const { uuid: resourcesBuildPhaseUuid } = proj.addBuildPhase(
      [],
      'PBXResourcesBuildPhase',
      'Resources',
      targetUuid,
      'app_extension',
      buildPath
  );
  console.log(`Added PBXResourcesBuildPhase ${resourcesBuildPhaseUuid}`);
};

const addPbxGroup = (proj: XcodeProject, productFile: any) => {
  // Add PBX group
  const { uuid: pbxGroupUuid } = proj.addPbxGroup(
    ['SampleHandler.swift', 'Info.plist'],
    EXTENSION_NAME,
    EXTENSION_NAME
  );
  console.log(`Added PBXGroup ${pbxGroupUuid}`);

  // Add PBXGroup to top level group
  const groups = proj.hash.project.objects['PBXGroup'];
  if (pbxGroupUuid) {
    Object.keys(groups).forEach(function (key) {
      if (groups[key].name === undefined && groups[key].path === undefined) {
        proj.addToPbxGroup(pbxGroupUuid, key);
        console.log(
          `Added PBXGroup ${pbxGroupUuid} root PBXGroup group ${key}`
        );
      } else if (groups[key].name === 'Products') {
        proj.addToPbxGroup(productFile, key);
        console.log(`Added ScreenCaptureExtension.apex to Products PBXGroup`);
      }
    });
  }
};

export default withIosBroadcastExtension;
