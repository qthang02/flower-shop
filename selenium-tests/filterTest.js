const { Builder, By } = require("selenium-webdriver");
const ExcelJS = require("exceljs"); // Thêm thư viện ExcelJS
require("chromedriver");

(async function clickAllLinks() {
  let driver = await new Builder().forBrowser("chrome").build();

  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Filter Results");

  // Định nghĩa các cột trong Excel
  worksheet.columns = [
    { header: "Tên Filter", key: "filterName", width: 20 },
    { header: "Tên sản phẩm", key: "productName", width: 30 },
    { header: "Pass/Fail", key: "status", width: 10 }, // Thêm cột Pass/Fail
  ];

  try {
    await driver.get("http://localhost:4200");
    let links = await driver.findElements(By.css("ul.space-y-2 li a"));
    await driver.sleep(500);

    for (let i = 0; i < links.length; i++) {
      // Lấy lại danh sách links sau mỗi lần navigate back để tránh StaleElementReferenceError
      links = await driver.findElements(By.css("ul.space-y-2 li a"));
      await driver.sleep(500);

      const filterName = await links[i].getText();
      console.log(`Nhấn vào: ${filterName}`);
      await links[i].click();
      await driver.sleep(2000); // Đợi trang tải sau khi click

      // Lấy tất cả các card sản phẩm
      let productCards = await driver.findElements(By.css(".overflow-hidden.bg-white.rounded-lg.shadow-md"));

      if (productCards.length === 0) {
        worksheet.addRow({
          filterName: filterName,
          productName: "Không tìm thấy sản phẩm",
          status: "Fail", // Ghi "Fail" nếu không tìm thấy sản phẩm
        });
      } else {
        // Duyệt qua từng card để lấy tên sản phẩm
        for (let card of productCards) {
          let productName = await card.findElement(By.css("h3.mb-2.text-lg.font-medium")).getText();
          worksheet.addRow({
            filterName: filterName,
            productName: productName,
            status: "Pass", // Ghi "Pass" nếu tìm thấy sản phẩm
          });
        }
      }

      await driver.navigate().back();
      await driver.sleep(500); // Đợi trang load lại sau khi back
    }

    // Lưu file Excel
    await workbook.xlsx.writeFile("Filter_Results.xlsx");
    console.log("Đã xuất kết quả ra file Filter_Results.xlsx");
  } catch (error) {
    console.error("Lỗi xảy ra:", error);
    worksheet.addRow({
      filterName: "Lỗi",
      productName: `Lỗi: ${error.message}`,
      status: "Fail",
    });
    await workbook.xlsx.writeFile("Filter_Results.xlsx");
  } finally {
    await driver.quit();
  }
})();
