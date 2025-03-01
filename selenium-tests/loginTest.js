const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function loginTests() {
    let testCases = [
        {
            email: 'nguyenquocthang909@gmail.com',
            password: 'Aa@123456',
            expectedMessage: 'Welcome, testuser',
            messageSelector: '.welcome-message',
            description: 'Login with valid email and correct password'
        },
        {
            email: 'invalid-email',
            password: 'password123',
            expectedMessage: 'Invalid email format',
            messageSelector: '.email-error',
            description: 'Error message for invalid email format'
        },
        {
            email: 'testuser@gmail.com',
            password: '123',
            expectedMessage: 'Password must be at least 6 characters',
            messageSelector: '.password-error',
            description: 'Error message for password less than 6 characters'
        },
        {
            email: 'nguyenquocthang909@gmail.com',
            password: 'wrongpassword',
            expectedMessage: 'Incorrect password',
            messageSelector: '.login-error',
            description: 'Unsuccessful login with incorrect password'
        },
        {
            email: 'unregistereduser@gmail.com',
            password: 'password123',
            expectedMessage: 'Account not registered',
            messageSelector: '.login-error',
            description: 'Error message for unregistered account'
        }
    ];

    async function runLoginTest(testCase) {
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

            // Wait for the login to complete (adjust the selector as needed)
            await driver.wait(until.elementLocated(By.css(testCase.messageSelector)), 10000);
        } catch (error) {
            console.error(`${testCase.description} Test Failed:`, error);
        } finally {
            // Quit the driver
            await driver.quit();
        }
    }

    // Run each test case
    for (let testCase of testCases) {
        await runLoginTest(testCase);
    }

})();