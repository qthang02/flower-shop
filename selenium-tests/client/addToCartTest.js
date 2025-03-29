const { Builder, Browser, By, until } = require("selenium-webdriver");
const path = require("path");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS

const { readExcelFile, writeExcelFile } = require("../util/excelUtils");
require("chromedriver");

(async function addToCartTests() {
  const excelStructure = [
    "ID",
    "Test summary",
    "Pre-conditions",
    "Steps to reproduce",
    "Email",
    "Password",
    "Expected Result",
    "Actual Result",
    "Status",
  ];

  // const excelStructure = {
  //   id: "ID",
  //   summary: "Test Summary",
  //   preCond: "Pre-conditions",
  //   stepsToRepro: "Steps to reproduce",
  //   email: "Email",
  //   password: "Password",
  //   expected: "Expected",
  //   actual: "Actual",
  //   status: "Status",
  // };

  const excelFilePath = path.join(__dirname, "addToCartTest.xlsx");
  let testCases = [];

  const workbook = new ExcelJS.Workbook();
  const excel = await workbook.xlsx.readFile(excelFilePath);
  const sheet = excel.getWorksheet("Add to Cart Result");

  sheet.getColumn(1).key = "id";
  sheet.getColumn(2).key = "summary";
  sheet.getColumn(3).key = "steps";
  sheet.getColumn(4).key = "email";
  sheet.getColumn(5).key = "password";
  sheet.getColumn(6).key = "expected";
  sheet.getColumn(7).key = "actual";
  sheet.getColumn(8).key = "status";

  const testScenario = {};
  sheet.eachColumnKey((col) => {});

  sheet.eachRow((row) => {
    if (row.number > 2) {
      row.eachCell((cell) => {
        if (cell.row > 2) {
          testScenario[cell.key] = cell.value;
          console.log(testScenario.id);
        }
        testCases.push(testScenario);
      });
    }
  });
  console.log(testCases);

  // try {
  //   testCases = readExcelFile(excelFilePath, excelStructure);
  // } catch (error) {
  //   console.error("Error reading Excel file:", error);
  //   return;
  // }

  async function runAddToCartTests(testCase) {
    // let driver = await new Builder().forBrowser(Browser.CHROME).build();

    // console.log(testCase);
    try {
      // driver.manage().window().maximize();
      // await driver.get("http://localhost:4200/login");
      // console.log("Testing: " + testCase["Test summary"]);
      // await driver.sleep(500);
      // let emailField = await driver.findElement(By.name("email"));
      // let passwordField = await driver.findElement(By.name("password"));
      // let submitButton = await driver.findElement(
      //   By.css('button[type="submit"]')
      // );
      // await emailField.sendKeys(testCase["Email"] ?? "");
      // await driver.sleep(500); // Add delay after entering email
      // await passwordField.sendKeys(testCase["Password"] ?? "");
      // await driver.sleep(500); // Add delay after entering password
      // // Submit the testCase form
      // await submitButton.click();
      // await driver.wait(until.urlIs("http://localhost:4200/"), 1000); // Add delay to observe the form submission
      // await driver.sleep(500);
      // const productList = await driver.findElement(
      //   By.css("div > section div.grid")
      // );
      // const products = await productList.findElements(By.css("a"));
      // // Go to a random flower page
      // const rng = Math.floor(Math.random() * products.length);
      // await products[rng].click();
      // await driver.wait(until.urlContains("/product/"), 1000);
      // await driver.sleep(1000);
      // const productSelectors = await driver.findElement(
      //   By.css("div.space-y-6 > div.space-y-4")
      // );
      // const sizeSelector = By.css("div div label[for^='size']");
      // const colorSelector = By.css("div div label[for^='color']");
      // const addToCartButton = By.xpath(
      //   "//*[@id='root']/div/main/div/main/div[1]/div[2]/div[4]/button"
      // );
      // await driver.findElement(addToCartButton).click();
      // await driver.sleep(500);
      // const sonner = By.css("section[aria-label='Notifications alt+T']");
      // await driver.wait(
      //   until.elementTextIs(
      //     await driver.findElement(sonner),
      //     "Vui lòng chọn màu sắc, kích cỡ và số lượng"
      //   ),
      //   1000
      // );
      // await productSelectors.findElement(sizeSelector).click();
      // await productSelectors.findElement(colorSelector).click();
      // await driver.findElement(addToCartButton).click();
      // await driver.sleep(2500);
      // const successSonner = await driver
      //   .wait(until.elementIsVisible(driver.findElement(sonner), 5000))
      //   .getText();
      // if (successSonner === testCase["Expected Result"]) {
      //   testCase["Actual Result"] = testCase["Expected Result"];
      //   testCase["Result"] = "PASS";
      // }
      // await driver.sleep(500);
      // const shoppingCart = By.css(
      //   "div.flex.items-center > a[href='/cart'] button"
      // );
      // const regex = /[^0]/;
      // // Check if shopping cart badge is not empty
      // await driver
      //   .wait(
      //     until.elementTextMatches(
      //       await driver.findElement(shoppingCart),
      //       regex
      //     ),
      //     1000,
      //     "No item in the shopping cart"
      //   )
      //   .click();
      // await driver.wait(until.urlIs("http://localhost:4200/cart"), 1000);
      // await driver.sleep(500);
      // const cartList = await driver.findElement(
      //   By.xpath("//*[@id='root']/div/main/div/div/div[1]")
      // );
      // const cartItems = await cartList.findElements(
      //   By.css("div.flex.items-center.py-4.border-b")
      // );
      // for (const item of cartItems) {
      //   await driver.wait(until.elementIsVisible(item), 1000);
      // }
    } catch (error) {
      testCase["Status"] = "FAIL";
      testCase["Actual Result"] = error.toString();
      console.error(
        `Expected: ${testCase["Expected Result"]}, Actual: ${error}`
      );
    } finally {
      // driver.quit();
    }
  }

  for (var testCase of testCases) {
    await runAddToCartTests(testCase);
  }

  // Write results back to Excel file
  try {
    // writeExcelFile(
    //   excelFilePath,
    //   testCases,
    //   excelStructure,
    //   "Add to Cart Result"
    // );
    console.log("Tests completed. Results written to Excel file.");
  } catch (error) {
    console.error("Error writing to Excel file:", error);
  }
})();
