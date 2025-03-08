const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function registerTests() {
    let testCases = [
        {
            email: 'testuser1@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            expectedMessage: 'Registration successful',
            messageSelector: '.success-message',
            description: 'Register with valid email and valid password'
        },
        {
            email: 'invalid-email',
            password: 'password123',
            confirmPassword: 'password123',
            expectedMessage: 'Invalid email format',
            messageSelector: '.email-error',
            description: 'Error message for invalid email format'
        },
        {
            email: 'testuser@gmail.com',
            password: '123',
            confirmPassword: '123',
            expectedMessage: 'Password must be at least 6 characters',
            messageSelector: '.password-error',
            description: 'Error message for password less than 6 characters'
        },
        {
            email: 'testuser@gmail.com',
            password: 'password123',
            confirmPassword: 'password456',
            expectedMessage: 'Passwords do not match',
            messageSelector: '.confirm-password-error',
            description: 'Error message for non-matching passwords'
        },
        {
            email: 'nguyenquocthang909@gmail.com',
            password: 'password123',
            confirmPassword: 'password123',
            expectedMessage: 'Email already exists',
            messageSelector: '.email-error',
            description: 'Error message for existing email'
        }
    ];

    async function runRegisterTest(testCase) {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            // Navigate to the registration page
            await driver.get('http://localhost:4200/register');
            console.log("testcase: " + testCase.description);


            // Add delay to ensure the page is fully loaded
            await driver.sleep(500);

            // Fill out the registration form
            let emailField = await driver.findElement(By.name('email'));
            await emailField.sendKeys(testCase.email);
            await driver.sleep(500); // Add delay after entering email

            let passwordField = await driver.findElement(By.name('password'));
            await passwordField.sendKeys(testCase.password);
            await driver.sleep(500); // Add delay after entering password

            let confirmPasswordField = await driver.findElement(By.name('confirmPassword'));
            await confirmPasswordField.sendKeys(testCase.confirmPassword);
            await driver.sleep(500); // Add delay after entering confirm password

            // Submit the registration form
            let submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
            await driver.sleep(500); // Add delay to observe the form submission

            // Wait for the registration to complete (adjust the selector as needed)
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
        await runRegisterTest(testCase);
    }

})();