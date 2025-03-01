/**
 * Helper functions for Selenium tests
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { TIMEOUTS, BASE_URL } = require('./config');

/**
 * Setup a new WebDriver instance
 * @param {boolean} headless - Whether to run in headless mode
 * @returns {WebDriver} - Selenium WebDriver instance
 */
async function setupDriver(headless = false) {
  let options = new chrome.Options();
  
  // Set headless mode properly for newer versions of Selenium
  if (headless) {
    options.addArguments('--headless=new');
  }
  
  // Add additional options to help with stability
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  
  try {
    console.log('Attempting to build WebDriver...');
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('WebDriver built successfully');
    
    // Set timeouts
    await driver.manage().setTimeouts({
      implicit: TIMEOUTS.implicit,
      pageLoad: TIMEOUTS.pageLoad,
      script: TIMEOUTS.script
    });
    
    // Maximize window for consistent testing
    await driver.manage().window().maximize();
    
    return driver;
  } catch (error) {
    console.error('Error setting up WebDriver:', error.message);
    throw error;
  }
}

/**
 * Navigate to a specific URL
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} path - Path to navigate to
 */
async function navigateTo(driver, path) {
  try {
    console.log(`Navigating to ${BASE_URL}${path}`);
    await driver.get(`${BASE_URL}${path}`);
    console.log(`Successfully navigated to ${BASE_URL}${path}`);
  } catch (error) {
    console.error(`Error navigating to ${BASE_URL}${path}:`, error.message);
    throw error;
  }
}

/**
 * Find an element and wait until it's visible
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} selector - CSS selector for the element
 * @param {number} timeout - Timeout in milliseconds
 * @returns {WebElement} - Found element
 */
async function findElement(driver, selector, timeout = TIMEOUTS.implicit) {
  const element = await driver.wait(
    until.elementLocated(By.css(selector)),
    timeout,
    `Element not found: ${selector}`
  );
  
  await driver.wait(
    until.elementIsVisible(element),
    timeout,
    `Element not visible: ${selector}`
  );
  
  return element;
}

/**
 * Type text into an input field
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} selector - CSS selector for the input
 * @param {string} text - Text to type
 */
async function typeInto(driver, selector, text) {
  const element = await findElement(driver, selector);
  await element.clear();
  await element.sendKeys(text);
}

/**
 * Click an element
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} selector - CSS selector for the element
 */
async function clickElement(driver, selector) {
  const element = await findElement(driver, selector);
  await element.click();
}

/**
 * Get text from an element
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} selector - CSS selector for the element
 * @returns {string} - Element text
 */
async function getElementText(driver, selector) {
  const element = await findElement(driver, selector);
  return await element.getText();
}

/**
 * Check if an element exists
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} selector - CSS selector for the element
 * @returns {boolean} - Whether the element exists
 */
async function elementExists(driver, selector, timeout = 5000) {
  try {
    await driver.wait(until.elementLocated(By.css(selector)), timeout);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for URL to contain a specific string
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} urlFragment - URL fragment to wait for
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForUrlToContain(driver, urlFragment, timeout = TIMEOUTS.implicit) {
  await driver.wait(
    until.urlContains(urlFragment),
    timeout,
    `URL did not contain ${urlFragment} within ${timeout}ms`
  );
}

module.exports = {
  setupDriver,
  navigateTo,
  findElement,
  typeInto,
  clickElement,
  getElementText,
  elementExists,
  waitForUrlToContain
};
