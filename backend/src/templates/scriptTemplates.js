const scriptTemplates = {
  XCUITest: {
    chainedPageObject: {
      name: "Chained Page Object Pattern",
      example: `
func testSwitchToListView() {
    app.launch()
    signUpPage
        .tapLogin()
        .login(userName: userName, password: password)
        .dismissOverlay()
        .navigateToSideMenu()
        .navigateToLibrary()
        .switchToListView()
}

@discardableResult func tapLogin() -> LoginPage {
    let logInLnk = SignupPageView.logInLnk.element
    XCTAssertTrue(logInLnk.exists, "Login link/button does not exist on the screen")
    logInLnk.tap()
    return LoginPage(testCase: testCase)
}`,
      description: "Uses chained method calls with page objects, returning self for fluent interface"
    },
    standardXCTest: {
      name: "Standard XCTest Pattern",
      example: `
class LoginTests: XCTestCase {
    func testLogin() {
        let app = XCUIApplication()
        app.launch()
        
        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.exists)
        loginButton.tap()
    }
}`,
      description: "Traditional XCTest style with direct UI element interactions"
    }
  },
  Espresso: {
    robotPattern: {
      name: "Robot Pattern",
      example: `
@Test
fun testLogin() {
    loginRobot {
        enterUsername("user")
        enterPassword("pass")
        clickLogin()
    } verify {
        isHomeScreenVisible()
    }
}`,
      description: "Uses Robot Pattern for better readability and maintenance"
    },
    standardEspresso: {
      name: "Standard Espresso",
      example: `
@Test
public void testLogin() {
    onView(withId(R.id.username))
        .perform(typeText("username"));
    onView(withId(R.id.password))
        .perform(typeText("password"));
    onView(withId(R.id.login))
        .perform(click());
}`,
      description: "Traditional Espresso style with ViewMatchers and ViewActions"
    }
  },
  Playwright: {
    pageObjectModel: {
      name: "Page Object Model",
      example: `
class LoginPage {
    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        return new HomePage(this.page);
    }
}

test('user can login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = await loginPage.login('user', 'pass');
    await expect(homePage.welcome).toBeVisible();
});`,
      description: "Uses Page Object Model with TypeScript support"
    },
    fixtureBasedTests: {
      name: "Fixture-Based Tests",
      example: `
test.beforeEach(async ({ page }) => {
    await page.goto('login-url');
});

test('login workflow', async ({ page }) => {
    await page.fill('[data-testid=username]', 'user');
    await page.fill('[data-testid=password]', 'pass');
    await page.click('[data-testid=login]');
});`,
      description: "Uses Playwright fixtures and direct selectors"
    }
  }
};

module.exports = { scriptTemplates };