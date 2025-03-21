const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

async function runAddVoucherTest() {
    let testCase =
    {
        email: 'nguyenquocthang909@gmail.com',
        password: 'Aa@123456',
        expectedMessage: 'Welcome, testuser',
        messageSelector: '.welcome-message',
        description: 'Login with valid email and correct password',
        firstName: 'Phạm',
        lastName: 'Nghĩa',
        recipientEmail: 'nghia038@gmail.com',
        phoneNumber: '0937456779',
        address: '45 Quang Trung, Gò Vấp',
        note: 'giao hàng',
    };

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to the login page
        await driver.get('http://localhost:4200/login');
        console.log("testcase: " + testCase.description);

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
        await driver.get('http://localhost:4200');
        await driver.sleep(1000);

        //Click product 
        let product = await driver.findElement(By.xpath("/html/body/div/div/main/main/div[2]/div/section/div/a[1]/div/img"));
        product.click();
        await driver.sleep(1000);

        // //Verify that product page is visible successfully 
        // await driver.get('http://localhost:4200/product/id');

        //Choose size of the product
        let size = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[1]/div/div/label"));
        size.click();
        await driver.sleep(1000);

        //Choose color of the product
        let color = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[3]/div[2]/div/div/label"));
        color.click();
        await driver.sleep(1000);

        //Click on "Them vao gio hang" button
        let addBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/main/div[1]/div[2]/div[4]/button"));
        addBtn.click();
        await driver.sleep(1000);

        //Navigate to the cart page 
        let cartBtn = await driver.findElement(By.xpath("/html/body/div/div/header/div/div[3]/a/button"));
        cartBtn.click();
        await driver.sleep(1000);

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

        //Click on "Thanh toán" button 
        let checkoutSuccessBtn = await driver.findElement(By.xpath("/html/body/div/div/main/div/div/div/div[2]/div[1]/button"));
        checkoutSuccessBtn.click();
        await driver.sleep(1500);

    } catch (error) {
        console.error(error);
    }
    finally {
        await driver.quit();
    }

}

// Gọi hàm thực thi test
runAddVoucherTest();


