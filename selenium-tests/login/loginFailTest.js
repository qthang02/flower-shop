const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS
const assert = require("assert");
require("chromedriver");

(async function loginTests() {
  const excelFilePath = path.join("../test-cases.xlsx");

  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Login");

  const rows = sheet.getRows(4, 5);

  let testCases = [];

  for (const row of rows) {
    testCases.push({
      id: row.getCell("A").value,
      summary: row.getCell("B").value,
      email: row.getCell("E").value,
      password: row.getCell("F").value,
      expected: row.getCell("G").value,
      row: row.number,
    });
  }

  async function runLoginTest(testCase) {
    let driver = await new Builder().forBrowser("chrome").build();

    console.log(testCase);

    try {
      driver.manage().window().maximize();

      // Navigate to the login page
      await driver.get("http://localhost:4200/login");
      console.log("Testing: " + testCase.summary);

      // Fill out the login form
      let emailField = await driver.findElement(By.name("email"));
      await emailField.sendKeys(testCase.email ?? "");
      await driver.sleep(500); // Add delay after entering email

      let passwordField = await driver.findElement(By.name("password"));
      await passwordField.sendKeys(testCase.password ?? "");
      await driver.sleep(500); // Add delay after entering password

      // Submit the login form
      let submitButton = await driver.findElement(
        By.css('button[type="submit"]')
      );
      await submitButton.click();
      await driver.sleep(1000); // Add delay to observe the form submission

      try {
        const errorMessage = await driver.findElement(By.css("p.text-red-500"));
        const sonner = await driver.findElement(
          By.css("li.group > div:nth-child(2) > div:nth-child(1)")
        );

        if (errorMessage != null) {
          assert.equal(await errorMessage.getText(), testCase.expected);
        }
        if (sonner != null) {
          assert.equal(await sonner.getText(), testCase.expected);
        }
      } catch {
        return;
      }

      // Successful test if assertion does not throw error
      sheet.getRow(testCase.row).getCell(`I`).value = "PASS";
      sheet.getRow(testCase.row).getCell(`H`).value = testCase.expected;
      sheet.getRow(testCase.row).commit();
      workbook.xlsx.writeFile(excelFilePath);

      console.log("Test completed. Result is written to Excel file.");
    } catch (error) {
      sheet.getRow(testCase.row).getCell(`I`).value = "FAIL";
      sheet.getRow(testCase.row).getCell(`H`).value = error.toString();
      sheet.getRow(testCase.row).commit();
      workbook.xlsx.writeFile(excelFilePath);
      console.error(`Expected: ${testCase.expected}, Actual: ${error}`);
    } finally {
      driver.quit();
    }
  }

  // Run each test case
  for (let testCase of testCases) {
    await runLoginTest(testCase);
  }
})();
