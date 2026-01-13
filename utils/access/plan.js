// utils/access/plan.js
// Access plan utilities / feature gating
function hasPlan(user, planName) {
  // placeholder: determine if user has plan
  return (user && user.plan === planName);
}
module.exports = { hasPlan };
