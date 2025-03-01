/**
 * Simple browser test to check if we can open a browser and navigate to the site
 */

const { setupDriver, navigateTo } = require('./helpers');
const { BASE_URL, URLS } = require('./config');

async function testBrowser() {
  console.log('Starting browser test...');
  console.log(`Target URL: ${BASE_URL}`);
  
  let driver;
  
  try {
    // Try both headless and non-headless modes
    console.log('Attempting to create browser in headless mode...');
    driver = await setupDriver(true);
    console.log('Browser created in headless mode');
    
    console.log(`Navigating to ${BASE_URL}${URLS.login}`);
    await navigateTo(driver, URLS.login);
    console.log('Navigation successful');
    
    const title = await driver.getTitle();
    console.log(`Page title: ${title}`);
    
    const url = await driver.getCurrentUrl();
    console.log(`Current URL: ${url}`);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during browser test:', error);
  } finally {
    if (driver) {
      console.log('Closing browser...');
      await driver.quit();
      console.log('Browser closed');
    }
  }
}

// Run the test
testBrowser().catch(error => {
  console.error('Unhandled error in test:', error);
  process.exit(1);
});
