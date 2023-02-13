"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
//import { IOSPermissionsProps, withPermissions } from "./withPermissions";
const withAppBuildGradleModified = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, async (file) => {
        const modResults = file.modResults;
        modResults.contents = modResults.contents + '\nandroid.packagingOptions.jniLibs.useLegacyPackaging = true\n';
        return file;
    });
};
module.exports = (0, config_plugins_1.createRunOncePlugin)(withAppBuildGradleModified, 'withAppBuildGradleMOdified', '1.0.0');
//export default createRunOncePlugin(withDaily, pkg.name, pkg.version);
