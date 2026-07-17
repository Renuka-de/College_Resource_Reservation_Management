const { classifyDocument, extractBatchName, extractDocumentMetadata, parseTimetablePDF, buildCalendarEvents, parsePdfBuffer, getBookingWindow } = require('./timetablePdfParser');

async function processUploadedPdf(buffer, options = {}) {
  const text = await parsePdfBuffer(buffer);
  const classification = classifyDocument(text);

  if (classification.type !== 'timetable') {
    return {
      classification,
      slots: [],
      events: [],
      batchName: null,
      message: 'The uploaded document does not look like a timetable PDF.'
    };
  }

  const metadata = extractDocumentMetadata(text);
  const batchName = metadata.batchName || extractBatchName(text) || options.batchName || 'Timetable Batch';
  const bookingWindow = getBookingWindow(metadata);
  const slots = parseTimetablePDF(text, options.startDate || bookingWindow.startDate, options.endDate || bookingWindow.endDate);
  const events = buildCalendarEvents(slots, batchName, options.userName || 'User');

  return {
    classification,
    slots,
    events,
    batchName,
    metadata,
    bookingWindow,
    message: 'Timetable processed successfully.'
  };
}

module.exports = {
  processUploadedPdf
};
