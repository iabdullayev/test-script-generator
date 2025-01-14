const scriptTemplates = {
  XCUITest: {
    chainedPageObject: {
      name: "Chained Page Object Pattern",
      description: "Uses BaseView pattern with chained methods and page objects",
      viewEnumTemplate: `enum {PageName}View: BaseView {
    // Element cases
    case {ElementCases}

    var identifier: String? {
        switch self {
            {IdentifierCases}
        }
    }

    var elementType: ElementType {
        switch self {
            {ElementTypeCases}
        }
    }
}`,
      pageTemplate: `class {PageName}Page: BasePage {
    init(testCase: XCTestCase) {
        super.init(testCase: testCase)
    }

    @discardableResult
    func verify{PageName}Loaded() -> Self {
        XCTAssertTrue({PageName}View.{mainElement}.element.exists)
        return self
    }

    {PageMethods}
}`,
      testTemplate: `class {PageName}Tests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func test{TestName}() {
        let {pageName}Page = {PageName}Page(testCase: self)
        {TestSteps}
    }
}`,
      methodTemplates: {
        button: `
    @discardableResult
    func tap{ElementName}() -> {ReturnType} {
        XCTAssertTrue({PageName}View.{elementCase}.element.exists, "{ElementName} button not found")
        {PageName}View.{elementCase}.element.tap()
        return {ReturnStatement}
    }`,
        textField: `
    @discardableResult
    func enter{ElementName}(_ text: String) -> Self {
        let element = {PageName}View.{elementCase}.element
        XCTAssertTrue(element.exists, "{ElementName} field not found")
        element.tap()
        element.typeText(text)
        return self
    }`,
        staticText: `
    @discardableResult
    func verify{ElementName}(_ expectedText: String) -> Self {
        let element = {PageName}View.{elementCase}.element
        XCTAssertTrue(element.exists, "{ElementName} label not found")
        XCTAssertEqual(element.label, expectedText)
        return self
    }`
      }
    },
    
    basicPageObject: {
      name: "Basic Page Object Pattern",
      description: "Simple page object pattern without chaining",
      viewEnumTemplate: `enum {PageName}View: BaseView {
    case {ElementCases}

    var identifier: String? {
        switch self {
            {IdentifierCases}
        }
    }

    var elementType: ElementType {
        switch self {
            {ElementTypeCases}
        }
    }
}`,
      pageTemplate: `class {PageName}Page: BasePage {
    init() {
        super.init()
    }

    func verify{PageName}Loaded() {
        XCTAssertTrue({PageName}View.{mainElement}.element.exists)
    }

    {PageMethods}
}`,
      methodTemplates: {
        button: `
    func tap{ElementName}() {
        XCTAssertTrue({PageName}View.{elementCase}.element.exists)
        {PageName}View.{elementCase}.element.tap()
    }`,
        textField: `
    func enter{ElementName}(_ text: String) {
        let element = {PageName}View.{elementCase}.element
        XCTAssertTrue(element.exists)
        element.tap()
        element.typeText(text)
    }`,
        staticText: `
    func verify{ElementName}(_ expectedText: String) {
        let element = {PageName}View.{elementCase}.element
        XCTAssertTrue(element.exists)
        XCTAssertEqual(element.label, expectedText)
    }`
      }
    },

    screenBased: {
      name: "Screen-Based Pattern",
      description: "Organizes tests by screen with direct UI interactions",
      screenTemplate: `class {PageName}Screen: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        app = XCUIApplication()
        app.launch()
    }
    
    func verify{PageName}Elements() {
        {VerificationMethods}
    }
    
    {TestMethods}
}`
    }
  },

  Espresso: {
    robotPattern: {
      name: "Robot Pattern",
      description: "Uses Kotlin Robot Pattern with given/when/then structure",
      screenTemplate: `object {PageName}Screen {
    // Element IDs
    private val {ElementIDs}

    class Robot {
        fun verify{PageName}Displayed() = apply {
            onView(withId(MAIN_ELEMENT))
                .check(matches(isDisplayed()))
            return this
        }

        {RobotMethods}

        infix fun verify(assertion: Assert.() -> Unit) = Assert().apply(assertion)
    }

    class Assert {
        fun isDisplayed() {
            onView(withId(MAIN_ELEMENT))
                .check(matches(isDisplayed()))
        }

        {AssertionMethods}
    }
}`,
      testTemplate: `@RunWith(AndroidJUnit4::class)
class {PageName}Test {
    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun test{TestName}Flow() {
        {PageName}Screen.Robot()
            .verify{PageName}Displayed()
            {TestSteps}
            .verify {
                isDisplayed()
                {Assertions}
            }
    }
}`
    },

    screenPattern: {
      name: "Screen Pattern",
      description: "Uses Screen Objects with ViewMatchers and ViewActions",
      template: `class {PageName}Screen {
    private val {ElementIDs}

    fun verify{PageName}Displayed() {
        onView(withId(MAIN_ELEMENT))
            .check(matches(isDisplayed()))
    }

    {ScreenMethods}
}`
    }
  },

  Playwright: {
    pageObject: {
      name: "Page Object Pattern",
      description: "TypeScript Page Objects with async/await pattern",
      pageTemplate: `export class {PageName}Page {
    constructor(private readonly page: Page) {}

    private elements = {
        {ElementLocators}
    } as const;

    async verify{PageName}Loaded(): Promise<this> {
        await expect(this.page.getByTestId(this.elements.mainElement))
            .toBeVisible();
        return this;
    }

    {PageMethods}
}`,
      testTemplate: `import { test, expect } from '@playwright/test';
import { {PageName}Page } from '../pages/{PageName}Page';

test.describe('{TestName} flows', () => {
    test('should complete {TestName} successfully', async ({ page }) => {
        const {pageName}Page = new {PageName}Page(page);

        await {pageName}Page
            .verify{PageName}Loaded()
            {TestSteps}
    });
});`
    },

    componentBased: {
      name: "Component-Based Pattern",
      description: "Organizes tests by reusable components",
      template: `export class {ComponentName}Component {
    constructor(
        private readonly page: Page,
        private readonly root: string
    ) {}

    async isVisible(): Promise<boolean> {
        return await this.page
            .locator(this.root)
            .isVisible();
    }

    {ComponentMethods}
}`
    }
  }
};

module.exports = { scriptTemplates };