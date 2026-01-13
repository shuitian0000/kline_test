// utils/destiny/kline-generator.js
// Generate synthetic kline data for demos / testing
function generateCandles(count = 100) {
  const candles = [];
  let price = 100;
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = +(open + (Math.random() - 0.5) * 2).toFixed(2);
    const high = Math.max(open, close) + +(Math.random() * 1).toFixed(2);
    const low = Math.min(open, close) - +(Math.random() * 1).toFixed(2);
    const volume = Math.floor(Math.random() * 1000);
    candles.push([open, close, high, low, volume]);
    price = close;
  }
  return candles;
}
module.exports = { generateCandles };
