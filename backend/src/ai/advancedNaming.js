const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GOOGLE_AI_KEY) {
  throw new Error('Google AI API key is required');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

/**
 * Gets an enhanced, semantic name for a UI element based on its properties
 */
async function getAIEnhancedName(text, context = {}) {
  const { type, bounds, rawText } = context;
  
  const prompt = `
As a UI test automation expert, analyze this UI element and generate a semantic camelCase identifier:

Element Text: "${rawText}"
Element Type: ${type}
${bounds ? `Position: x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height}` : ''}

Guidelines:
- Create a descriptive name that reflects the element's purpose
- Use camelCase format
- Add appropriate suffix based on type:
  * Button -> Btn
  * TextField -> Field
  * StaticText -> Label
- Keep meaningful numbers if they're part of identifiers
- Make names clear and maintainable
- Don't use generic names like "button1"
- Keep names concise but descriptive

Examples:
"Sign In" (button) -> signInBtn
"Email Address" (textfield) -> emailAddressField
"Welcome back!" (text) -> welcomeMessageLabel
"Items (3)" (text) -> itemCountLabel
"←" (button) -> backBtn
"👁" (button) -> visibilityBtn

Return only the camelCase identifier, no explanation.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const response = await model.generateContent(prompt);
    const aiName = response.response.text().trim();

    // Validate the generated name
    if (!aiName || aiName.includes(' ') || !isValidIdentifier(aiName)) {
      console.warn('Invalid AI-generated name:', aiName);
      return generateFallbackName(text, type);
    }

    return aiName;
  } catch (error) {
    console.error('AI naming error:', error);
    return generateFallbackName(text, type);
  }
}

function isValidIdentifier(name) {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(name);
}

function generateFallbackName(text, type) {
  const cleanText = text
    .replace(/[^\w\s-]/g, '')
    .split(/[\s-]+/)
    .filter(word => word.length > 0)
    .map((word, i) => i === 0 ? word.toLowerCase() : capitalize(word))
    .join('');

  const suffix = type === 'button' ? 'Btn' : 
                type === 'textField' ? 'Field' : 'Label';

  return cleanText + suffix;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = { getAIEnhancedName };