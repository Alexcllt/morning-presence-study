const RESPONSES_SHEET = "Responses";
const EVENTS_SHEET = "Events";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse((e.parameter && e.parameter.payload) || "{}");
    const eventType = String(payload.event_type || "survey_completed");
    const sheetName = eventType === "survey_completed" ? RESPONSES_SHEET : EVENTS_SHEET;

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

    appendFlexibleRow_(sheet, payload);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, sheet:sheetName}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(error)}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function appendFlexibleRow_(sheet, payload) {
  const keys = Object.keys(payload);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(keys);
  }

  let headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const missing = keys.filter(key => !headers.includes(key));

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
    headers = headers.concat(missing);
  }

  const row = headers.map(header => {
    const value = payload[header];
    if (Array.isArray(value)) return value.join(" | ");
    if (value === null || value === undefined) return "";
    return value;
  });

  sheet.appendRow(row);
}

function doGet() {
  return ContentService.createTextOutput(
    "Morning Presence V5 endpoint active."
  );
}
