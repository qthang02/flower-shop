const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS

const assert = require("assert");
require("chromedriver");

(async function filterKeyword() {
  // Intialize Excel functions
  const excelFilePath = path.join("../test-cases.xlsx");
  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Filter");

  // Get 2 rows starting from row 3
  const rows = sheet.getRows(3, 2);

  let test = {
    id: null,
    summary: null,
    email: null,
    password: null,
    keyword: null,
    expected: null,
    actual: null,
    row: null,
  };

  let testCases = [];
  for (const row of rows) {
    test = {
      ...test,
      id: row.getCell("A").value,
      summary: row.getCell("B").value,
      email: row.getCell("E").value,
      password: row.getCell("F").value,
      keyword: row.getCell("G").value,
      expected: row.getCell("H").value,
      row: row.number,
    };
    testCases.push(test);
  }

  async function runTest(testCase) {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

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

      await driver.sleep(500);

      const searchBar = await driver.findElement(By.css("input.w-64"));
      const searchButton = await driver.findElement(
        By.xpath("/html/body/div/div/header/div/div[1]/div[1]/button")
      );

      await searchBar.sendKeys(testCase.keyword);
      await searchButton.click();

      await driver.sleep(1000);

      let filteredProducts;

      if (testCase.row === 3) {
        filteredProducts = await driver.findElements(
          By.css("div.grid:nth-child(2) > a")
        );

        assert.notEqual(filteredProducts.length, 0);
      } else if (testCase.row === 4) {
        filteredProducts = await driver.findElement(
          By.css("div.grid:nth-child(2)")
        );

        assert.equal(
          await filteredProducts.getText(),
          'Không tìm thấy sản phẩm nào phù hợp với "fake"'
        );
      }

      //   Successful test if assertion does not throw error
      sheet.getRow(testCase.row).getCell(`J`).value = "PASS";
      sheet.getRow(testCase.row).getCell(`I`).value = testCase.expected;
      sheet.getRow(testCase.row).commit();
      workbook.xlsx.writeFile(excelFilePath);
    } catch (error) {
      console.error(error);
      sheet.getRow(testCase.row).getCell(`J`).value = "FAIL";
      sheet.getRow(testCase.row).getCell(`I`).value = error.toString();
      sheet.getRow(testCase.row).commit();
      workbook.xlsx.writeFile(excelFilePath);
      console.error(`Expected: ${testCase.expected}, Actual: ${error}`);
    } finally {
      driver.quit();
    }
  }

  for (const testCase of testCases) {
    await runTest(testCase);
  }
})();
