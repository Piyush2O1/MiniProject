const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;

async function connectToDatabase(mongoUri) {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    mongoose.set('strictQuery', true);
    cachedPromise = mongoose.connect(mongoUri);
  }

  cachedConnection = await cachedPromise;
  return cachedConnection;
}

module.exports = { connectToDatabase };
