const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude bcryptjs temp directories that Metro tries to watch but don't exist
const { blockList } = config.resolver;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const bcryptjsTmp = path.join(__dirname, "../../node_modules/.pnpm/bcryptjs@2.4.3/node_modules");
config.resolver.blockList = [
  ...(Array.isArray(blockList) ? blockList : blockList ? [blockList] : []),
  new RegExp("^" + escape(bcryptjsTmp) + "/bcryptjs_tmp_[^/]+/.*"),
];

module.exports = config;
