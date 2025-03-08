const {
  Builder,
  Browser,
  By,
  until,
  WebDriver,
} = require("selenium-webdriver");
require("chromedriver");

(async function addToCartTests(params) {
  const login = {
    email: "nguyenquocthang909@gmail.com",
    password: "Aa@123456",
    expectedMessage: "Welcome, testuser",
    messageSelector: ".welcome-message",
    description: "Login with valid email and correct password",
  };

  async function runCartTests(login) {
    let driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeService()
      .build();

    try {
      await driver.get("http://localhost:4200/login");

      await driver.sleep(500);

      let emailField = await driver.findElement(By.name("email"));
      let passwordField = await driver.findElement(By.name("password"));
      let submitButton = await driver.findElement(
        By.css('button[type="submit"]')
      );

      await emailField.sendKeys(login.email);
      await driver.sleep(500); // Add delay after entering email

      await passwordField.sendKeys(login.password);
      await driver.sleep(500); // Add delay after entering password

      // Submit the login form
      await submitButton.click();
      await driver.wait(until.urlIs("http://localhost:4200/"), 2000); // Add delay to observe the form submission

      let item = By.xpath(
        "//div[contains(@class, 'overflow-hidden bg-white rounded-lg shadow-md flex flex-col w-full h-full')]"
      );

      // Click the first flower product with the element specified above
      await driver.findElement(item).click();

      await driver.wait(until.urlContains("/product/"), 2000);
      let sizeSelector = await driver.findElement(By.id("size-selector"));
      let colorSelector = await driver.findElement(By.id("color-selector"));

      let sizeBtn = await sizeSelector.findElement(By.css("button"));
      let colorBtn = await colorSelector.findElement(By.css("button"));

      await driver.wait(until.elementIsVisible(sizeBtn), 2000).click();
      await driver.wait(until.elementIsVisible(colorBtn), 2000).click();

      let buttonDiv = await driver.findElement(
        By.xpath("//div[contains(@class, 'flex space-x-4')]//button")
      );
      await buttonDiv.click();

      // Check if shopping cart counter has added an item
      let shoppingCartCounter = await driver.findElement(
        By.xpath("//div[text()=1]")
      );
    } catch (error) {
      console.error("Test failed: " + error);
    }
  }

  await runCartTests(login);
})();
