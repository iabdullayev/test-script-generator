const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

async function explainErrorAndSuggestFix(errorLog, partialScript) {
  const prompt = `
Here is a test script snippet:
${partialScript}

It produced this error:
${errorLog}

Analyze the failure. Explain in detail what likely went wrong and suggest an updated script or fix.
`;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(prompt);
  return response.response.text();
}

module.exports = { explainErrorAndSuggestFix };