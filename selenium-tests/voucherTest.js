const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function voucherTest() {
    let testCases = [
        {
            code: 'COL1234567891',
            discount: '100',
            voucherPrice: '20%',
            startDate: '01/11/2024',
            endDate: '30/11/2024',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Thêm khuyến mãi thành công',
            messageSelector: '.success-message',
            descriptionTest: 'Thêm khuyến mãi hợp lệ'
        },
        {
            code: 'COX1234567892',
            discount: '100',
            voucherPrice: '20%',
            startDate: '01/11/2024',
            endDate: '30/11/2024',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Code không hợp lệ',
            messageSelector: '.error-message',
            descriptionTest: 'Thêm khuyến mãi với code không hợp lệ'
        },
        {
            code: '',
            discount: '100',
            voucherPrice: '20%',
            startDate: '01/11/2024',
            endDate: '30/11/2024',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Thiếu thông tin bắt buộc',
            messageSelector: '.error-message',
            descriptionTest: 'Thêm khuyến mãi khi thiếu thông tin'
        },
        {
            code: 'COL1234567893',
            discount: '100',
            voucherPrice: '-10%',
            startDate: '01/11/2024',
            endDate: '30/11/2024',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Giá trị không hợp lệ',
            messageSelector: '.error-message',
            descriptionTest: 'Thêm khuyến mãi với giá trị không hợp lệ'
        },
        {
            code: 'COL1234567894',
            discount: '-5',
            voucherPrice: '20%',
            startDate: '01/11/2024',
            endDate: '30/11/2024',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Số lượng không hợp lệ',
            messageSelector: '.quantity-error',
            descriptionTest: 'Thêm khuyến mãi không thành công với số lượng không hợp lệ'
        },
        {
            code: 'COL1234567895',
            discount: '100',
            voucherPrice: '20%',
            startDate: '30/11/2024',
            endDate: '01/11/2024',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Ngày hết hạn phải sau ngày hiệu lực',
            messageSelector: '.date-error',
            descriptionTest: 'Thêm khuyến mãi không thành công khi ngày hết hạn trước ngày hiệu lực'
        },
        {
            code: 'COL1234567896',
            discount: '0',
            voucherPrice: '0%',
            startDate: '01/11/2024',
            endDate: '30/11/2024',
            applicablePrice: '100000',
            description: 'Khuyến mãi miễn phí',
            expectedMessage: 'Thêm khuyến mãi thành công',
            messageSelector: '.success-message',
            descriptionTest: 'Thêm khuyến mãi với giá trị 0%'
        },
        {
            code: 'COL1234567897',
            discount: '100',
            voucherPrice: '20%',
            startDate: '01/11/2024',
            endDate: '01/12/2024',
            applicablePrice: '100000',
            description: 'Khuyến mãi không hoạt động',
            expectedMessage: 'Thêm khuyến mãi thành công với trạng thái inactive',
            messageSelector: '.info-message',
            descriptionTest: 'Thêm khuyến mãi nhưng trạng thái inactive'
        },
        {
            code: 'COL1234567898',
            discount: '100',
            voucherPrice: '20%',
            startDate: '01/11/2024',
            endDate: '',
            applicablePrice: '500000',
            description: 'Khuyến mãi tháng 11',
            expectedMessage: 'Thêm khuyến mãi không thành công với ngày hết hạn không hợp lệ',
            messageSelector: '.date-error',
            descriptionTest: 'Thêm khuyến mãi với ngày hết hạn không hợp lệ'
        }
    ]
    async function runVoucherTest(testCase) {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            //1.Navigate to the voucher page 
            await driver.get('http://localhost:3000/vouchers');
            console.log("Running test case: " + testCase.description);
            await driver.sleep(500);

            //2.Click button to open form create
            let addButton = await driver.findElement(By.xpath("//button[span[text()='Thêm khuyến mãi sản phẩm']]"));
            await addButton.click();

            await driver.sleep(500);

            //3.Fill form create

            await driver.findElement(By.id('code')).sendKeys(testCase.code);
            await driver.sleep(500);
            await driver.findElement(By.id('discount')).sendKeys(testCase.discount);
            await driver.sleep(500);
            await driver.findElement(By.id('voucherPrice')).sendKeys(testCase.voucherPrice);
            await driver.sleep(500);
            await driver.findElement(By.id('applicablePrice')).sendKeys(testCase.applicablePrice);
            await driver.sleep(500);
            await driver.findElement(By.id('startDate')).sendKeys(testCase.startDate);
            await driver.sleep(500);
            await driver.findElement(By.id('endDate')).sendKeys(testCase.endDate);
            await driver.sleep(500);
            await driver.findElement(By.css('.ql-editor p')).sendKeys(testCase.description);
            await driver.sleep(500);

            let button = await driver.findElement(By.xpath("//button[span[text()='Thêm khuyến mãi']]"));
            await button.click();


            await driver.wait(until.elementLocated(By.css(testCase.messageSelector)), 10000);
        }
        catch (error) {
            console.error(`${testCase.description} Test Failed:`, error);
        } finally {
            await driver.quit();
        }
    }
    for (let testCase of testCases) {
        await runVoucherTest(testCase);
    }
})();