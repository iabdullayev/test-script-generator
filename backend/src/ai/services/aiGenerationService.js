const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIGenerationService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('AI API key is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // Framework-specific configurations
        this.frameworkConfigs = {
            XCUITest: {
                elementMapping: {
                    button: 'app.buttons["{identifier}"]',
                    textField: 'app.textFields["{identifier}"]',
                    staticText: 'app.staticTexts["{identifier}"]'
                },
                assertions: {
                    exists: 'XCTAssertTrue({element}.exists)',
                    notExists: 'XCTAssertFalse({element}.exists)',
                    enabled: 'XCTAssertTrue({element}.isEnabled)'
                },
                template: `import XCTest

class {className}: XCTestCase {
    let app = XCUIApplication()
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }
}`
            },
            Espresso: {
                elementMapping: {
                    button: 'onView(withId(R.id.{identifier}))',
                    textField: 'onView(withId(R.id.{identifier}))',
                    staticText: 'onView(withId(R.id.{identifier}))'
                },
                assertions: {
                    exists: '{element}.check(matches(isDisplayed()))',
                    notExists: '{element}.check(matches(not(isDisplayed())))',
                    enabled: '{element}.check(matches(isEnabled()))'
                },
                template: `@RunWith(AndroidJUnit4.class)
public class {className} {
    @Rule
    public ActivityScenarioRule<MainActivity> activityRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Before
    public void setUp() {
        // Setup code
    }
}`
            },
            Playwright: {
                elementMapping: {
                    button: 'page.locator("[data-testid={identifier}]")',
                    textField: 'page.locator("[data-testid={identifier}]")',
                    staticText: 'page.locator("[data-testid={identifier}]")'
                },
                assertions: {
                    exists: 'await expect({element}).toBeVisible()',
                    notExists: 'await expect({element}).toBeHidden()',
                    enabled: 'await expect({element}).toBeEnabled()'
                },
                template: `import { test, expect } from '@playwright/test';

test.describe('{className}', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(baseUrl);
    });
});`
            }
        };
    }

    async generateContent(prompt) {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }

    async generateTestScript(elements, useCase, framework, pattern) {
        const prompt = this.constructPrompt(elements, useCase, framework, pattern);
        return this.generateContent(prompt);
    }

    constructPrompt(elements, useCase, framework, pattern) {
        const frameworkConfig = this.frameworkConfigs[framework];
        const elementsList = this.formatElements(elements, framework);
        const elementTypes = this.analyzeElementTypes(elements);
        const suggestedFlows = this.suggestTestFlows(elements, useCase);
        const frameworkSpecifics = this.getFrameworkSpecifics(framework, pattern);

        return `
You are an expert test automation engineer. Generate a ${framework} test script following the ${pattern} pattern.

TEST CONTEXT:
1. Available UI Elements:
${elementsList}

2. Element Types Present:
${elementTypes}

3. Use Case to Test:
${useCase}

4. Suggested Test Flows:
${suggestedFlows}

FRAMEWORK-SPECIFIC REQUIREMENTS:
${frameworkSpecifics}

TECHNICAL REQUIREMENTS:
1. Follow these ${framework} best practices:
${this.getFrameworkBestPractices(framework)}

2. Code Structure:
- Use proper element selectors for ${framework}
- Include appropriate waits/synchronization
- Add meaningful assertions
- Handle setup/teardown correctly
- Use framework-specific utilities
- Follow naming conventions

3. Test Organization:
- Group related tests logically
- Use clear test method names
- Include proper validation points
- Handle test data appropriately

Base your implementation on this template:
${frameworkConfig.template}

Generate production-ready test code that follows ${framework} conventions and best practices.
Important: Generate only the code without any explanation or additional comments outside the code.`;
    }

    getFrameworkBestPractices(framework) {
        const practices = {
            XCUITest: [
                "- Use proper XCTest assertions",
                "- Handle app launch in setUp",
                "- Use proper element queries",
                "- Handle element waits properly",
                "- Use proper test method naming"
            ],
            Espresso: [
                "- Use ViewMatchers and ViewActions",
                "- Handle IdlingResources",
                "- Use proper test annotations",
                "- Handle activity scenarios",
                "- Use hamcrest matchers"
            ],
            Playwright: [
                "- Use async/await properly",
                "- Handle page objects",
                "- Use proper selectors",
                "- Handle network conditions",
                "- Use proper test fixtures"
            ]
        };

        return practices[framework].join('\n');
    }

    getFrameworkSpecifics(framework, pattern) {
        const specifics = {
            XCUITest: {
                standardXCTest: "- Use direct XCUIElement interactions\n- Include proper element queries\n- Use XCTAssert methods",
                chainedPageObject: "- Implement chainable methods\n- Use @discardableResult\n- Return self or next page"
            },
            Espresso: {
                standardEspresso: "- Use ViewMatchers and ViewActions\n- Include espresso assertions\n- Handle view hierarchies",
                robotPattern: "- Implement robot methods\n- Include check methods\n- Use screen classes"
            },
            Playwright: {
                pageObjectModel: "- Implement page classes\n- Use proper locators\n- Handle async operations",
                fixtureBasedTests: "- Use test fixtures\n- Handle test context\n- Implement beforeEach hooks"
            }
        };

        return specifics[framework][pattern] || "Follow standard framework conventions";
    }

    formatElements(elements, framework) {
        const config = this.frameworkConfigs[framework];
        if (!Array.isArray(elements) || !config) return '';
        
        return elements.map(el => {
            const selector = config.elementMapping[el.type]
                ?.replace('{identifier}', el.identifier) || 'Unknown selector';
            
            return `- ${el.type}: "${el.name}"
  Identifier: "${el.identifier}"
  Selector: ${selector}
  Purpose: ${this.inferElementPurpose(el)}`;
        }).join('\n');
    }

    analyzeElementTypes(elements) {
        if (!Array.isArray(elements)) return '';

        const typeGroups = elements.reduce((acc, el) => {
            acc[el.type] = (acc[el.type] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(typeGroups)
            .map(([type, count]) => {
                let recommendation = '';
                switch(type) {
                    case 'button':
                        recommendation = 'Include tap/click validations';
                        break;
                    case 'textField':
                        recommendation = 'Include input validation and error cases';
                        break;
                    case 'staticText':
                        recommendation = 'Include text content verification';
                        break;
                    default:
                        recommendation = 'Include existence checks';
                }
                return `- ${count} ${type}(s) - ${recommendation}`;
            })
            .join('\n');
    }

    inferElementPurpose(element) {
        const nameLower = element.name.toLowerCase();
        const identifierLower = element.identifier.toLowerCase();

        const patterns = {
            authentication: {
                keywords: ['login', 'signin', 'signup', 'password', 'username'],
                testSuggestion: 'Test authentication flow and validation'
            },
            navigation: {
                keywords: ['menu', 'nav', 'back', 'next', 'previous', 'tab'],
                testSuggestion: 'Test navigation flow and state changes'
            },
            data_entry: {
                keywords: ['input', 'field', 'form', 'txt', 'enter', 'type'],
                testSuggestion: 'Test input validation and form submission'
            },
            action: {
                keywords: ['submit', 'save', 'delete', 'add', 'create', 'update', 'btn'],
                testSuggestion: 'Test action completion and response'
            },
            validation: {
                keywords: ['error', 'success', 'warning', 'message', 'status', 'label'],
                testSuggestion: 'Test feedback display and validation'
            },
            selection: {
                keywords: ['select', 'choose', 'pick', 'option', 'dropdown', 'list'],
                testSuggestion: 'Test selection behavior and state'
            }
        };

        for (const [purpose, config] of Object.entries(patterns)) {
            if (config.keywords.some(keyword => 
                nameLower.includes(keyword) || identifierLower.includes(keyword)
            )) {
                return `${purpose} - ${config.testSuggestion}`;
            }
        }

        return 'general interaction - Test basic functionality';
    }

    suggestTestFlows(elements, useCase) {
        if (!Array.isArray(elements)) return '';

        const elementTypes = new Set(elements.map(e => e.type));
        const elementPurposes = new Set(elements.map(e => this.inferElementPurpose(e).split(' - ')[0]));
        
        const flows = [];

        // Basic flows for all tests
        flows.push('- Basic element existence validation');
        flows.push('- Screen loading and initial state verification');

        // Input-specific flows
        if (elementTypes.has('textField')) {
            flows.push('- Input field validation:');
            flows.push('  * Valid input cases');
            flows.push('  * Invalid input cases');
            flows.push('  * Empty field validation');
            flows.push('  * Maximum length validation');
        }

        // Button-specific flows
        if (elementTypes.has('button')) {
            flows.push('- Button interaction flows:');
            flows.push('  * Button state validation (enabled/disabled)');
            flows.push('  * Button tap response verification');
        }

        // Authentication flows
        if (elementPurposes.has('authentication')) {
            flows.push('- Authentication flows:');
            flows.push('  * Successful login/signup');
            flows.push('  * Failed authentication handling');
            flows.push('  * Error message validation');
        }

        // Navigation flows
        if (elementPurposes.has('navigation')) {
            flows.push('- Navigation flows:');
            flows.push('  * Navigation state changes');
            flows.push('  * Back/forward navigation');
            flows.push('  * Navigation history');
        }

        // Form submission flows
        if (elementPurposes.has('data_entry') || elementPurposes.has('action')) {
            flows.push('- Form submission flows:');
            flows.push('  * Successful submission');
            flows.push('  * Validation error handling');
            flows.push('  * Required field checking');
        }

        // Error handling flows
        if (elementTypes.has('staticText')) {
            flows.push('- Error handling and messaging:');
            flows.push('  * Error message display');
            flows.push('  * Success message verification');
            flows.push('  * Message content validation');
        }

        return flows.join('\n');
    }
}

module.exports = new AIGenerationService(process.env.GOOGLE_AI_KEY);