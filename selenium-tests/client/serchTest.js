const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

(async function loginTests() {
  let textFields = [
    {
      text: "dior",
    },
    {
      text: "gucci",
    },
    {
      text: "Hoa",
    },
    {
      text: "tươi",
    },
    {
      text: "đen",
    },
    {
      text: "đỏ",
    },
    {
      text: "bó",
    },
    {
      text: "10",
    },
    {
      text: "1",
    },
    {
      text: "5",
    },
    {
      text: "$",
    },
  ];

  async function runLoginTest(textField) {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      // Navigate to   the login page
      await driver.get("http://localhost:4200");
      await driver.sleep(500);
      let serchField = await driver.findElement(By.css("input.w-64.py-2.pl-10.pr-4.border.rounded-full"));
      await serchField.sendKeys(textField.text);
      await driver.sleep(500);

      let submitButton = await driver.findElement(By.css("button.absolute.text-gray-400"));
      await submitButton.click();

      await driver.sleep(500);

      await driver.wait(until.elementLocated(By.css(".ant-card-meta-title")), 5000);
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
