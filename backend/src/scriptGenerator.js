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
    console.error('Error in script generation:', error);
    throw new Error('Failed to generate script: ' + error.message);
  }
}

function addAccessibilityIdentifiers(script, framework, accessibilityId) {
  switch (framework) {
    case 'XCUITest':
      return script.replace(
        /app\.buttons\["([^"]+)"\]/g,
        `app.buttons["${accessibilityId}"]`
      );
    
    case 'Espresso':
      return script.replace(
        /onView\(withId\(R\.id\.[^)]+\)\)/g,
        `onView(withId(R.id.${accessibilityId}))`
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