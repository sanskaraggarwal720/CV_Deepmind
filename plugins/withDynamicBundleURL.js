const { withAppDelegate } = require('@expo/config-plugins');

/**
 * Config plugin that fixes the AppDelegate.swift to use RCTBundleURLProvider
 * for dynamic Metro URL resolution instead of a hardcoded IP address.
 *
 * This is the proper Expo mechanism (withAppDelegate) to modify native iOS code.
 * It runs during `expo prebuild` and `expo run:ios`.
 */
const withDynamicBundleURL = (config) => {
  return withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // Match the bundleURL() function whether it has a hardcoded URL or already correct
    const hardcodedUrlRegex =
      /(override func bundleURL\(\) -> URL\? \{[\s\S]*?#if DEBUG\s*\n\s*)return URL\(string:.*?\)([\s\S]*?#else[\s\S]*?#endif\s*\n\s*\})/;

    if (hardcodedUrlRegex.test(contents)) {
      contents = contents.replace(
        hardcodedUrlRegex,
        '$1return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")$2'
      );
      console.log('[withDynamicBundleURL] Replaced hardcoded Metro URL with RCTBundleURLProvider.');
    } else if (contents.includes('RCTBundleURLProvider')) {
      console.log('[withDynamicBundleURL] AppDelegate already uses RCTBundleURLProvider. No changes needed.');
    } else {
      console.warn('[withDynamicBundleURL] Could not find bundleURL() pattern to replace. Manual check required.');
    }

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withDynamicBundleURL;
