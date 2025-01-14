const vision = require('@google-cloud/vision');

async function testVisionCredentials() {
  try {
    const client = new vision.ImageAnnotatorClient();
    console.log('Successfully initialized Vision client');
    return true;
  } catch (error) {
    console.error('Error initializing Vision client:', error);
    return false;
  }
}

module.exports = { testVisionCredentials };