const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS

const assert = require("assert");
require("chromedriver");

(async function filterPrice() {
  // Intialize Excel functions
  const excelFilePath = path.join("../test-cases.xlsx");
  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Filter");

  // Get 2 rows starting from row 5
  const rows = sheet.getRows(5, 2);

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

      await driver.sleep(500);

      const sliderDraggable = await driver.findElement(
        By.css("span.relative:nth-child(2) > span:nth-child(2)")
      );

      if (testCase.row === 6) {
        const searchBar = await driver.findElement(By.css("input.w-64"));
        const searchButton = await driver.findElement(
          By.xpath("/html/body/div/div/header/div/div[1]/div[1]/button")
        );

        await searchBar.sendKeys(testCase.keyword);
        await searchButton.click();

        await driver.sleep(1000);
      }

      // Hover on draggable element of price range
      const actions = driver.actions({ async: true });
      await actions.move({ origin: sliderDraggable }).perform();

      // Start and end of price range element
      const start = await sliderDraggable.getRect();
      const end = await driver.findElement(By.css("span.absolute")).getRect();

      await driver.sleep(1000);

      console.log(Math.floor((start.x + end.x)));

      // Drag and drop the draggable element offset by 1px from element
      await actions
        .dragAndDrop(sliderDraggable, {
          x: 1,
          y: start.y - end.y,
        })
        .perform();

      const applyPriceFilterButton = await driver.findElement(
        By.css("button.bg-green-800")
      );

      await applyPriceFilterButton.click();

      await driver.sleep(1000);

      // Get starting price range
      const startingPriceElement = await driver.findElement(
        By.css("div.justify-between:nth-child(3) > span:nth-child(1)")
      );
      const startingPriceRange = parseInt(
        (await startingPriceElement.getText()).replace(/\.|\D/gm, "")
      );

      // Test if it's a number
      assert.deepStrictEqual(typeof startingPriceRange, "number");

      let filteredProducts;

      filteredProducts = await driver.findElements(
        By.css("div.grid:nth-child(2) > a")
      );

      assert.notEqual(filteredProducts.length, 0);

      for (const product of filteredProducts) {
        const productPriceElement = await product.findElement(
          By.css("span.text-red-600")
        );

        const productPrice = parseInt(
          (await productPriceElement.getText()).replace(/\.|\D/gm, "")
        );

        assert.deepStrictEqual(typeof productPrice, "number");

        assert(productPrice > startingPriceRange);
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
