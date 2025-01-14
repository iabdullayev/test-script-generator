const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

async function suggestAdditionalTests(elements, framework) {
  const elementSummary = elements.map(el => `${el.type}: ${el.text}`).join('\n');
  const prompt = `
Given these UI elements (type + label):
${elementSummary}

Framework: ${framework}

Suggest additional or edge-case tests. 
Think about negative cases, boundary values, and typical user flows.
Return them in a short list format.
`;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(prompt);
  return response.response.text(); 
}

module.exports = { suggestAdditionalTests };