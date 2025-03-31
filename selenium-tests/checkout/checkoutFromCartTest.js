const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
require("chromedriver");

(async function checkoutFromCartTests() {
  const excelStructure = {
    id: "ID",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    address: "Address",
    email: "Email",
    password: "Password",
    note: "Note",
    summary: "Summary",
    expected: "Expected result",
    actual: "Actual result",
    status: "Pass/Fail",
  };

  const excelFilePath = path.join(__dirname, "checkoutFromCartTest.xlsx");
  let testCases = [];

  try {
    testCases = readExcelFile(excelFilePath, excelStructure);
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return;
  }

  async function runCheckoutFromCartTests(user) {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();

    try {
      driver.manage().window().maximize();

      await driver.get("http://localhost:4200/login");
      console.log("Testing: " + user.summary);

      await driver.sleep(500);

      const emailField = await driver.findElement(By.name("email"));
      const passwordField = await driver.findElement(By.name("password"));
      const submitButton = await driver.findElement(
        By.css('button[type="submit"]')
      );

      await emailField.sendKeys(user.email);
      await passwordField.sendKeys(user.password);

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

      const sonner = By.css("section[aria-label='Notifications alt+T']");

      await driver.wait(
        until.elementTextIs(
          await driver.findElement(sonner),
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

      const paymentMethods = await driver.findElements(
        By.css("div[role='radiogroup'] > div[class$='space-x-2']")
      );
      const coupons = await driver.findElements(
        By.css(
          "div.space-y-6.h-full > div:nth-child(2) > div > div[class$='hover:bg-gray-100']"
        )
      );

      const paymentMethodRNG = Math.floor(
        Math.random() * (paymentMethods.length - 1)
      );
      const couponRNG = Math.floor(Math.random() * coupons.length);

      const totalPrice = await driver.findElement(
        By.css("div[class='flex justify-between font-semibold']")
      );

      const payButton = await driver.findElement(
        By.css("button[type='submit']")
      );

      firstName.sendKeys(user.firstName);
      await driver.sleep(250);

      lastName.sendKeys(user.lastName);
      await driver.sleep(250);

      email.sendKeys(user.email);
      await driver.sleep(250);

      phone.sendKeys(user.phone);
      await driver.sleep(250);

      address.sendKeys(user.address);
      await driver.sleep(250);

      note.sendKeys(user.note);
      await driver.sleep(250);

      await paymentMethods[paymentMethodRNG].click();
      const couponValidDate = coupons[couponRNG].findElement(
        By.css("div.p-6.pt-0.pb-0.flex.justify-between.items-center > button")
      );

      if ((await couponValidDate.getText()).includes("2025")) {
        await coupons[couponRNG].click();
      }

      if ((await totalPrice.getText()).startsWith("-")) {
        console.error("Total price shouldn't be lower than 0");
      } else {
        await payButton.click();
        await driver.sleep(1000);
      }

      const successSonner = await driver
        .wait(until.elementIsVisible(driver.findElement(sonner), 1000))
        .getText();

      if (successSonner === user.expected) {
        user.actual = user.expected;
        user.status = "PASS";
      }
    } catch (error) {
      user.status = "FAIL";
      user.actual = error.toString();
      console.error(`Expected: ${user.expected}, Actual: ${error}`);
    } finally {
      driver.quit();
    }
  }

  // await runCheckoutFromCartTests(testCases[0]);
  for (const testCase of testCases) {
    await runCheckoutFromCartTests(testCase);
  }

  // Write results back to Excel file
  try {
    writeExcelFile(
      excelFilePath,
      testCases,
      excelStructure,
      "Checkout Cart Test Result"
    );
    console.log("Tests completed. Results written to Excel file.");
  } catch (error) {
    console.error("Error writing to Excel file:", error);
  }
})();
