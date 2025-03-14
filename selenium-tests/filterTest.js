const { Builder, By } = require("selenium-webdriver");

(async function clickAllLinks() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:4200"); // Thay bằng URL thực tế của trang web

    // Lấy danh sách tất cả các phần tử <a> trong <ul>
    let links = await driver.findElements(By.css("ul.space-y-2 li a"));
    await driver.sleep(500);
    for (let i = 0; i < links.length; i++) {
      // Lấy lại danh sách vì DOM có thể thay đổi sau mỗi lần nhấn
      links = await driver.findElements(By.css("ul.space-y-2 li a"));
      await driver.sleep(500);
      console.log(`Nhấn vào: ${await links[i].getText()}`);
      await links[i].click();
      await driver.sleep(500);
      // Chờ một chút để trang tải nếu cần
      await driver.sleep(2000);

      // Điều hướng quay lại nếu mỗi lần nhấn chuyển sang trang mới
      await driver.navigate().back();
    }
  } finally {
    await driver.quit(); // Đóng trình duyệt khi xong
  }
})();
