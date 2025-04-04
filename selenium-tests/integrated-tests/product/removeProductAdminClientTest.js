const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS
const assert = require("assert");
require("chromedriver");

(async function removeProductAdminClientTest() {
  const excelFilePath = path.join("../../test-cases.xlsx");
  let testCase = {
    id: null,
    summary: null,
    email: null,
    password: null,
    expected: null,
    actual: null,
    status: null,
  };

  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("IntegratedTests");

  const row = sheet.getRow(5);

  testCase = {
    id: row.getCell("A").value,
    summary: row.getCell("B").value,
    email: row.getCell("E").value,
    password: row.getCell("F").value,
    expected: row.getCell("G").value,
  };

  async function runTest(testCase) {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    try {
      driver.manage().window().maximize();

      console.log(`Testing: ${testCase.id} - ${testCase.summary}`);

      await driver.get("http://localhost:4200/login");

      await driver.sleep(500);
      let emailField = await driver.findElement(By.name("email"));
      let passwordField = await driver.findElement(By.name("password"));
      let submitButton = await driver.findElement(
        By.css('button[type="submit"]')
      );
      await emailField.sendKeys(testCase.email ?? "");
      await driver.sleep(500); // Add delay after entering email
      await passwordField.sendKeys(testCase.password ?? "");
      await driver.sleep(500); // Add delay after entering password
      // Submit the testCase form
      await submitButton.click();

      await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission
      await driver.sleep(500);
      let productList = await driver.findElement(
        By.css("div > section div.grid")
      );
      let products = await productList.findElements(By.css("a"));

      const initialProductLength = products.length;

      await driver.get("http://localhost:3000/");
      await driver.sleep(1000);

      const productManagementTab = await driver.findElement(
        By.css("a[href='/products']")
      );
      await productManagementTab.click();

      await driver.sleep(500);

      // Find the first delete button on the table
      const deleteProductButton = await driver.findElement(
        By.css(
          "tr.ant-table-row:nth-child(1) > td:nth-child(7) > div:nth-child(1) > button:nth-child(3)"
        )
      );
      await deleteProductButton.click();

      const deleteProductModal = await driver.wait(
        until.elementIsVisible(
          await driver.findElement(By.css("div.ant-modal-content"))
        )
      );
      const deleteProductModalButton = await deleteProductModal.findElement(
        By.css("button.ant-btn:nth-child(2)")
      );

      deleteProductModalButton.click();

      await driver.sleep(1000);

      const messagePopup = await driver.findElement(
        By.css("div.ant-notification-notice-message")
      );

      assert.equal(
        await messagePopup.getText(),
        "Đã chuyển sản phẩm vào thùng rác!"
      );

      await driver.get("http://localhost:4200/login");

      await driver.sleep(500);
      emailField = await driver.findElement(By.name("email"));
      passwordField = await driver.findElement(By.name("password"));
      submitButton = await driver.findElement(By.css('button[type="submit"]'));
      await emailField.sendKeys(testCase.email ?? "");
      await driver.sleep(500); // Add delay after entering email
      await passwordField.sendKeys(testCase.password ?? "");
      await driver.sleep(500); // Add delay after entering password
      // Submit the testCase form
      await submitButton.click();

      await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission
      await driver.sleep(500);
      productList = await driver.findElement(By.css("div > section div.grid"));
      products = await productList.findElements(By.css("a"));

      assert.notEqual(products, initialProductLength);

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
