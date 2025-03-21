const { Builder, By, until } = require("selenium-webdriver");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS
require("chromedriver");

(async function loginTests() {
  let textFields = [{ text: "dior" }, { text: "gucci" }, { text: "Hoa" }, { text: "tươi" }, { text: "bó" }, { text: "$" }];

  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Search Results");

  // Định nghĩa các cột trong Excel
  worksheet.columns = [
    { header: "Từ khóa", key: "keyword", width: 15 },
    { header: "Tên sản phẩm", key: "productName", width: 30 },
    { header: "Giá hiện tại", key: "currentPrice", width: 15 },
    { header: "Giá gốc", key: "originalPrice", width: 15 },
    { header: "Giảm giá", key: "discount", width: 10 },
    { header: "Đánh giá", key: "rating", width: 15 },
    { header: "Pass/Fail", key: "status", width: 10 },
  ];

  async function runLoginTest(textField) {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      // Navigate to the login page
      await driver.get("http://localhost:4200");
      await driver.sleep(500);
      let searchField = await driver.findElement(By.css("input.w-64.py-2.pl-10.pr-4.border.rounded-full"));
      await searchField.sendKeys(textField.text);
      await driver.sleep(500);

      let submitButton = await driver.findElement(By.css("button.absolute.text-gray-400"));
      await submitButton.click();

      await driver.sleep(500);

      // Đợi kết quả xuất hiện
      await driver.wait(until.elementLocated(By.css(".grid.grid-cols-1")), 5000);

      // Lấy tất cả các card sản phẩm
      let productCards = await driver.findElements(By.css(".overflow-hidden.bg-white.rounded-lg.shadow-md"));

      if (productCards.length === 0) {
        worksheet.addRow({
          keyword: textField.text,
          productName: "Không tìm thấy sản phẩm",
          currentPrice: "",
          originalPrice: "",
          discount: "",
          rating: "",
          status: "Fail",
        });
        return;
      }

      // Duyệt qua từng card để lấy thông tin
      for (let i = 0; i < productCards.length; i++) {
        let card = productCards[i];

        // Lấy tên sản phẩm
        let productName = await card.findElement(By.css("h3.mb-2.text-lg.font-medium")).getText();

        // Lấy giá hiện tại
        let currentPrice = await card.findElement(By.css("span.mr-2.font-bold.text-red-600")).getText();

        // Lấy giá gốc (nếu có)
        let originalPriceElement = await card.findElements(By.css("span.text-sm.text-gray-500.line-through"));
        let originalPrice = originalPriceElement.length > 0 ? await originalPriceElement[0].getText() : "N/A";

        // Lấy phần trăm giảm giá (nếu có)
        let discountElement = await card.findElements(By.css("span.ml-auto.text-sm.text-green-600"));
        let discount = discountElement.length > 0 ? await discountElement[0].getText() : "N/A";

        // Lấy đánh giá sao
        let stars = await card.findElements(By.css("svg.w-4.h-4.text-yellow-400.fill-yellow-400"));
        let ratingText = await card.findElement(By.css("span.ml-1.text-sm.text-gray-500")).getText();
        let rating = `${stars.length} sao ${ratingText}`;

        worksheet.addRow({
          keyword: textField.text,
          productName: productName,
          currentPrice: currentPrice,
          originalPrice: originalPrice,
          discount: discount,
          rating: rating,
          status: "Pass",
        });
      }
    } catch (error) {
      worksheet.addRow({
        keyword: textField.text,
        productName: `Lỗi: ${error.message}`,
        currentPrice: "",
        originalPrice: "",
        discount: "",
        rating: "",
        status: "Fail",
      });
    } finally {
      await driver.quit();
    }
  }

  // Chạy tất cả các test
  for (let textField of textFields) {
    await runLoginTest(textField);
  }

  // Lưu file Excel
  await workbook.xlsx.writeFile("Search_Results.xlsx");
  console.log("Đã xuất kết quả ra file Search_Results.xlsx");
})();
