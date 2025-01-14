const vision = require('@google-cloud/vision');
const visionClient = new vision.ImageAnnotatorClient();

async function compareScreenshots(pathA, pathB) {
  // High-level approach:
  // 1. analyzeScreenshot(pathA) -> elementsA
  // 2. analyzeScreenshot(pathB) -> elementsB
  // 3. Compare bounding boxes, text
  // 4. Return array of changed/new/removed elements

  const elementsA = await analyzeScreenshot(pathA);
  const elementsB = await analyzeScreenshot(pathB);

  // very naive approach: check if text in A is absent in B, etc.
  const removed = elementsA.filter(a => !elementsB.some(b => b.text === a.text));
  const added = elementsB.filter(b => !elementsA.some(a => a.text === b.text));

  return { removed, added };
}

module.exports = { compareScreenshots };