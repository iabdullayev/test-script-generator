const { GoogleGenerativeAI } = require('@google/generative-ai');
const vision = require('@google-cloud/vision');
const fs = require('fs');

if (!process.env.GOOGLE_AI_KEY) {
    console.error('Google AI API key is not set in environment variables');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const visionClient = new vision.ImageAnnotatorClient();

async function generateAIScript(screenshotPath, useCase = '', framework = '', pattern = '', predefinedElements = null) {
    try {
        let elements = [];

        if (predefinedElements) {
            console.log('Using predefined elements:', predefinedElements);
            elements = typeof predefinedElements === 'string' ? 
                JSON.parse(predefinedElements) : predefinedElements;
        } else if (screenshotPath) {
            console.log('Analyzing screenshot for elements');
            elements = await analyzeScreenshot(screenshotPath);
        }

        if (!elements || elements.length === 0) {
            throw new Error('No UI elements detected. Please check your input or define elements manually.');
        }

        console.log('Elements for script generation:', elements);
        const prompt = constructPrompt(elements, useCase, framework);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error in script generation:', error);
        throw error;
    }
}

async function analyzeScreenshot(screenshotPath) {
    try {
        const imageContent = fs.readFileSync(screenshotPath);
        
        const [result] = await visionClient.annotateImage({
            image: { content: imageContent },
            features: [
                { type: 'TEXT_DETECTION' },
                { type: 'OBJECT_LOCALIZATION' },
                { type: 'IMAGE_PROPERTIES' }
            ]
        });

        return processInteractiveElements(result);
    } catch (error) {
        console.error('Error analyzing screenshot:', error);
        throw error;
    }
}

function processInteractiveElements(result) {
    const elements = [];
    const textElements = result.textAnnotations || [];
    const imageProperties = result.imagePropertiesAnnotation;
    const objects = result.localizedObjectAnnotations || [];

    // Skip the first element as it contains all text
    for (let i = 1; i < textElements.length; i++) {
        const text = textElements[i];
        const visualInfo = analyzeVisualContext(text, imageProperties, objects);

        if (isSignificantElement(text, visualInfo)) {
            const elementInfo = classifyElement(text, visualInfo);
            if (elementInfo) {
                elements.push({
                    type: elementInfo.type,
                    text: text.description,
                    caseName: elementInfo.caseName,
                    bounds: text.boundingPoly.vertices,
                    visualProperties: visualInfo
                });
            }
        }
    }

    return filterDuplicateElements(elements);
}

function analyzeVisualContext(textElement, imageProperties, objects) {
    const bounds = textElement.boundingPoly.vertices;
    const area = getElementArea(bounds);

    return {
        hasDistinctBackground: hasContrastingBackground(area, imageProperties),
        isInButtonLikeObject: isWithinInteractiveObject(bounds, objects),
        hasStandardButtonSize: isStandardInteractiveSize(bounds),
        isAlignedWithOthers: checkAlignment(bounds, objects),
        position: determineScreenPosition(bounds)
    };
}

function isSignificantElement(textElement, visualInfo) {
    const text = textElement.description;
    
    // Skip obvious non-interactive elements
    if (text.length <= 1 || /^\d+$/.test(text)) {
        return false;
    }

    // Check for visual indicators of interactivity
    if (visualInfo.hasDistinctBackground || 
        visualInfo.isInButtonLikeObject || 
        visualInfo.hasStandardButtonSize) {
        return true;
    }

    // Check text patterns suggesting interactivity
    return isInteractiveTextPattern(text);
}

function classifyElement(textElement, visualInfo) {
    const text = textElement.description;
    
    // Determine element type based on visual and textual characteristics
    if (isButtonLike(text, visualInfo)) {
        return {
            type: 'button',
            caseName: formatElementName(text, 'Btn')
        };
    } else if (isInputLike(text, visualInfo)) {
        return {
            type: 'textField',
            caseName: formatElementName(text, 'Txt')
        };
    } else if (isSignificantLabel(text, visualInfo)) {
        return {
            type: 'staticText',
            caseName: formatElementName(text, 'Lbl')
        };
    }

    return null;
}

function isButtonLike(text, visualInfo) {
    const lowercaseText = text.toLowerCase();
    
    return (
        visualInfo.hasDistinctBackground ||
        visualInfo.isInButtonLikeObject ||
        lowercaseText.match(/^(send|build|create|edit|ok|cancel|learn|more)(\s|$)/i) ||
        (visualInfo.hasStandardButtonSize && visualInfo.isAlignedWithOthers)
    );
}

function isInputLike(text, visualInfo) {
    const lowercaseText = text.toLowerCase();
    
    return (
        lowercaseText.match(/input|field|enter|type|email|password|search/i) ||
        (visualInfo.position === 'form-area' && !visualInfo.hasDistinctBackground)
    );
}

function isSignificantLabel(text, visualInfo) {
    return (
        visualInfo.position === 'header' ||
        text.length > 3 && !isButtonLike(text, visualInfo) && !isInputLike(text, visualInfo)
    );
}

function formatElementName(text, suffix) {
    return text
        .replace(/[^\w\s-]/g, '')
        .split(/[-\s]+/)
        .map((word, index) => 
            index === 0 ? word.toLowerCase() : 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('') + suffix;
}

function constructPrompt(elements, useCase, framework) {
    const elementsByType = groupElementsByType(elements);
    const pageName = determinePageName(elements) || 'Screen';

    return `
Generate ${framework} automation script for ${pageName} with these UI elements:

${formatElementsForPrompt(elementsByType)}

Use Case: ${useCase}

Follow this exact pattern:

1. View enum:
- Name it ${pageName}View
- Include only essential UI elements
- Use proper element types and identifiers
- Group similar elements together

2. Page class:
- Name it ${pageName}Page
- Include verification methods
- Use @discardableResult for chaining
- Focus on key interactions

3. Test class:
- Include proper setup
- Create meaningful test flows
- Use chained method calls
- Focus on the main user journey

Generate complete, properly structured code using these elements.`;
}

function groupElementsByType(elements) {
    return elements.reduce((acc, el) => {
        if (!acc[el.type]) acc[el.type] = [];
        acc[el.type].push(el);
        return acc;
    }, {});
}

function formatElementsForPrompt(elementsByType) {
    return Object.entries(elementsByType)
        .map(([type, elements]) => 
            `${type}s:\n${elements.map(el => 
                `- "${el.text}" (${el.caseName})`
            ).join('\n')}`
        ).join('\n\n');
}

function determinePageName(elements) {
    // Try to find a page title or significant header
    const headerElements = elements.filter(el => 
        el.visualProperties.position === 'header' ||
        el.text.toLowerCase().includes('page') ||
        el.text.toLowerCase().includes('screen')
    );

    if (headerElements.length > 0) {
        return formatPageName(headerElements[0].text);
    }

    return 'Screen';
}

function formatPageName(text) {
    return text
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

// Helper functions for visual analysis
function getElementArea(bounds) {
    return {
        x: bounds[0].x,
        y: bounds[0].y,
        width: bounds[2].x - bounds[0].x,
        height: bounds[2].y - bounds[0].y
    };
}

function hasContrastingBackground(area, imageProperties) {
    // Analysis of color contrast would go here
    return true;
}

function isWithinInteractiveObject(bounds, objects) {
    // Check if element is within any interactive objects
    return objects.some(obj => isWithinBounds(bounds, obj.boundingPoly.normalizedVertices));
}

function isStandardInteractiveSize(bounds) {
    const area = getElementArea(bounds);
    // Check if element has typical interactive element dimensions
    return area.height >= 32 && area.height <= 48;
}

function checkAlignment(bounds, objects) {
    // Check if element is aligned with other UI elements
    return true;
}

function determineScreenPosition(bounds) {
    const y = bounds[0].y;
    if (y < 100) return 'header';
    if (y > 800) return 'footer';
    return 'content';
}

function isWithinBounds(elementBounds, containerBounds) {
    return elementBounds[0].x >= containerBounds[0].x &&
           elementBounds[0].y >= containerBounds[0].y &&
           elementBounds[2].x <= containerBounds[2].x &&
           elementBounds[2].y <= containerBounds[2].y;
}

function filterDuplicateElements(elements) {
    // Remove duplicate elements based on position and text
    return elements.filter((el, index, self) =>
        index === self.findIndex(e => 
            e.text === el.text &&
            Math.abs(e.bounds[0].y - el.bounds[0].y) < 5
        )
    );
}

function isInteractiveTextPattern(text) {
    // Convert text to lowercase for case-insensitive matching
    const lowercaseText = text.toLowerCase();
    
    // Common interactive element keywords
    const buttonPatterns = [
        /submit|send|save|cancel|delete|edit|update|create|add|remove|sign|log|click/,
        /^ok$|^yes$|^no$|^back$/,
        /continue|proceed|next|previous|prev|begin|start|end|finish/,
        /\bgo\b|\bview\b|\bshow\b|\bhide\b|\bclose\b|\bopen\b/,
        /\blogin\b|\blogout\b|\bregister\b|\bsignup\b|\bsignin\b/
    ];

    // Form input related patterns
    const inputPatterns = [
        /username|password|email|search|query|phone|address|name|message/,
        /enter\s|type\s|input\s|fill/,
        /field|box|form/
    ];

    // Link-like patterns
    const linkPatterns = [
        /learn more|read more|see more|view more|details/,
        /visit|browse|explore|discover/,
        /^more$/,
        /\blink\b/
    ];

    // Navigation patterns
    const navigationPatterns = [
        /menu|navigation|nav|home|about|contact|help|support/,
        /\btab\b|\bpage\b|\bscreen\b/,
        /^main$|^back$/
    ];

    // Check against all patterns
    const allPatterns = [...buttonPatterns, ...inputPatterns, ...linkPatterns, ...navigationPatterns];
    
    // Return true if text matches any of the interactive patterns
    return allPatterns.some(pattern => pattern.test(lowercaseText));
}

module.exports = {
    generateAIScript,
    analyzeScreenshot
};