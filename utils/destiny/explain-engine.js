// utils/destiny/explain-engine.js
// Engine to interpret kline data and produce textual explanations
const { templateSignal } = require('./explain-template');
const { adjustTone } = require('./tone-adjust');

function explain(candles) {
  // placeholder: analyze candles and return explanation string
  if (!candles || candles.length === 0) return 'No data';
  const r = templateSignal('SampleSignal', 'Example explanation');
  return adjustTone(r, 'informative');
}
module.exports = { explain };
