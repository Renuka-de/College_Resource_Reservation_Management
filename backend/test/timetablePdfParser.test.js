const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyDocument, extractBatchName, buildCalendarEvents, extractDocumentMetadata, getBookingWindow } = require('../utils/timetablePdfParser');

test('classifies timetable text and extracts batch name', () => {
  const text = `PROGRAMME AND BRANCH WITH SEMESTER AND BATCH: B.E CSE – IV SEMESTER – N BATCH
Hall.No:105
09:00-10:00
Monday`;

  const classification = classifyDocument(text);
  const batchName = extractBatchName(text);

  assert.equal(classification.type, 'timetable');
  assert.equal(batchName, 'B.E CSE – IV SEMESTER – N BATCH');
});

test('extracts timetable metadata and computes the booking window for even semesters', () => {
  const text = `PROGRAMME AND BRANCH WITH SEMESTER AND BATCH: B.E CSE – VI SEMESTER – P BATCH W.E.F: 10/12/2025
CLASS ROOM AND CLASS ADVISOR: I-Floor K.P(Hall.No:209)`;

  const metadata = extractDocumentMetadata(text);
  const window = getBookingWindow(metadata);

  assert.equal(metadata.semester, 'VI');
  assert.equal(metadata.batch, 'P BATCH');
  assert.equal(metadata.wefDate, '2025-12-10');
  assert.equal(metadata.hallNumber, '209');
  assert.equal(window.endDate, '2026-05-31');
});

test('computes the booking window for odd semesters', () => {
  const text = `PROGRAMME AND BRANCH WITH SEMESTER AND BATCH: B.E CSE – V SEMESTER – N BATCH W.E.F: 10/08/2025
CLASS ROOM AND CLASS ADVISOR: I-Floor K.P(Hall.No:105)`;

  const metadata = extractDocumentMetadata(text);
  const window = getBookingWindow(metadata);

  assert.equal(metadata.semester, 'V');
  assert.equal(window.endDate, '2025-12-31');
});

test('builds calendar events from parsed timetable slots', () => {
  const slots = [
    { hall: 'KP-105', date: '2026-07-20', startTime: '09:00', endTime: '10:00' }
  ];

  const events = buildCalendarEvents(slots, 'B.E CSE – IV SEMESTER – N BATCH', 'User');

  assert.equal(events.length, 1);
  assert.equal(events[0].summary, 'B.E CSE – IV SEMESTER – N BATCH - KP-105');
  assert.equal(events[0].location, 'KP-105');
});
