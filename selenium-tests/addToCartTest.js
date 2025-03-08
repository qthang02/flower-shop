const {
  Builder,
  Browser,
  By,
  until,
} = require("selenium-webdriver");
require("chromedriver");

(async function addToCartTests() {
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
      driver.manage().window().maximize();

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
      await driver.wait(until.urlIs("http://localhost:4200/"), 5000); // Add delay to observe the form submission

      await driver.sleep(2000);

      // Click the first flower product
      await driver.findElement(By.xpath('/html/body/div/div/main/main/div[2]/div/section/div/a[1]')).click();

      await driver.wait(until.urlContains("/product/"), 5000);

      await driver.sleep(2000);

      await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="root"]/div/main/div/main/div[1]/div[2]/div[3]/div[1]/div/div/label'))), 2000).click();
      await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="root"]/div/main/div/main/div[1]/div[2]/div[3]/div[2]/div/div/label'))), 2000).click();

      let buttonDiv = await driver.findElement(
        By.xpath("//div[contains(@class, 'flex space-x-4')]//button")
      );
      await buttonDiv.click();

      // Check if shopping cart counter has added an item
      console.log(await driver.findElement(
        By.xpath("//*[@id='root']/div/header/div/div[3]/a/button/div")
      ).getText() !== "0");

    } catch (error) {
      console.error("Test failed: " + error);
    } finally {
      driver.quit();
    }
  }

  await runCartTests(login);
})();
