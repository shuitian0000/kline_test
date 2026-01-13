// utils/access/capability.js
// Capability checks
function canUseFeature(user, feature) {
  // placeholder logic
  return Boolean(user && user.capabilities && user.capabilities.includes(feature));
}
module.exports = { canUseFeature };
