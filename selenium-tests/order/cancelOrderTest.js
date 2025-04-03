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
  const row = sheet.getRow(4);

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

      const cancelButton = await driver.findElement(
        By.css(
          "tr.transition-colors >  td:nth-child(6) > button[aria-haspopup='dialog']"
        )
      );

      await cancelButton.click();

      await driver.sleep(500);

      let dialog;
      let dialogButton;

      dialog = await driver.findElement(By.css("div[role='dialog']"));
      dialogButton = await dialog.findElement(
        By.css("button[aria-haspopup='dialog']")
      );

      await dialogButton.click();

      const textarea = await driver.findElement(By.css("textarea.flex"));

      dialogButton = await dialog.findElement(
        By.xpath("/html/body/div[4]/div/button")
      );
      await textarea.sendKeys("Giao hàng không cẩn thận");

      await driver.sleep(500);

      await dialogButton.click();

      await driver.sleep(2000);

      sonner = await driver.wait(
        until.elementIsVisible(
          await driver.findElement(
            By.css("li.group > div:nth-child(2) > div:nth-child(1)")
          )
        )
      );

      assert.equal(await sonner.getText(), "Huỷ đơn hàng thành công");

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
