const TestScriptService = require('./services/testScriptService');
const fs = require('fs');

if (!process.env.GOOGLE_AI_KEY) {
    console.warn('Warning: Google AI API key is not set. AI-based script generation will be unavailable.');
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
        if (screenshotPath) {
            try {
                await fs.promises.access(screenshotPath);
            } catch {
                throw new Error(`Screenshot file not found at path: ${screenshotPath}`);
            }
        }

        // Validate framework
        if (framework && !['XCUITest', 'Espresso', 'Playwright'].includes(framework)) {
            throw new Error(`Unsupported framework: ${framework}`);
        }

        // Generate script using TestScriptService
        let elements = predefinedElements;
        if (typeof predefinedElements === 'string') {
            try {
                elements = JSON.parse(predefinedElements);
            } catch (error) {
                console.warn('Warning: Failed to parse predefinedElements, using raw input.', error);
            }
        }
        const script = await TestScriptService.generateScript(
            screenshotPath,
            useCase,
            framework,
            pattern,
            elements
        );

        // Clean up screenshot file if it was temporary
        if (screenshotPath && screenshotPath.includes('uploads/')) {
            fs.promises.unlink(screenshotPath)
                .catch(error => console.warn('Warning: Could not delete temporary screenshot file:', error));
        }

        return script;
    } catch (error) {
        console.error('Error in AI script generation:', error);
        throw new Error(`Failed to generate script: ${error.message}`);
    }
}

module.exports = { generateAIScript };