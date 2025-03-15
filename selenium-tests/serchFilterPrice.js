const { Builder, By, until, Key } = require("selenium-webdriver");
const ExcelJS = require("exceljs");
require("chromedriver");

(async function searchAndFilterTest() {
  let driver = await new Builder().forBrowser("chrome").build();

  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Search_Filter_Results");

  // Định nghĩa các cột trong Excel
  worksheet.columns = [
    { header: "Từ khóa", key: "keyword", width: 15 },
    { header: "Giá tối thiểu", key: "minPrice", width: 15 },
    { header: "Tên sản phẩm", key: "productName", width: 30 },
    { header: "Giá hiện tại", key: "currentPrice", width: 15 },
    { header: "Pass/Fail", key: "status", width: 10 },
  ];

  // Danh sách từ khóa và giá tối thiểu để test
  let testCases = [
    { keyword: "gucci", minPrice: 540000 },
    { keyword: "dior", minPrice: 500000 },
    { keyword: "Hoa", minPrice: 1500000 },
  ];

  try {
    await driver.get("http://localhost:4200");
    await driver.sleep(1000);

    for (let testCase of testCases) {
      // 1. Nhập từ khóa tìm kiếm
      let searchField = await driver.findElement(By.css("input.w-64.py-2.pl-10.pr-4.border.rounded-full"));
      await searchField.clear(); // Xóa ô tìm kiếm trước khi nhập
      await searchField.sendKeys(testCase.keyword);
      await driver.sleep(500);

      let submitButton = await driver.findElement(By.css("button.absolute.text-gray-400"));
      await submitButton.click();
      await driver.sleep(1000);

      // 2. Điều chỉnh thanh trượt giá tối thiểu
      let minSlider = await driver.findElement(By.css('span[role="slider"][aria-label="Minimum"]'));
      let maxPrice = 20000000; // Giá trị tối đa của slider
      let targetPrice = testCase.minPrice;
      let percentage = (targetPrice / maxPrice) * 100; // Tính phần trăm để di chuyển slider

      // Lấy kích thước của thanh trượt
      let sliderTrack = await driver.findElement(By.css("span.relative.h-2.w-full"));
      let trackWidth = await sliderTrack.getRect().then((rect) => rect.width);

      // Tính khoảng cách di chuyển (pixel) dựa trên phần trăm
      let moveOffset = (percentage / 100) * trackWidth;

      // Di chuyển slider bằng Actions
      let actions = driver.actions({ async: true });
      await actions
        .move({ origin: minSlider })
        .press()
        .move({ origin: minSlider, x: Math.round(moveOffset), y: 0 })
        .release()
        .perform();
      await driver.sleep(500); // Đợi slider ổn định

      // 3. Nhấn nút "Áp dụng lọc giá"
      let applyFilterButton = await driver.findElement(By.css("button.bg-green-800"));
      await applyFilterButton.click();
      await driver.sleep(1000); // Đợi kết quả lọc sau khi nhấn nút

      // 4. Kiểm tra kết quả sản phẩm
      let productCards = await driver.findElements(By.css(".overflow-hidden.bg-white.rounded-lg.shadow-md"));

      if (productCards.length === 0) {
        worksheet.addRow({
          keyword: testCase.keyword,
          minPrice: testCase.minPrice.toLocaleString() + "đ",
          productName: "Không tìm thấy sản phẩm",
          currentPrice: "",
          status: "Fail",
        });
      } else {
        for (let card of productCards) {
          let productName = await card.findElement(By.css("h3.mb-2.text-lg.font-medium")).getText();
          let currentPriceElement = await card.findElement(By.css("span.mr-2.font-bold.text-red-600"));
          let currentPriceText = await currentPriceElement.getText();
          let currentPrice = parseInt(currentPriceText.replace(/[^0-9]/g, "")); // Chuyển đổi giá thành số

          worksheet.addRow({
            keyword: testCase.keyword,
            minPrice: testCase.minPrice.toLocaleString() + "đ",
            productName: productName,
            currentPrice: currentPriceText,
            status: currentPrice >= testCase.minPrice ? "Pass" : "Fail", // Kiểm tra giá có thỏa mãn minPrice không
          });
        }
      }
    }

    // Lưu file Excel
    await workbook.xlsx.writeFile("Search_Filter_Results.xlsx");
    console.log("Đã xuất kết quả ra file Search_Filter_Results.xlsx");
  } catch (error) {
    console.error("Lỗi xảy ra:", error);
    worksheet.addRow({
      keyword: "Lỗi",
      minPrice: "",
      productName: `Lỗi: ${error.message}`,
      currentPrice: "",
      status: "Fail",
    });
    await workbook.xlsx.writeFile("Search_Filter_Results.xlsx");
  } finally {
    await driver.quit();
  }
})();
