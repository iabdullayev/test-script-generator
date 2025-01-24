const ImageProcessingService = require('./imageProcessingService');
const AIGenerationService = require('./aiGenerationService');
const { scriptTemplates } = require('../../../scriptTemplates');

class TestScriptService {
    constructor() {
        this.imageProcessor = ImageProcessingService;
        this.aiService = AIGenerationService;
    }

    async generateScript(screenshotPath, useCase = '', framework = '', pattern = '', predefinedElements = null) {
        try {
            let elements = [];

            if (predefinedElements) {
                console.log('Using predefined elements:', predefinedElements);
                elements = typeof predefinedElements === 'string' ? 
                    JSON.parse(predefinedElements) : predefinedElements;
            } else if (screenshotPath) {
                console.log('Analyzing screenshot for elements');
                elements = await this.imageProcessor.analyzeScreenshot(screenshotPath);
            }

            if (!elements || elements.length === 0) {
                throw new Error('No UI elements detected. Please check your input or define elements manually.');
            }

            console.log('Elements for script generation:', elements);

            // Generate the script
            const generatedScript = await this.aiService.generateTestScript(
                elements, 
                useCase, 
                framework,
                pattern
            );

            // Get script template
            const templateScript = this.getPatternTemplate(framework, pattern);

            // Return the combined script
            return this.combineScripts(templateScript, generatedScript);
        } catch (error) {
            console.error('Error in script generation:', error);
            throw error;
        }
    }

    getPatternTemplate(framework, pattern) {
        try {
            if (!scriptTemplates) {
                console.warn('scriptTemplates is not properly imported');
                return '';
            }

            if (!scriptTemplates[framework]) {
                console.warn(`No templates found for framework: ${framework}`);
                return '';
            }

            if (!scriptTemplates[framework][pattern]) {
                console.warn(`Pattern '${pattern}' not found for framework '${framework}'`);
                return '';
            }

            return scriptTemplates[framework][pattern].example || '';
        } catch (error) {
            console.error('Error getting pattern template:', error);
            return '';
        }
    }

    combineScripts(template, generated) {
        if (!template) {
            return generated;
        }

        return `// Template Pattern:
${template}

// Generated Implementation:
${generated}`;
    }
}

module.exports = new TestScriptService();