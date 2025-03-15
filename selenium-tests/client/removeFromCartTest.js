const { Builder, Browser, By, until } = require("selenium-webdriver");
require("chromedriver");

(async function removeFromCartTests() {
  const login = {
    email: "nguyenquocthang909@gmail.com",
    password: "Aa@123456",
    expectedMessage: "Welcome, testuser",
    messageSelector: ".welcome-message",
    description: "Login with valid email and correct password",
  };

  async function runRemoveFromCartTests(login) {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

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
      await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission

      await driver.sleep(1000);

      const shoppingCart = By.css(
        "div.flex.items-center > a[href='/cart'] button"
      );

      
      // Check if shopping cart badge is not empty
      const regex = /[^0]/;
      await driver
        .wait(
          until.elementTextMatches(
            await driver.findElement(shoppingCart),
            regex
          ),
          1000,
          "Shopping cart is empty"
        )
        .click();

      await driver.wait(until.urlIs("http://localhost:4200/cart"), 1000);

      await driver.sleep(500);

      const cartList = await driver.findElement(
        By.xpath("//*[@id='root']/div/main/div/div/div[1]")
      );
      const cartItems = await cartList.findElements(
        By.css("div.flex.items-center.py-4.border-b")
      );

      for (const item of cartItems) {
        const subtractBtn = item.findElement(
          By.css("div.flex.items-center > button:nth-child(1)")
        );

        await subtractBtn.click();
      }
    } catch (error) {
      console.error("Test failed: " + error);
    } finally {
      driver.quit();
    }
  }

  await runRemoveFromCartTests(login);
})();
