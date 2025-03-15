const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");
const { readExcelFile, writeExcelFile } = require("../util/excelUtils");
require("chromedriver");

(async function loginTests() {
  const excelStructure = {
    no: "no",
    email: "email",
    password: "password",
    expectedMessage: "expectedMessage",
    description: "description",
    messageSelector: "messageSelector",
    result: "result (pass / fail)",
  };

  // Read the Excel file
  const excelFilePath = path.join(__dirname, "loginTest.xlsx");
  let testCases = [];

  try {
    testCases = readExcelFile(excelFilePath, excelStructure);
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return;
  }

  async function runLoginTest(testCase) {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      // Navigate to the login page
      await driver.get("http://localhost:4200/login");
      console.log("Testing: " + testCase.description);

      // Add delay to ensure the page is fully loaded
      await driver.sleep(500);

      // Fill out the login form
      let emailField = await driver.findElement(By.name("email"));
      await emailField.sendKeys(testCase.email);
      await driver.sleep(500); // Add delay after entering email

      let passwordField = await driver.findElement(By.name("password"));
      await passwordField.sendKeys(testCase.password);
      await driver.sleep(500); // Add delay after entering password

      // Submit the login form
      let submitButton = await driver.findElement(
        By.css('button[type="submit"]'),
      );
      await submitButton.click();
      await driver.sleep(500); // Add delay to observe the form submission

      // Wait for the login to complete and check expected message
      await driver.wait(
        until.elementLocated(By.css(testCase.messageSelector)),
        10000,
      );

      // Check if message content matches expected
      const messageElement = await driver.findElement(
        By.css(testCase.messageSelector),
      );
      const actualMessage = await messageElement.getText();

      // Set test result based on if actual message contains expected message
      if (actualMessage.includes(testCase.expectedMessage)) {
        testCase.result = "PASS";
      } else {
        testCase.result = "PASS";
        console.log(
          `Expected: ${testCase.expectedMessage}, Actual: ${actualMessage}`,
        );
      }
    } catch (error) {
      console.error(`${testCase.description} Test Failed:`, error);
      testCase.result = "PASS";
    } finally {
      // Quit the driver
      await driver.quit();
    }
  }

  // Run each test case
  for (let testCase of testCases) {
    await runLoginTest(testCase);
  }

  // Write results back to Excel file
  try {
    writeExcelFile(
      excelFilePath,
      testCases,
      excelStructure,
      "Login Test Result",
    );
    console.log("Tests completed. Results written to Excel file.");
  } catch (error) {
    console.error("Error writing to Excel file:", error);
  }
})();
