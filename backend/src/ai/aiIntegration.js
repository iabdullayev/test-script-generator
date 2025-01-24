const TestScriptService = require('./services/testScriptService');
const fs = require('fs');

if (!process.env.GOOGLE_AI_KEY) {
    console.error('Google AI API key is not set in environment variables');
    process.exit(1);
}

/**
 * Generates an automated test script based on screenshot analysis or predefined elements
 * 
 * @param {string} screenshotPath - Path to the screenshot file
 * @param {string} useCase - Description of the test case
 * @param {string} framework - Test framework (XCUITest/Espresso/Playwright)
 * @param {string} pattern - Design pattern template to use
 * @param {object|string|null} predefinedElements - Optional predefined UI elements
 * @returns {Promise<string>} Generated test script
 */
async function generateAIScript(screenshotPath, useCase = '', framework = '', pattern = '', predefinedElements = null) {
    try {
        // Validate screenshot path if provided
        if (screenshotPath && !fs.existsSync(screenshotPath)) {
            throw new Error(`Screenshot file not found at path: ${screenshotPath}`);
        }

        // Validate framework
        if (framework && !['XCUITest', 'Espresso', 'Playwright'].includes(framework)) {
            throw new Error(`Unsupported framework: ${framework}`);
        }

        // Generate script using TestScriptService
        const script = await TestScriptService.generateScript(
            screenshotPath,
            useCase,
            framework,
            pattern,
            predefinedElements
        );

        // Clean up screenshot file if it was temporary
        if (screenshotPath && screenshotPath.includes('uploads/')) {
            try {
                fs.unlinkSync(screenshotPath);
            } catch (error) {
                console.warn('Warning: Could not delete temporary screenshot file:', error);
            }
        }

        return script;
    } catch (error) {
        console.error('Error in AI script generation:', error);
        throw new Error(`Failed to generate script: ${error.message}`);
    }
}

module.exports = { generateAIScript };