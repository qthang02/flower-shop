const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS
const assert = require("assert");
require("chromedriver");
// const { readExcelFile, writeExcelFile } = require("../util/excelUtils");

(async function loginTests() {
  const excelFilePath = path.join("../test-cases.xlsx");
  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Login");

  const row = sheet.getRow(3);

  let testCase = {
    id: row.getCell("A").value,
    summary: row.getCell("B").value,
    email: row.getCell("E").value,
    password: row.getCell("F").value,
    expected: row.getCell("G").value,
  };
  // const excelStructure = {
  //   no: "no",
  //   email: "email",
  //   password: "password",
  //   expectedMessage: "expectedMessage",
  //   description: "description",
  //   messageSelector: "messageSelector",
  //   result: "result (pass / fail)",
  // };

  // // Read the Excel file
  // const excelFilePath = path.join(__dirname, "loginTest.xlsx");
  // let testCases = [];

  // try {
  //   testCases = readExcelFile(excelFilePath, excelStructure);
  // } catch (error) {
  //   console.error("Error reading Excel file:", error);
  //   return;
  // }

  async function runTest(testCase) {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    console.log(testCase);

    try {
      driver.manage().window().maximize();

      await driver.get("http://localhost:4200/login");
      console.log("Testing: " + testCase.summary);

      await driver.sleep(500);

      const emailField = await driver.findElement(By.name("email"));
      const passwordField = await driver.findElement(By.name("password"));
      const submitButton = await driver.findElement(
        By.css('button[type="submit"]')
      );

      await emailField.sendKeys(testCase.email);
      await passwordField.sendKeys(testCase.password);

      // Submit the login form
      await submitButton.click();
      await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission

      await driver.sleep(500); // Add delay to observe the form submission

      await driver.wait(until.urlIs("http://localhost:4200/"), 2000);

      // Successful test if assertion does not throw error
      row.getCell(`I`).value = "PASS";
      row.getCell(`H`).value = testCase.expected;
      sheet.getRow(row.number).commit();
      workbook.xlsx.writeFile(excelFilePath);

      console.log("Test completed. Result is written to Excel file.");
    } catch (error) {
      row.getCell(`I`).value = "FAIL";
      row.getCell(`H`).value = error.toString();
      sheet.getRow(row.number).commit();
      workbook.xlsx.writeFile(excelFilePath);
      console.error(`Expected: ${testCase.expected}, Actual: ${error}`);
    } finally {
      driver.quit();
    }
  }

  await runTest(testCase);

  // Write results back to Excel file
  // try {
  //   writeExcelFile(
  //     excelFilePath,
  //     testCases,
  //     excelStructure,
  //     "Login Test Result"
  //   );
  //   console.log("Tests completed. Results written to Excel file.");
  // } catch (error) {
  //   console.error("Error writing to Excel file:", error);
  // }
})();
