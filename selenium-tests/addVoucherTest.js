const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

async function runAddVoucherTest() {
    let testCase =
    {
        email: 'nguyenquocthang909@gmail.com',
        password: 'Aa@123456',
        expectedMessage: 'Welcome, testuser',
        messageSelector: '.welcome-message',
        description: 'Login with valid email and correct password'
    };

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to the login page
        await driver.get('http://localhost:4200/login');
        console.log("testcase: " + testCase.description);

        // Add delay to ensure the page is fully loaded
        await driver.sleep(500);

        // Fill out the login form
        let emailField = await driver.findElement(By.name('email'));
        await emailField.sendKeys(testCase.email);
        await driver.sleep(500); // Add delay after entering email

        let passwordField = await driver.findElement(By.name('password'));
        await passwordField.sendKeys(testCase.password);
        await driver.sleep(500); // Add delay after entering password

        // Submit the login form
        let submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        await driver.sleep(500); // Add delay to observe the form submission

        //Verify that home page is visible successfully
        await driver.get('http://localhost:4200/login');
        

    } catch (error) {
        console.error(error);
    }
    finally {
        await driver.quit();
    }

}

// Gọi hàm thực thi test
runAddVoucherTest();


