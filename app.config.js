// app.config.js — extends app.json and applies Expo config plugins.
// This file takes precedence over app.json when both exist.

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    // Fixes AppDelegate.swift to use RCTBundleURLProvider (dynamic) instead
    // of a hardcoded Metro IP, so the app always connects to the correct dev server.
    './plugins/withDynamicBundleURL',
  ],
});
