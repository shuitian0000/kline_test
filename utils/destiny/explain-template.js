// utils/destiny/explain-template.js
// Templates for explaining kline patterns or signals
function templateSignal(signalName, details) {
  return `${signalName}: ${details}`;
}
module.exports = { templateSignal };
