/*
 * A Google Apps Script for templating and then emailing the Smedley D. Butler
 * Brigade (Chapter 9 of Veterans for Peace) Weekly Bulletin using an associated
 * Google Sheet of member submissions (ideally but not necessarily funneled
 * through a Google Form).
 *
 * Resources:
 *   https://developers.google.com/apps-script/guides/html/templates
 *   https://developers.google.com/apps-script/guides/html/best-practices
 *   https://stackoverflow.com/a/43844650
 *   https://developers.google.com/apps-script/reference/mail/mail-app
 *   https://github.com/gsuitedevs/apps-script-samples/tree/master/tasks/simpleTasks
 *   https://material.io/tools/icons/?icon=calendar_today&style=baseline
 *
 * TODO:
 *   Read more/show less: https://www.campaignmonitor.com/dev-resources/guides/mobile/
 *   d3.js integration?: https://script.google.com/macros/s/AKfycbx_YsQJlbjs8kzUiUlq2JhPRnl4e_1jaYNgHuEQ7Ezs83BfZSk/exec
 *   mobile-friendly: https://mail.google.com/mail/u/1/#search/weekly+newsletter+vfp/FMfcgxwBVgsZmwRjZcMSCFdTClBGLHQd
 */

// NOTE: Slicing the 'about' from end of FB event URL can prevent errors.
// NOTE: Logic currently assumes all entries have images, will fail if
// submitting entries with no image or empty entries.

function formatAMPM(date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // The hour '0' should be '12'.
  minutes = minutes === 0 ? '' : minutes < 10 ? ':0' + minutes : ':' + minutes
  return hours + minutes + ' ' + ampm
}

function getBulletinImages() {
  var inlineImages = {}
  var icons = [
    {id: '_____', name: 'iconFacebook'},
    {id: '_____', name: 'iconGlobe'},
    {id: '_____', name: 'iconPlace'},
    {id: '_____', name: 'iconTime'},
    {id: '_____', name: 'iconTwitter'}
  ]
  var entries = getEntries()

  for (var i = 0; i < icons.length; i++) {
    inlineImages[icons[i].name] = DriveApp
      .getFileById(icons[i].id)
      .getBlob()
      .setName(icons[i].name + 'Blob')
  }

  for (var i = 0; i < entries.length; i++) {
    inlineImages['entryImage' + i] = DriveApp
      .getFileById(entries[i][4].slice(33))
      .getBlob()
      .setName('entryImage' + i + 'Blob')
  }
  return inlineImages
}

function getContentHtmlOutput(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

function getContentTemplate(filename) {
  return HtmlService
    .createTemplateFromFile(filename)
    .evaluate()
    .getContent()
}

function getDateAndTime(dayDateObject, startTimeDateObject, endTimeDateObject) {
  var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  var day = dayDateObject.getDate()
  var month = months[dayDateObject.getMonth()]
  var startTime = startTimeDateObject.getHours() + ':' + startTimeDateObject.getMinutes()
  var startTime = formatAMPM(startTimeDateObject)
  var endTime = endTimeDateObject && formatAMPM(endTimeDateObject)

  if (!endTime) {
    var dateAndTime = month + ' ' + day + ' at ' + startTime
  } else {
    var dateAndTime = month + ' ' + day + ' at ' + startTime + ' – ' + endTime
  }

  return dateAndTime
}

function getEntries() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  var lastRow = sheet.getLastRow() - 1
  var lastColumn = sheet.getLastColumn()
  return sheet.getRange(2, 1, lastRow, lastColumn).getValues()
}

function getSelectedFile(fileId){
  return DriveApp.getFileById(fileId).getBlob()
}

function sendEmails() {
  Logger.log(
    'Remaining daily email quota: ' +
    MailApp.getRemainingDailyQuota()
  )

  var entries = getEntries()
  MailApp.sendEmail({
    to: '_____',
    subject: 'Weekly Bulletin',
    htmlBody: getContentTemplate('Bulletin__template'),
    inlineImages: getBulletinImages()
  })
}
