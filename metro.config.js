const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .db files as assets
config.resolver.assetExts.push('db');

module.exports = config;