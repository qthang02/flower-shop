const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS

const assert = require("assert");
require("chromedriver");

(async function orderDetailTest() {
  // Intialize Excel functions
  const excelFilePath = path.join("../test-cases.xlsx");
  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Order");

  // Get 2 rows starting from row 5
  const row = sheet.getRow(3);

  let testCase = {
    id: row.getCell("A").value,
    summary: row.getCell("B").value,
    email: row.getCell("E").value,
    password: row.getCell("F").value,
    expected: row.getCell("G").value,
    actual: null,
  };

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
      await driver.wait(until.urlIs("http://localhost:4200/"), 1000);

      await driver.sleep(1000);

      const profilePicure = await driver.findElement(
        By.css(
          "div.justify-between:nth-child(1) > div:nth-child(3) > button[aria-haspopup='menu']"
        )
      );
      profilePicure.click();

      await driver.sleep(1000);

      const popover = await driver.findElement(By.css("div[role='menu']"));
      const orderHistory = await popover.findElement(
        By.css("a[href='/order-status']")
      );

      orderHistory.click();

      await driver.wait(
        until.urlIs("http://localhost:4200/order-status"),
        2000
      );

      await driver.sleep(3000);

      const showBillDetailButton = await driver.findElement(
        By.xpath(
          "/html/body/div/div/main/div/div[1]/div[1]/div[3]/div[2]/button"
        )
      );

      await showBillDetailButton.click();

      await driver.wait(
        until.elementIsVisible(
          await driver.findElement(By.css("div[role='dialog']"))
        ),
        1000
      );

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
})();
