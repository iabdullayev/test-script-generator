const vision = require('@google-cloud/vision');
const fs = require('fs');

class ImageProcessingService {
    constructor() {
        this.visionClient = new vision.ImageAnnotatorClient();
    }

    async analyzeScreenshot(screenshotPath) {
        try {
            const imageContent = fs.readFileSync(screenshotPath);
            
            const [result] = await this.visionClient.annotateImage({
                image: { content: imageContent },
                features: [
                    { type: 'TEXT_DETECTION' },
                    { type: 'OBJECT_LOCALIZATION' },
                    { type: 'IMAGE_PROPERTIES' }
                ]
            });
            
            return this.processInteractiveElements(result);
        } catch (error) {
            console.error('Error analyzing screenshot:', error);
            throw error;
        }
    }

    processInteractiveElements(result) {
        const elements = [];
        const textElements = result.textAnnotations || [];
        const imageProperties = result.imagePropertiesAnnotation;
        const objects = result.localizedObjectAnnotations || [];

        // Skip the first element as it contains all text
        for (let i = 1; i < textElements.length; i++) {
            const text = textElements[i];
            const visualInfo = this.analyzeVisualContext(text, imageProperties, objects);

            if (this.isSignificantElement(text, visualInfo)) {
                const elementInfo = this.classifyElement(text, visualInfo);
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

        return this.filterDuplicateElements(elements);
    }

    analyzeVisualContext(textElement, imageProperties, objects) {
        const bounds = textElement.boundingPoly.vertices;
        const area = this.getElementArea(bounds);

        return {
            hasDistinctBackground: this.hasContrastingBackground(area, imageProperties),
            isInButtonLikeObject: this.isWithinInteractiveObject(bounds, objects),
            hasStandardButtonSize: this.isStandardInteractiveSize(bounds),
            isAlignedWithOthers: this.checkAlignment(bounds, objects),
            position: this.determineScreenPosition(bounds)
        };
    }

    isSignificantElement(textElement, visualInfo) {
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
        return this.isInteractiveTextPattern(text);
    }

    classifyElement(textElement, visualInfo) {
        const text = textElement.description;
        
        if (this.isButtonLike(text, visualInfo)) {
            return {
                type: 'button',
                caseName: this.formatElementName(text, 'Btn')
            };
        } else if (this.isInputLike(text, visualInfo)) {
            return {
                type: 'textField',
                caseName: this.formatElementName(text, 'Txt')
            };
        } else if (this.isSignificantLabel(text, visualInfo)) {
            return {
                type: 'staticText',
                caseName: this.formatElementName(text, 'Lbl')
            };
        }

        return null;
    }

    isButtonLike(text, visualInfo) {
        const lowercaseText = text.toLowerCase();
        
        return (
            visualInfo.hasDistinctBackground ||
            visualInfo.isInButtonLikeObject ||
            lowercaseText.match(/^(send|build|create|edit|ok|cancel|learn|more)(\s|$)/i) ||
            (visualInfo.hasStandardButtonSize && visualInfo.isAlignedWithOthers)
        );
    }

    isInputLike(text, visualInfo) {
        const lowercaseText = text.toLowerCase();
        
        return (
            lowercaseText.match(/input|field|enter|type|email|password|search/i) ||
            (visualInfo.position === 'form-area' && !visualInfo.hasDistinctBackground)
        );
    }

    isSignificantLabel(text, visualInfo) {
        return (
            visualInfo.position === 'header' ||
            text.length > 3 && !this.isButtonLike(text, visualInfo) && !this.isInputLike(text, visualInfo)
        );
    }

    formatElementName(text, suffix) {
        return text
            .replace(/[^\w\s-]/g, '')
            .split(/[-\s]+/)
            .map((word, index) => 
                index === 0 ? word.toLowerCase() : 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join('') + suffix;
    }

    getElementArea(bounds) {
        return {
            x: bounds[0].x,
            y: bounds[0].y,
            width: bounds[2].x - bounds[0].x,
            height: bounds[2].y - bounds[0].y
        };
    }

    hasContrastingBackground(area, imageProperties) {
        // Implement contrast analysis based on imageProperties
        return true;
    }

    isWithinInteractiveObject(bounds, objects) {
        return objects.some(obj => this.isWithinBounds(bounds, obj.boundingPoly.normalizedVertices));
    }

    isStandardInteractiveSize(bounds) {
        const area = this.getElementArea(bounds);
        return area.height >= 32 && area.height <= 48;
    }

    checkAlignment(bounds, objects) {
        // Implement alignment detection logic
        return true;
    }

    determineScreenPosition(bounds) {
        const y = bounds[0].y;
        if (y < 100) return 'header';
        if (y > 800) return 'footer';
        return 'content';
    }

    isWithinBounds(elementBounds, containerBounds) {
        return elementBounds[0].x >= containerBounds[0].x &&
               elementBounds[0].y >= containerBounds[0].y &&
               elementBounds[2].x <= containerBounds[2].x &&
               elementBounds[2].y <= containerBounds[2].y;
    }

    filterDuplicateElements(elements) {
        return elements.filter((el, index, self) =>
            index === self.findIndex(e => 
                e.text === el.text &&
                Math.abs(e.bounds[0].y - el.bounds[0].y) < 5
            )
        );
    }

    isInteractiveTextPattern(text) {
        const lowercaseText = text.toLowerCase();
        
        const patterns = [
            /submit|send|save|cancel|delete|edit|update|create|add|remove|sign|log|click/,
            /^ok$|^yes$|^no$|^back$/,
            /continue|proceed|next|previous|prev|begin|start|end|finish/,
            /\bgo\b|\bview\b|\bshow\b|\bhide\b|\bclose\b|\bopen\b/,
            /\blogin\b|\blogout\b|\bregister\b|\bsignup\b|\bsignin\b/,
            /username|password|email|search|query|phone|address|name|message/,
            /enter\s|type\s|input\s|fill/,
            /field|box|form/,
            /learn more|read more|see more|view more|details/,
            /menu|navigation|nav|home|about|contact|help|support/
        ];
        
        return patterns.some(pattern => pattern.test(lowercaseText));
    }
}

module.exports = new ImageProcessingService();