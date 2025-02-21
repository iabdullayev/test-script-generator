const { generateAIScript } = require('./ai/aiIntegration');

async function generateScript(screenshot, useCase, framework, accessibilityId = null) {
  try {
    // Generate the AI-powered test script
    let script = await generateAIScript(screenshot, framework, useCase);
    
    // Add accessibility identifiers if provided
    if (accessibilityId) {
      script = addAccessibilityIdentifiers(script, framework, accessibilityId);
    }

    return script;
  } catch (error) {
    console.error('Error generating script:', {
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Script generation failed due to: ${error.message}`);
  }
}

function addAccessibilityIdentifiers(script, framework, accessibilityId) {
  switch (framework) {
    case 'XCUITest':
      return script.replace(
        /app\.buttons\["(.*?)"\]/g,
        (match, p1) => p1 === '' ? `app.buttons["${accessibilityId}"]` : match
      );
    
    case 'Espresso':
      return script.replace(
        /onView\(withId\(R\.id\.([^)]+)\)\)/g, 
        (match, p1) => p1 === '' ? `onView(withId(R.id.${accessibilityId}))` : match
    );
    
    case 'Playwright':
      return script.replace(
        /page\.locator\('([^']+)'\)/g,
        `page.locator('[data-testid="${accessibilityId}"]')`
      );
    
    default:
      return script;
  }
}

module.exports = { generateScript };