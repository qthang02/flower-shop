# Flower Shop - Selenium Automation Tests

This directory contains automated tests for the Flower Shop application using Selenium WebDriver and Jest.

## Setup

1. Install the required dependencies:

```bash
cd tests
npm install
```

2. Make sure you have Chrome browser installed on your system.

3. Update the `config.js` file with your specific test environment settings:
   - `BASE_URL`: The URL of your application (default: http://localhost:5173)
   - `TEST_USER`: Test user credentials
   - Selectors: If the HTML structure changes, update the selectors accordingly

## Running Tests

Make sure your application is running locally before executing the tests.

### Run all tests

```bash
npm test
```

### Run authentication tests only

```bash
npm run test:auth
```

## Test Structure

- `config.js`: Contains configuration settings like URLs, test user credentials, and CSS selectors
- `helpers.js`: Helper functions for common Selenium operations
- `auth.test.js`: Tests for login and registration functionality

## Test Coverage

### Login Tests
- Display of login form
- Validation errors for empty fields
- Error handling for invalid credentials
- Password visibility toggle
- Navigation to registration page
- Successful login with valid credentials

### Registration Tests
- Display of registration form
- Validation errors for empty fields
- Error handling for password mismatch
- Password visibility toggle
- Navigation to login page
- Successful user registration

## Troubleshooting

1. **Tests fail due to element not found**: Check if the selectors in `config.js` match your application's HTML structure.

2. **Login/Registration tests fail**: Ensure the test user exists in your database for login tests, or doesn't exist for registration tests.

3. **Browser doesn't start**: Make sure you have the correct version of Chrome installed and that chromedriver is compatible.

4. **Timeouts**: If tests are timing out, you may need to adjust the timeout values in `config.js`.

## Adding More Tests

To add more tests:
1. Create a new test file (e.g., `profile.test.js`)
2. Add relevant selectors to `config.js`
3. Import helper functions from `helpers.js`
4. Write your test cases following the same pattern as existing tests
