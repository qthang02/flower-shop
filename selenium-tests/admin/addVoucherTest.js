const { Builder, By, until } = require('selenium-webdriver');
const path = require("path");
const { readExcelFile, writeExcelFile } = require("../util/excelUtils");
require('chromedriver');


(async function addVoucherTest() {
    const excelStructure = {
        no: "no",
        email: "Email",
        password: "Password",
        firstName: "First Name",
        lastName: "Last Name",
        recipientEmail: "Recipient Email",
        phoneNumber: "Phone Number",
        address: "Address",
        note: "Note",
        description: "Description",
        expected: "Expected result",
        actual: "Actual result",
        status: "Pass/Fail",
    };

    // Đọc dữ liệu từ file Excel
    const excelFilePath = path.join(__dirname, "addVoucherTest.xlsx");
    let testCases = [];

    try {
        testCases = readExcelFile(excelFilePath, excelStructure);
    } catch (error) {
        console.error("Error reading Excel file:", error);
        return;
    }



    //Thêm khuyến mãi thành công 
    async function runAddVoucherTest(testCase) {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            driver.manage().window().maximize();
            // Navigate to the login page
            await driver.get('http://localhost:4200/login');
            console.log("Running test case: " + testCase.description);
            await driver.sleep(500);
            // Add delay to ensure the page is fully loaded
            await driver.sleep(1000);

            // Fill out the login form
            let emailField = await driver.findElement(By.name('email'));
            await emailField.sendKeys(testCase.email);
            await driver.sleep(1000);

            let passwordField = await driver.findElement(By.name('password'));
            await passwordField.sendKeys(testCase.password);
            await driver.sleep(1000); // Add delay after entering password

            // Submit the login form
            let submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
            await driver.sleep(1000); // Add delay to observe the form submission

            //Verify that home page is visible successfully
            await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/header/div/div[3]/button/img")), 5000);
            console.log("Trang chủ đã hiển thị thành công.");

            //Add product 
            let product = await driver.findElement(By.xpath("/html/body/div/div/main/main/div[2]/div/section/div/a[1]"));
            product.click();
            await driver.sleep(1000);

            // Verify that product page is visible successfully
            await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Thêm vào giỏ hàng')]")), 5000);
            console.log("Trang sản phẩm đã hiển thị đầy đủ.");

            //Choose size of the product
            let size = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[1]/div/div/label"));
            size.click();
            await driver.sleep(1000);

            //Choose color of the product
            let color = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[2]/div/div/label"));
            color.click();
            await driver.sleep(1000);

            //Add to cart
            let addBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[4]/button"));
            addBtn.click();
            await driver.sleep(1000);

            //Navigate to the cart page 
            let cartBtn = await driver.findElement(By.xpath("/html/body/div/div/header/div/div[3]/a/button"));
            cartBtn.click();
            await driver.sleep(1000);

            //Verify cart page is visible successfully
            await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Tiến hành thanh toán')]")), 5000);
            console.log("Nút thanh toán đã xuất hiện.");

            //Select the product you want to checkout 
            let selectBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[1]/div/div[1]/button"));
            selectBox.click();
            await driver.sleep(1000);

            let checkoutBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[2]/div/button[1]"));
            checkoutBtn.click();
            await driver.sleep(1000);

            let firstNameField = await driver.findElement(By.name('firstName'));
            await firstNameField.sendKeys(testCase.firstName);
            await driver.sleep(1000);

            let lastNameField = await driver.findElement(By.name('lastName'));
            await lastNameField.sendKeys(testCase.lastName);
            await driver.sleep(1000);

            let recipientEmailField = await driver.findElement(By.name('email'));
            await recipientEmailField.sendKeys(testCase.recipientEmail);
            await driver.sleep(1000);

            let phoneNumberField = await driver.findElement(By.name('phone'));
            await phoneNumberField.sendKeys(testCase.phoneNumber);
            await driver.sleep(1000);

            let addressField = await driver.findElement(By.name('address'));
            await addressField.sendKeys(testCase.address);
            await driver.sleep(1000);

            let noteField = await driver.findElement(By.name('note'));
            await noteField.sendKeys(testCase.note);
            await driver.sleep(1000);

            //Choose payment method
            let paymentBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[1]/div[2]/div/div[1]/button"));
            paymentBox.click();
            await driver.sleep(1000);

            //Add voucher coupon
            let voucher = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[2]/div/div[1]"));
            voucher.click();
            await driver.sleep(1000);

            //target voucher code to check the quantity of the voucher
            const voucherCodeElement = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[2]/div/div[1]/div[1]/h3"));
            const voucherCode = await voucherCodeElement.getText();
            console.log(`Mã khuyến mãi đã chọn: ${voucherCode}`);

            const voucherQuantityElement = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[2]/div/div[1]/div[2]/p/p"));
            const voucherQuantity = await voucherQuantityElement.getText();
            console.log(`Số lượng mã khuyến mãi đã chọn: ${voucherQuantity}`);


            //Click on "Thanh toán" button 
            let checkoutSuccessBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[1]/button"));
            checkoutSuccessBtn.click();
            await driver.sleep(1500);

            //Navigate to admin page 
            await driver.get('http://localhost:3000/vouchers');
            await driver.sleep(3000);

                // Function to find the row by voucher code and get the quantity
            async function getVoucherDetailsFromAdmin(code) {
                try {
                    const voucherRowXPath = `//table/tbody/tr[./td[1][text()='${code}']]`;
                    const voucherRow = await driver.findElement(By.xpath(voucherRowXPath));
                    const quantityElement = await voucherRow.findElement(By.xpath('./td[4]')); // Assuming 'Số lượng' is the 4th column (index 3)
                    return {
                        quantity: await quantityElement.getText(),
                        rowElement: voucherRow
                    };
                } catch (error) {
                    console.error(`Không tìm thấy mã khuyến mãi '${code}' trong trang admin: ${error}`);
                    return null;
                }
            }

            // Get voucher details from admin page
            const adminVoucherDetails = await getVoucherDetailsFromAdmin(voucherCode);

            if (adminVoucherDetails) {
                const adminQuantity = adminVoucherDetails.quantity;
                console.log(`Số lượng mã '${voucherCode}' trong admin: ${adminQuantity}`);

                if (adminQuantity < voucherQuantity) {
                    testCase.status = "PASS";
                    testCase.actual = "Thanh toán với voucher thành công";
                    console.log(testCase.actual);
                } else {
                    testCase.status = "FAIL";
                    testCase.actual = "Thanh toán với voucher thất bại";
                    console.log(testCase.actual);
                }
            } else {
                testCase.status = "FAIL";
                testCase.actual = `Không tìm thấy mã khuyến mãi '${voucherCode}' trong trang admin để so sánh số lượng.`;
                console.log(testCase.actual);
            }

            

        } catch (error) {
            testCase.status = "FAIL";
            testCase.actual = error.toString();
            console.error(`Expected: ${testCase.expected}, Actual: ${error}`);
        }
        finally {
            await driver.quit();
        }
    }
    for (var testCase of testCases) {
        await runAddVoucherTest(testCase);
      }
    
      // Write results back to Excel file
      try {
        writeExcelFile(
          excelFilePath,
          testCases,
          excelStructure,
          "Add Voucher Test Result"
        );
        console.log("Tests completed. Results written to Excel file.");
      } catch (error) {
        console.error("Error writing to Excel file:", error);
      }

})();
    

//Thêm khuyến mãi không thành công khi thiếu thông tin
// async function runAddVoucherTest1() {
//     let testCase =
//     {
//         email: 'nguyenquocthang909@gmail.com',
//         password: 'Aa@123456',
//         expectedMessage: 'Welcome, testuser',
//         messageSelector: '.welcome-message',
//         description: 'Login with valid email and correct password',
//         firstName: 'Phạm',
//         lastName: 'Nghĩa',
//         recipientEmail: 'nghia038@gmail.com',
//         phoneNumber: '0937456779',
//         address: '45 Quang Trung, Gò Vấp',
//         note: 'giao hàng',
//     };

//     let driver = await new Builder().forBrowser('chrome').build();
//     try {
//         driver.manage().window().maximize();
//         // Navigate to the login page
//         await driver.get('http://localhost:4200/login');
//         console.log("testcase: " + testCase.description);
//         // Add delay to ensure the page is fully loaded
//         await driver.sleep(1000);

//         // Fill out the login form
//         let emailField = await driver.findElement(By.name('email'));
//         await emailField.sendKeys(testCase.email);
//         await driver.sleep(1000);

//         let passwordField = await driver.findElement(By.name('password'));
//         await passwordField.sendKeys(testCase.password);
//         await driver.sleep(1000); // Add delay after entering password

//         // Submit the login form
//         let submitButton = await driver.findElement(By.css('button[type="submit"]'));
//         await submitButton.click();
//         await driver.sleep(1000); // Add delay to observe the form submission

//         //Verify that home page is visible successfully
//         await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/header/div/div[3]/button/img")), 5000);
//         console.log("Trang chủ đã hiển thị thành công.");

//         //Add product 
//         let product = await driver.findElement(By.xpath("/html/body/div/div/main/main/div[2]/div/section/div/a[1]"));
//         product.click();
//         await driver.sleep(1000);

//         // Verify that product's detail page is visible successfully
//         await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Thêm vào giỏ hàng')]")), 5000);
//         console.log("Trang sản phẩm đã hiển thị đầy đủ.");

//         //Choose size of the product
//         let size = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[1]/div/div/label"));
//         size.click();
//         await driver.sleep(1000);

//         //Choose color of the product
//         let color = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[2]/div/div/label"));
//         color.click();
//         await driver.sleep(1000);

//         //Add to cart
//         let addBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[4]/button"));
//         addBtn.click();
//         await driver.sleep(1000);

//         //Navigate to the cart page 
//         let cartBtn = await driver.findElement(By.xpath("/html/body/div/div/header/div/div[3]/a/button"));
//         cartBtn.click();
//         await driver.sleep(1000);

//         //Verify cart page is visible successfully
//         await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Tiến hành thanh toán')]")), 5000);
//         console.log("Nút thanh toán đã xuất hiện.");

//         //Select the product you want to checkout 
//         let selectBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[1]/div/div[1]/button"));
//         selectBox.click();
//         await driver.sleep(1000);

//         let checkoutBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[2]/div/button[1]"));
//         checkoutBtn.click();
//         await driver.sleep(1000);

//         let firstNameField = await driver.findElement(By.name('firstName'));
//         await firstNameField.sendKeys(testCase.firstName);
//         await driver.sleep(1000);

//         let lastNameField = await driver.findElement(By.name('lastName'));
//         await lastNameField.sendKeys(testCase.lastName);
//         await driver.sleep(1000);

//         let recipientEmailField = await driver.findElement(By.name('email'));
//         await recipientEmailField.sendKeys('');
//         await driver.sleep(1000);

//         let phoneNumberField = await driver.findElement(By.name('phone'));
//         await phoneNumberField.sendKeys(testCase.phoneNumber);
//         await driver.sleep(1000);

//         let addressField = await driver.findElement(By.name('address'));
//         await addressField.sendKeys(testCase.address);
//         await driver.sleep(1000);

//         let noteField = await driver.findElement(By.name('note'));
//         await noteField.sendKeys(testCase.note);
//         await driver.sleep(1000);

//         //Choose payment method
//         let paymentBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[1]/div[2]/div/div[1]/button"));
//         paymentBox.click();
//         await driver.sleep(1000);

//         //Add voucher coupon
//         let voucher = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[2]/div/div[1]"));
//         voucher.click();
//         await driver.sleep(1000);

//         //Click on "Thanh toán" button 
//         let checkoutSuccessBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[1]/button"));
//         checkoutSuccessBtn.click();
//         await driver.sleep(1500);

//     } catch (error) {
//         console.error(error);
//     }
//     finally {
//         await driver.quit();
//     }
// }

//Thêm khuyến mãi với voucher hết hạn 
// async function runAddExpiredVoucher() {
//     let testCase =
//     {
//         email: 'nguyenquocthang909@gmail.com',
//         password: 'Aa@123456',
//         expectedMessage: 'Welcome, testuser',
//         messageSelector: '.welcome-message',
//         description: 'Login with valid email and correct password',
//         firstName: 'Phạm',
//         lastName: 'Nghĩa',
//         recipientEmail: 'nghia038@gmail.com',
//         phoneNumber: '0937456779',
//         address: '45 Quang Trung, Gò Vấp',
//         note: 'giao hàng',
//     };

//     let driver = await new Builder().forBrowser('chrome').build();
//     try {
//         driver.manage().window().maximize();
//         // Navigate to the login page
//         await driver.get('http://localhost:4200/login');
//         console.log("testcase: " + testCase.description);
//         // Add delay to ensure the page is fully loaded
//         await driver.sleep(1000);

//         // Fill out the login form
//         let emailField = await driver.findElement(By.name('email'));
//         await emailField.sendKeys(testCase.email);
//         await driver.sleep(1000);

//         let passwordField = await driver.findElement(By.name('password'));
//         await passwordField.sendKeys(testCase.password);
//         await driver.sleep(1000); // Add delay after entering password

//         // Submit the login form
//         let submitButton = await driver.findElement(By.css('button[type="submit"]'));
//         await submitButton.click();
//         await driver.sleep(1000); // Add delay to observe the form submission

//         //Verify that home page is visible successfully
//         await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/header/div/div[3]/button/img")), 5000);
//         console.log("Trang chủ đã hiển thị thành công.");

//         //Add product 
//         let product = await driver.findElement(By.xpath("/html/body/div/div/main/main/div[2]/div/section/div/a[1]"));
//         product.click();
//         await driver.sleep(1000);

//         // Verify that product's detail page is visible successfully
//         await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Thêm vào giỏ hàng')]")), 5000);
//         console.log("Trang sản phẩm đã hiển thị đầy đủ.");

//         //Choose size of the product
//         let size = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[1]/div/div/label"));
//         size.click();
//         await driver.sleep(1000);

//         //Choose color of the product
//         let color = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[2]/div/div/label"));
//         color.click();
//         await driver.sleep(1000);

//         //Add to cart
//         let addBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[4]/button"));
//         addBtn.click();
//         await driver.sleep(1000);

//         //Navigate to the cart page 
//         let cartBtn = await driver.findElement(By.xpath("/html/body/div/div/header/div/div[3]/a/button"));
//         cartBtn.click();
//         await driver.sleep(1000);

//         //Verify cart page is visible successfully
//         await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Tiến hành thanh toán')]")), 5000);
//         console.log("Nút thanh toán đã xuất hiện.");

//         //Select the product you want to checkout 
//         let selectBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[1]/div/div[1]/button"));
//         selectBox.click();
//         await driver.sleep(1000);

//         let checkoutBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[2]/div/button[1]"));
//         checkoutBtn.click();
//         await driver.sleep(1000);

//         let firstNameField = await driver.findElement(By.name('firstName'));
//         await firstNameField.sendKeys(testCase.firstName);
//         await driver.sleep(1000);

//         let lastNameField = await driver.findElement(By.name('lastName'));
//         await lastNameField.sendKeys(testCase.lastName);
//         await driver.sleep(1000);

//         let recipientEmailField = await driver.findElement(By.name('email'));
//         await recipientEmailField.sendKeys(testCase.recipientEmail);
//         await driver.sleep(1000);

//         let phoneNumberField = await driver.findElement(By.name('phone'));
//         await phoneNumberField.sendKeys(testCase.phoneNumber);
//         await driver.sleep(1000);

//         let addressField = await driver.findElement(By.name('address'));
//         await addressField.sendKeys(testCase.address);
//         await driver.sleep(1000);

//         let noteField = await driver.findElement(By.name('note'));
//         await noteField.sendKeys(testCase.note);
//         await driver.sleep(1000);

//         //Choose payment method
//         let paymentBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[1]/div[2]/div/div[1]/button"));
//         paymentBox.click();
//         await driver.sleep(1000);

//         //Add expired voucher coupon
//         let voucher = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[2]/div/div[2]"));
//         voucher.click();
//         await driver.sleep(1000);

//         //Click on "Thanh toán" button 
//         let checkoutSuccessBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[1]/button"));
//         checkoutSuccessBtn.click();
//         await driver.sleep(1500);

//     } catch (error) {
//         console.error(error);
//     }
//     finally {
//         await driver.quit();
//     }

// }

    // //Thêm khuyến mãi thành công 
    // async function runAddVoucherSuccess(testcase) {
    //     let testCase =
    //     {
    //         email: 'nguyenquocthang909@gmail.com',
    //         password: 'Aa@123456',
    //         expectedMessage: 'Welcome, testuser',
    //         messageSelector: '.welcome-message',
    //         description: 'Login with valid email and correct password',
    //         firstName: 'Phạm',
    //         lastName: 'Nghĩa',
    //         recipientEmail: 'nghia038@gmail.com',
    //         phoneNumber: '0937456779',
    //         address: '45 Quang Trung, Gò Vấp',
    //         note: 'giao hàng',
    //     };

    //     let driver = await new Builder().forBrowser('chrome').build();
    //     try {
    //         driver.manage().window().maximize();
    //         // Navigate to the login page
    //         await driver.get('http://localhost:4200/login');
    //         console.log("testcase: " + testCase.description);
    //         // Add delay to ensure the page is fully loaded
    //         await driver.sleep(1000);

    //         // Fill out the login form
    //         let emailField = await driver.findElement(By.name('email'));
    //         await emailField.sendKeys(testCase.email);
    //         await driver.sleep(1000);

    //         let passwordField = await driver.findElement(By.name('password'));
    //         await passwordField.sendKeys(testCase.password);
    //         await driver.sleep(1000); // Add delay after entering password

    //         // Submit the login form
    //         let submitButton = await driver.findElement(By.css('button[type="submit"]'));
    //         await submitButton.click();
    //         await driver.sleep(1000); // Add delay to observe the form submission

    //         //Verify that home page is visible successfully
    //         await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/header/div/div[3]/button/img")), 5000);
    //         console.log("Trang chủ đã hiển thị thành công.");

    //         //Add product 
    //         let product = await driver.findElement(By.xpath("/html/body/div/div/main/main/div[2]/div/section/div/a[1]"));
    //         product.click();
    //         await driver.sleep(1000);

    //         // Verify that product page is visible successfully
    //         await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Thêm vào giỏ hàng')]")), 5000);
    //         console.log("Trang sản phẩm đã hiển thị đầy đủ.");

    //         //Choose size of the product
    //         let size = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[1]/div/div/label"));
    //         size.click();
    //         await driver.sleep(1000);

    //         //Choose color of the product
    //         let color = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[2]/div/div/label"));
    //         color.click();
    //         await driver.sleep(1000);

    //         //Add to cart
    //         let addBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[4]/button"));
    //         addBtn.click();
    //         await driver.sleep(1000);

    //         //Navigate to the cart page 
    //         let cartBtn = await driver.findElement(By.xpath("/html/body/div/div/header/div/div[3]/a/button"));
    //         cartBtn.click();
    //         await driver.sleep(1000);

    //         //Verify cart page is visible successfully
    //         await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Tiến hành thanh toán')]")), 5000);
    //         console.log("Nút thanh toán đã xuất hiện.");

    //         //Select the product you want to checkout 
    //         let selectBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[1]/div/div[1]/button"));
    //         selectBox.click();
    //         await driver.sleep(1000);

    //         let checkoutBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div[2]/div/button[1]"));
    //         checkoutBtn.click();
    //         await driver.sleep(1000);

    //         let firstNameField = await driver.findElement(By.name('firstName'));
    //         await firstNameField.sendKeys(testCase.firstName);
    //         await driver.sleep(1000);

    //         let lastNameField = await driver.findElement(By.name('lastName'));
    //         await lastNameField.sendKeys(testCase.lastName);
    //         await driver.sleep(1000);

    //         let recipientEmailField = await driver.findElement(By.name('email'));
    //         await recipientEmailField.sendKeys(testCase.recipientEmail);
    //         await driver.sleep(1000);

    //         let phoneNumberField = await driver.findElement(By.name('phone'));
    //         await phoneNumberField.sendKeys(testCase.phoneNumber);
    //         await driver.sleep(1000);

    //         let addressField = await driver.findElement(By.name('address'));
    //         await addressField.sendKeys(testCase.address);
    //         await driver.sleep(1000);

    //         let noteField = await driver.findElement(By.name('note'));
    //         await noteField.sendKeys(testCase.note);
    //         await driver.sleep(1000);

    //         //Choose payment method
    //         let paymentBox = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[1]/div[2]/div/div[1]/button"));
    //         paymentBox.click();
    //         await driver.sleep(1000);

    //         //Add voucher coupon
    //         let voucher = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[2]/div/div[1]"));
    //         voucher.click();
    //         await driver.sleep(1000);

    //         //Click on "Thanh toán" button 
    //         let checkoutSuccessBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[1]/button"));
    //         checkoutSuccessBtn.click();
    //         await driver.sleep(1500);

    //     } catch (error) {
    //         console.error(error);
    //     }
    //     finally {
    //         await driver.quit();
    //     }
    // }