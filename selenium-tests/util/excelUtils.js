const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

/**
 * Reads data from an Excel file and maps it to a structured object
 *
 * @param {string} filePath - Path to the Excel file
 * @param {Object} structure - Object defining how to map Excel columns to properties
 *                            e.g., { email: 'email', password: 'password' }
 * @param {string} sheetName - Optional sheet name (uses first sheet if not specified)
 * @returns {Array} Array of objects with the defined structure
 */
function readExcelFile(filePath, structure, sheetName = null) {
  try {
    // Resolve path if relative
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Excel file not found at: ${absolutePath}`);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(absolutePath);

    // Get the sheet (first sheet if not specified)
    const sheet = sheetName
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error(
        `Sheet ${sheetName || "first sheet"} not found in the Excel file`,
      );
    }

    // Convert sheet to JSON
    const rawData = XLSX.utils.sheet_to_json(sheet);

    // Map the raw data to the defined structure
    return rawData.map((row) => {
      const mappedObject = {};

      // Map each property according to the structure
      Object.entries(structure).forEach(([propName, excelColumn]) => {
        mappedObject[propName] = row[excelColumn];
      });

      return mappedObject;
    });
  } catch (error) {
    console.error(`Error reading Excel file: ${error.message}`);
    throw error;
  }
}

/**
 * Writes data to an Excel file
 *
 * @param {string} filePath - Path to save the Excel file
 * @param {Array} data - Array of objects to write to the file
 * @param {Object} structure - Object defining how to map properties to Excel columns
 *                            e.g., { email: 'Email Address', password: 'Password' }
 * @param {string} sheetName - Name for the sheet (defaults to "Sheet1")
 * @returns {boolean} Success status
 */
function writeExcelFile(filePath, data, structure, sheetName = "Sheet1") {
  try {
    // Resolve path if relative
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, filePath);

    // Map the data to the defined structure for the Excel file
    const excelData = data.map((item) => {
      const rowData = {};

      // Map each property according to the structure
      Object.entries(structure).forEach(([propName, excelColumn]) => {
        rowData[excelColumn] = item[propName];
      });

      return rowData;
    });

    // Create a new workbook and add the data
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Write the workbook to the file
    XLSX.writeFile(workbook, absolutePath);

    return true;
  } catch (error) {
    console.error(`Error writing Excel file: ${error.message}`);
    throw error;
  }
}

module.exports = {
  readExcelFile,
  writeExcelFile,
};
