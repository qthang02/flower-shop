const { Builder, Browser, By, until } = require("selenium-webdriver");
require("chromedriver");

(async function addToCartTests() {
  const login = {
    email: "nguyenquocthang909@gmail.com",
    password: "Aa@123456",
    expectedMessage: "Welcome, testuser",
    messageSelector: ".welcome-message",
    description: "Login with valid email and correct password",
  };

  async function runAddToCartTests(login) {
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

      await driver.sleep(500);

      const productList = await driver.findElement(
        By.css("div > section div.grid")
      );
      const products = await productList.findElements(By.css("a"));

      // Go to a random flower page
      const rng = Math.floor(Math.random() * products.length);
      await products[rng].click();

      await driver.wait(until.urlContains("/product/"), 1000);

      await driver.sleep(500);

      const productSelectors = await driver.findElement(
        By.css("div.space-y-6 > div.space-y-4")
      );
      const sizeSelector = By.css("div div label[for^='size']");
      const colorSelector = By.css("div div label[for^='color']");
      const addToCartButton = By.xpath(
        "//*[@id='root']/div/main/div/main/div[1]/div[2]/div[4]/button"
      );

      await productSelectors.findElement(sizeSelector).click();
      await productSelectors.findElement(colorSelector).click();

      await driver.findElement(addToCartButton).click();

      await driver.sleep(500);

      const shoppingCart = By.css(
        "div.flex.items-center > a[href='/cart'] button"
      );

      const regex = /[^0]/;

      // Check if shopping cart badge is not empty
      await driver
        .wait(
          until.elementTextMatches(
            await driver.findElement(shoppingCart),
            regex
          ),
          1000,
          "No item in the shopping cart"
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
        await driver.wait(until.elementIsVisible(item), 1000)
      }
    } catch (error) {
      console.error("Test failed: " + error);
    } finally {
      driver.quit();
    }
  }

  await runAddToCartTests(login);
})();
