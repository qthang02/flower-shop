const { Builder, Browser, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
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

  const row = sheet.getRow(4);

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

  testCase = {
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
  };

  async function runTest(testCase) {
    let driver = await new Builder()
      .forBrowser(Browser.CHROME)
      //   .setChromeOptions(new chrome.Options().addArguments("--headless"))
      .build();

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

      const nav = await driver.findElement(By.css("nav.py-2"));
      const proceedToCheckoutButton = await driver.findElement(
        By.css("button[class*='bg-green-900']")
      );

      await driver.actions().scroll(0, 0, 0, 0, nav).perform();

      await driver
        .wait(until.elementIsVisible(proceedToCheckoutButton))
        .click();

      // Checkout
      await driver.wait(until.urlIs("http://localhost:4200/checkout"), 1000);

      const firstName = await driver.findElement(By.id("firstName"));
      const lastName = await driver.findElement(By.id("lastName"));
      const phone = await driver.findElement(By.id("phone"));
      const email = await driver.findElement(By.id("email"));
      const address = await driver.findElement(By.id("address"));
      const note = await driver.findElement(By.id("note"));

      await driver.sleep(1000);

      const coupons = await driver.findElements(
        By.css(
          "div.space-y-6.h-full > div:nth-child(2) > div > div[class$='hover:bg-gray-100']"
        )
      );

      const payButton = await driver.findElement(
        By.css("button[type='submit']")
      );

      firstName.sendKeys(testCase.firstName);
      lastName.sendKeys(testCase.lastName);
      email.sendKeys(testCase.email);
      phone.sendKeys(testCase.phone);
      address.sendKeys(testCase.address);
      note.sendKeys(testCase.note);

      await driver.sleep(500);

      // Select an invalid coupon
      for (const coupon of coupons) {
        const couponValidDate = coupon.findElement(
          By.css("div.p-6.pt-0.pb-0.flex.justify-between.items-center > button")
        );

        if ((await couponValidDate.getText()).includes("2024")) {
          await coupon.click();
        }
      }

      await driver.sleep(1000);

      await payButton.click();

      await driver.sleep(500);

      const transactionFailSonner = By.css("li.group > div:nth-child(2) > div:nth-child(1)");
      const voucherFailSonner = By.css(
        "li.group:nth-child(2) > div:nth-child(2) > div:nth-child(1)"
      );

      const transactionFailText = await driver.findElement(transactionFailSonner);
      const voucherFailText = await driver.findElement(voucherFailSonner);

      await driver
        .actions({ async: true })
        .move({ origin: transactionFailText })
        .perform();

      assert.equal(
        await voucherFailText.getText(),
        "Voucher đã hết hạn, Đặt hàng thất bại!"
      );
      assert.equal(await transactionFailText.getText(), "Create order failed!");

      // Successful test if assertion does not throw error
      row.getCell(`N`).value = "PASS";
      row.getCell(`M`).value = testCase.expected;
      sheet.getRow(row.number).commit();
      workbook.xlsx.writeFile(excelFilePath);

      console.log("Test completed. Result is written to Excel file.");
    } catch (error) {
      row.getCell(`N`).value = "FAIL";
      row.getCell(`M`).value = error.toString();
      sheet.getRow(row.number).commit();
      workbook.xlsx.writeFile(excelFilePath);
      console.error(`Expected: ${testCase.expected}, Actual: ${error}`);
    } finally {
      driver.quit();
    }
  }

  await runTest(testCase);
})();
