const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

(async function loginTests() {
  let textFields = [
    {
      text: "Flower",
    },
    {
      text: "Flower dior",
    },
    {
      text: "Flower gucci",
    },
  ];

  async function runLoginTest(textField) {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      // Navigate to   the login page
      await driver.get("http://localhost:3000/products?_page=1&_limit=8&tab=1");

      let serchField = await driver.findElement(By.css('input.ant-input[placeholder="Search for product"]'));
      await serchField.sendKeys(textField.text);
      await serchField.sendKeys(Key.ENTER);
      await driver.sleep(10000);
      console.log("testcase: " + textField.text);
      await driver.sleep(10000);
    } catch (error) {
      console.error("Test failed with error:", error);
    } finally {
      await driver.quit();
    }
  }
  for (let textField of textFields) {
    await runLoginTest(textField);
  }
})();
