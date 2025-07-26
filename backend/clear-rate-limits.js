// Script to clear rate limiting for testing
// This is for development/testing purposes only

const rateLimit = require("express-rate-limit");

// Create a function to reset rate limiters
function createResetableRateLimit(options) {
  const limiter = rateLimit(options);
  
  // Add a reset method
  limiter.resetKey = (key) => {
    if (limiter.store && typeof limiter.store.resetKey === 'function') {
      return limiter.store.resetKey(key);
    }
    console.log('Rate limit store does not support resetKey method');
  };
  
  return limiter;
}

// Example usage:
// const loginLimiter = createResetableRateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 30,
//   message: { message: "Too many login attempts, please try again later" },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

console.log("Rate limit utilities loaded");
console.log("To reset rate limits, restart the server or wait for the time window to expire");

module.exports = { createResetableRateLimit }; 