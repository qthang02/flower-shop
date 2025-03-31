const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS
const assert = require("assert");
require("chromedriver");

(async function removeFromCartTest() {
  // Intialize Excel functions
  const excelFilePath = path.join("../test-cases.xlsx");
  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Cart");

  const row = sheet.getRow(7);

  // Create test case
  let testCase = {
    id: null,
    summary: null,
    email: null,
    password: null,
    expected: null,
    actual: null,
    status: null,
  };

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

      await driver.get("http://localhost:4200/login");
      console.log(`Testing: ${testCase.id} - ${testCase.summary}`);

      await driver.sleep(500);

      let emailField = await driver.findElement(By.name("email"));
      let passwordField = await driver.findElement(By.name("password"));
      let submitButton = await driver.findElement(
        By.css('button[type="submit"]')
      );

      await emailField.sendKeys(testCase.email);
      await passwordField.sendKeys(testCase.password);

      // Submit the login form
      await submitButton.click();
      await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission

      await driver.sleep(500);

      const shoppingCart = By.css(
        "div.flex.items-center > a[href='/cart'] button"
      );

      // Check if shopping cart badge is not empty
      const regex = /[^0]/;
      await driver
        .wait(
          until.elementTextMatches(
            await driver.findElement(shoppingCart),
            regex
          ),
          1000,
          "Shopping cart is empty"
        )
        .click();

      await driver.wait(until.urlIs("http://localhost:4200/cart"), 1000);

      await driver.sleep(500);

      let cartList;
      let cartItems;
      cartList = await driver.findElement(
        By.xpath("//*[@id='root']/div/main/div/div/div[1]")
      );
      cartItems = await cartList.findElements(
        By.css("div.flex.items-center.py-4.border-b")
      );

      const initialCartLength = cartItems.length;

      for (let item of cartItems) {
        if (
          (await item
            .findElement(By.css("div.w-16.mx-2.text-center"))
            .getText()) === "1"
        ) {
          item
            .findElement(By.css("div.flex.items-center > button:nth-child(1)"))
            .click();
          await driver.sleep(500);
        }
      }

      await driver.sleep(2000);

      const sonner = By.css("section[aria-label='Notifications alt+T']");

      await driver.wait(
        until.elementTextIs(await driver.findElement(sonner), "Decrease"),
        1000
      );

      await driver.sleep(500);

      // Return an empty array if there's no product in the cart
      try {
        cartList = await driver.findElement(
          By.xpath("//*[@id='root']/div/main/div/div/div[1]")
        );
        cartItems = await cartList.findElements(
          By.css("div.flex.items-center.py-4.border-b")
        );
      } catch {
        cartItems = [];
      }

      assert.notEqual(initialCartLength, cartItems.length);

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
