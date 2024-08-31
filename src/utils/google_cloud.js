const { resolve } = require('path');
const { google } = require('googleapis');
require('dotenv').config()
const keyFilenameSheet = resolve(process.cwd(), 'src', 'utils', 'google.json');

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilenameSheet, 
  scopes: ['https://www.googleapis.com/auth/spreadsheets']  
});



 const readSheets = async (list ,rangeCut) => {
    console.log(process.env.SHEETID);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SHEETID;
  const range = `${list}!${rangeCut}`;  // Specifies the range to read.

  try {
      const response = await sheets.spreadsheets.values.get({
          spreadsheetId, range
      });
      const rows = response.data.values;  // Extracts the rows from the response.
      return rows;  // Returns the rows.
  } catch (error) {
      console.error('error sheet', error);  // Logs errors.
  }
}

const writeToSheet = async (list,rangeCut, values) => {
    const sheets = google.sheets({ version: 'v4', auth });  // Creates a Sheets API client instance.
    const spreadsheetId = process.env.SHEETID;
    const range = `${list}!${rangeCut}`;  // The range in the sheet where data will be written.
    const valueInputOption = 'USER_ENTERED';  // How input data should be interpreted.

    const resource = { values };  // The data to be written.

    try {
        const res = await sheets.spreadsheets.values.update({
            spreadsheetId, range, valueInputOption, resource
        })
        return res;  // Returns the response from the Sheets API.
    } catch (error) {
        console.error('error', error);  // Logs errors.
    }
}

module.exports= {
    readSheets,
    writeToSheet
}


