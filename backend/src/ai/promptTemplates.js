const testScriptPrompts = {
  XCUITest: `
Create an XCUITest script that follows these requirements:
1. Implement proper setup and teardown methods
2. Use XCTest assertions appropriately
3. Handle waiting for elements properly
4. Include error handling and timeouts
5. Follow Apple's XCUITest best practices
6. Add comments explaining the test flow
7. Use proper element identification methods

Consider these best practices:
- Use appropriate element queries
- Implement proper test isolation
- Handle application state properly
- Use descriptive test names
`,

  Espresso: `
Create an Espresso test script that follows these requirements:
1. Use proper ViewMatchers and ViewActions
2. Implement proper test rules and annotations
3. Handle view hierarchy traversal properly
4. Include idling resources where needed
5. Follow Android testing best practices
6. Add comments explaining the test flow
7. Use proper assertion methods

Consider these best practices:
- Use hamcrest matchers appropriately
- Handle async operations correctly
- Implement proper test isolation
- Use descriptive test names
`,

  Playwright: `
Create a Playwright test script that follows these requirements:
1. Use proper selectors and locators
2. Implement proper async/await patterns
3. Handle page navigation and loading states
4. Include proper assertions and expectations
5. Follow Playwright best practices
6. Add comments explaining the test flow
7. Use proper testing fixtures

Consider these best practices:
- Use auto-waiting mechanisms properly
- Handle network requests appropriately
- Implement proper test isolation
- Use descriptive test names
`
};

module.exports = { testScriptPrompts };