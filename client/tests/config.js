/**
 * Test configuration for Selenium tests
 */

// Base URL for the application
const BASE_URL = 'http://localhost:4200'; // Update this with your actual development server URL

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test@123',
  invalidEmail: 'invalid@example.com',
  invalidPassword: 'wrong123'
};

// Timeouts
const TIMEOUTS = {
  implicit: 10000, // 10 seconds implicit wait
  pageLoad: 30000, // 30 seconds page load timeout
  script: 30000 // 30 seconds script timeout
};

// Selectors for login page
const LOGIN_SELECTORS = {
  emailInput: 'input#email',
  passwordInput: 'input#password',
  showPasswordButton: 'button[aria-label="Toggle password visibility"]',
  loginButton: 'button[type="submit"]',
  errorMessage: '.text-red-500',
  registerLink: 'a[href="/register"]'
};

// Selectors for register page
const REGISTER_SELECTORS = {
  emailInput: 'input#email',
  passwordInput: 'input#password',
  confirmPasswordInput: 'input#confirmPassword',
  showPasswordButton: 'button[aria-label="Toggle password visibility"]',
  registerButton: 'button[type="submit"]',
  errorMessage: '.text-red-500',
  loginLink: 'a[href="/login"]'
};

// URLs
const URLS = {
  home: '/',
  login: '/login',
  register: '/register'
};

module.exports = {
  BASE_URL,
  TEST_USER,
  TIMEOUTS,
  LOGIN_SELECTORS,
  REGISTER_SELECTORS,
  URLS
};
