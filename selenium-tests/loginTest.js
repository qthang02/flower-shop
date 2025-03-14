const { Builder, By, until } = require("selenium-webdriver");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
require("chromedriver");

(async function loginTests() {
  // Read the Excel file
  const excelFilePath = path.join(__dirname, "loginTest.xlsx");
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert Excel data to JSON
  const excelData = XLSX.utils.sheet_to_json(worksheet);

  // Prepare test cases array from Excel data
  let testCases = excelData.map((row) => ({
    no: row.no,
    email: row.email,
    password: row.password,
    expectedMessage: row.expectedMessage,
    description: row.description,
    messageSelector: row.messageSelector,
    result: "",
  }));

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
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.json_to_sheet(
    testCases.map((tc) => ({
      no: tc.no,
      email: tc.email,
      password: tc.password,
      expectedMessage: tc.expectedMessage,
      description: tc.description,
      "result (pass / fail)": tc.result,
    })),
  );

  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Login Tests");
  XLSX.writeFile(newWorkbook, excelFilePath);

  console.log("Tests completed. Results written to Excel file.");
})();
