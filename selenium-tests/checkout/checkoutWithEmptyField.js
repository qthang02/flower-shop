const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS

const assert = require("assert");
require("chromedriver");

(async function checkoutFromExpiredVoucher() {
  // Intialize Excel functions
  const excelFilePath = path.join("../test-cases.xlsx");
  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Checkout");

  const rows = sheet.getRows(5, 7);

  let testCases = [];
  for (const row of rows) {
    // console.log(row.getCell("A").value);
    testCases.push({
      id: row.getCell("A").value,
      summary: row.getCell("B").value,
      email: row.getCell("E").value,
      password: row.getCell("F").value,
      firstName: row.getCell("G").value,
      lastName: row.getCell("H").value,
      phone: row.getCell("I").value,
      address: row.getCell("J").value,
      note: row.getCell("K").value,
      expected: row.getCell("L").value,
      row: row.number,
    });
  }

  // Create test case
  let testCase = {
    id: null,
    summary: null,
    email: null,
    password: null,
    firstName: null,
    lastName: null,
    phone: null,
    address: null,
    note: null,
    expected: null,
    actual: null,
    status: null,
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
      await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission

      await driver.sleep(500);

      const productList = await driver.findElement(
        By.css("div > section div.grid")
      );
      const products = await productList.findElements(By.css("a"));

      // Go to a random flower page
      const productRNG = Math.floor(Math.random() * products.length);
      await products[productRNG].click();

      await driver.wait(until.urlContains("/product/"), 1000);

      await driver.sleep(500);

      const productSelectors = await driver.findElement(
        By.css("div.space-y-6 > div.space-y-4")
      );
      const sizeSelector = By.css("div div label[for^='size']");
      const colorSelector = By.css("div div label[for^='color']");
      const addToCartButton = By.xpath(
        "//*[@id='root']/div/main/div/main/div[1]/div[2]/div[4]/button"
      );

      await driver.sleep(500);

      await productSelectors.findElement(sizeSelector).click();
      await productSelectors.findElement(colorSelector).click();

      await driver.findElement(addToCartButton).click();

      await driver.sleep(500);

      const addToCartSuccess = By.css(
        "li.group > div:nth-child(2) > div:nth-child(1)"
      );

      await driver.wait(
        until.elementTextIs(
          await driver.findElement(addToCartSuccess),
          "Thêm sản phẩm vào giỏ hàng thành công!"
        ),
        1000
      );

      await driver.sleep(500);

      // Check if shopping cart badge is not empty
      // If not, then go to the cart page
      const shoppingCart = By.css(
        "div.flex.items-center > a[href='/cart'] button"
      );
      const regex = /[^0]/;

      await driver
        .wait(
          until.elementTextMatches(
            await driver.findElement(shoppingCart),
            regex
          ),
          1000,
          "No item in the shopping cart"
        )
        .click();

      await driver.wait(until.urlIs("http://localhost:4200/cart"), 1000);

      await driver.sleep(500);

      const cartList = await driver.findElement(
        By.xpath("//*[@id='root']/div/main/div/div/div[1]")
      );
      const cartItems = await cartList.findElements(
        By.css("div.flex.items-center.py-4.border-b")
      );

      // Select all item in the cart items
      for (const item of cartItems) {
        await driver.wait(until.elementIsVisible(item), 1000);

        await item.findElement(By.css("button[role='checkbox']")).click();
      }

      await driver.sleep(500);

      await driver
        .findElement(
          By.xpath('//*[@id="root"]/div/main/div/div/div[2]/div/button[1]')
        )
        .click();

      // Checkout
      await driver.wait(until.urlIs("http://localhost:4200/checkout"), 1000);

      const firstName = await driver.findElement(By.id("firstName"));
      const lastName = await driver.findElement(By.id("lastName"));
      const phone = await driver.findElement(By.id("phone"));
      const email = await driver.findElement(By.id("email"));
      const address = await driver.findElement(By.id("address"));
      const note = await driver.findElement(By.id("note"));

      const totalPrice = await driver.findElement(
        By.css("div[class='flex justify-between font-semibold']")
      );

      const payButton = await driver.findElement(
        By.css("button[type='submit']")
      );

      firstName.sendKeys(testCase.firstName ?? "");
      lastName.sendKeys(testCase.lastName ?? "");
      if (testCase.row === 7) {
        email.sendKeys("");
      } else if (testCase.row === 8) {
        email.sendKeys("invalid-email");
      } else email.sendKeys(testCase.email);
      phone.sendKeys(testCase.phone ?? "");
      address.sendKeys(testCase.address ?? "");
      note.sendKeys(testCase.note ?? "");

      await driver.sleep(500);

      await payButton.click();

      await driver.sleep(500);

      let formError;

      if (testCase.row !== 11) {
        formError = await driver.findElement(
          By.css("p.text-sm.font-medium.text-red-500")
        );

        assert.equal(await formError.getText(), testCase.expected);
      } else {
        const sonnerElement = By.css(
          "li.group:nth-child(2) > div:nth-child(2) > div:nth-child(1)"
        );

        await driver
          .actions({ async: true })
          .move({ origin: sonnerElement })
          .perform();

        // Get the first from bottom up if multiple sonners appear
        const sonner = await driver.wait(
          until.elementIsVisible(await driver.findElement(sonnerElement)),
          2000
        );

        assert.equal(await sonner.getText(), testCase.expected);
      }

      // Successful test if assertion does not throw error
      sheet.getRow(testCase.row).getCell(`N`).value = "PASS";
      sheet.getRow(testCase.row).getCell(`M`).value = testCase.expected;
      sheet.getRow(testCase.row).commit();
      workbook.xlsx.writeFile(excelFilePath);

      console.log("Test completed. Result is written to Excel file.");
    } catch (error) {
      sheet.getRow(testCase.row).getCell(`N`).value = "FAIL";
      sheet.getRow(testCase.row).getCell(`M`).value = error.toString();
      sheet.getRow(testCase.row).commit();
      workbook.xlsx.writeFile(excelFilePath);
      console.error(`Expected: ${testCase.expected}, Actual: ${error}`);
    } finally {
      driver.quit();
    }
  }

  //   for (const testCase of testCases) {
  await runTest(testCases[testCases.length - 1]);
  //   }
})();
