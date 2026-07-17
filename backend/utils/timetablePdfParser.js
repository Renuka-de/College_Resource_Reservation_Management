const pdfParse = require('pdf-parse');

function normalizeText(text) {
  return (text || '').replace(/\r/g, '').trim();
}

function classifyDocument(text) {
  const normalized = normalizeText(text).toLowerCase();

  if (normalized.includes('programme and branch') || normalized.includes('semester') || normalized.includes('batch')) {
    return { type: 'timetable', confidence: 0.95 };
  }

  if (normalized.includes('pdf')) {
    return { type: 'normal-pdf', confidence: 0.6 };
  }

  return { type: 'unknown', confidence: 0.2 };
}

function extractBatchName(text) {
  const metadata = extractDocumentMetadata(text);
  return metadata.batchName || metadata.batch || null;
}

function extractDocumentMetadata(text) {
  const normalized = normalizeText(text);
  const metadata = {
    batchName: null,
    semester: null,
    batch: null,
    wefDate: null,
    classroom: null,
    classAdvisor: null,
    hallNumber: null
  };

  const batchHeaderMatch = normalized.match(/PROGRAMME\s+AND\s+BRANCH\s+WITH\s+SEMESTER\s+AND\s+BATCH\s*:\s*([^\n\r]+)/i);
  if (batchHeaderMatch && batchHeaderMatch[1]) {
    metadata.batchName = batchHeaderMatch[1].trim();
  }

  const semesterMatch = normalized.match(/([IVX]+)\s+SEMESTER/i) || normalized.match(/SEMESTER\s*[:\-–]?\s*([IVX]+)\b/i);
  if (semesterMatch && semesterMatch[1]) {
    metadata.semester = semesterMatch[1].toUpperCase();
  }

  const batchMatch = normalized.match(/\b([A-Z]\s+BATCH)\b/i) || normalized.match(/\b([A-Z]+\s+BATCH)\b/i);
  if (batchMatch && batchMatch[1]) {
    metadata.batch = batchMatch[1].trim();
  }

  const wefMatch = normalized.match(/W\.E\.F\s*[:\-–]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/i);
  if (wefMatch && wefMatch[1]) {
    metadata.wefDate = normalizeDate(wefMatch[1]);
  }

  const classroomMatch = normalized.match(/CLASS\s+ROOM\s+AND\s+CLASS\s+ADVISOR\s*:\s*([^\n\r]+)/i);
  if (classroomMatch && classroomMatch[1]) {
    const classroomText = classroomMatch[1].trim();
    metadata.classroom = classroomText;

    const hallMatch = classroomText.match(/hall\.no\s*:??\s*(\d+[a-z]?)/i) || classroomText.match(/hall\s*no\s*:??\s*(\d+[a-z]?)/i) || classroomText.match(/\((?:hall\.no|hall no)\s*:??\s*(\d+[a-z]?)\)/i);
    if (hallMatch && hallMatch[1]) {
      metadata.hallNumber = hallMatch[1];
    }

    const advisorMatch = classroomText.match(/class\s+advisor\s*:\s*([^,\n]+)/i) || classroomText.match(/advisor\s*[:\-–]?\s*([^,\n]+)/i);
    if (advisorMatch && advisorMatch[1]) {
      metadata.classAdvisor = advisorMatch[1].trim();
    }
  }

  if (metadata.batchName) {
    metadata.batchName = metadata.batchName.replace(/\s+W\.E\.F\s*[:\-–]?\s*.*$/i, '').trim();
  }

  if (!metadata.batchName && metadata.batch) {
    metadata.batchName = `${metadata.batch}`;
  }

  if (!metadata.batchName) {
    const fallbackMatch = normalized.match(/(B\.E\s+CSE\s*[–-]+\s*[IVX]+\s+SEMESTER\s*[–-]+\s*[A-Z\s]+BATCH)/i)
      || normalized.match(/(B\.\s*E\s*CSE\s*[–-\s]+\s*[IVX]+\s+SEMESTER\s*[–-\s]+\s*[A-Z\s]+BATCH)/i)
      || normalized.match(/([A-Z\.]+[\.]?\s*CSE\s*[–-\s]+\s*[IVX]+\s+SEMESTER\s*[–-\s]+\s*[A-Z\s]+BATCH)/i);
    if (fallbackMatch && fallbackMatch[1]) {
      metadata.batchName = fallbackMatch[1].trim();
    }
  }

  return metadata;
}

function normalizeDate(value) {
  const cleaned = value.trim();
  const parts = cleaned.split(/[\/.-]/).filter(Boolean);
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function romanToNumber(value) {
  const roman = (value || '').toUpperCase();
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let index = 0; index < roman.length; index += 1) {
    const current = map[roman[index]];
    const next = map[roman[index + 1]];
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

function getBookingWindow(metadata) {
  const startDate = metadata.wefDate || null;
  let endDate = null;

  if (!startDate) {
    return { startDate: null, endDate: null };
  }

  const start = new Date(`${startDate}T00:00:00`);
  const semesterNumber = romanToNumber(metadata.semester);
  const isOddSemester = semesterNumber ? semesterNumber % 2 === 1 : false;

  if (isOddSemester) {
    endDate = new Date(start.getFullYear(), 11, 31);
  } else {
    endDate = new Date(start.getFullYear() + 1, 4, 31);
  }

  return {
    startDate,
    endDate: formatDate(endDate)
  };
}

function parseTimetablePDF(text, startDate, endDate) {
  const metadata = extractDocumentMetadata(text);
  const bookingWindow = getBookingWindow(metadata);
  const windowStart = startDate || bookingWindow.startDate;
  const windowEnd = endDate || bookingWindow.endDate;
  const bookings = [];
  const normalized = normalizeText(text);
  const lines = normalized.split('\n');

  const hallPatterns = [
    /hall\.no\s*:??\s*(\d+[a-z]?)/gi,
    /hall\s*no\s*:??\s*(\d+[a-z]?)/gi,
    /\(hall\.no\s*:??\s*(\d+[a-z]?)\)/gi,
    /kp-?\s*\(?hall\.no\s*:??\s*(\d+[a-z]?)\)?/gi,
    /kp-?\s*(\d+[a-z]?)/gi,
    /hall-?\s*(\d+[a-z]?)/gi,
    /room-?\s*(\d+[a-z]?)/gi,
    /(\d{3,4}[a-z]?)/g
  ];

  const timePattern = /(\d{1,2})[.:](\d{2})\s*(?:am|pm)?\s*[-–—]\s*(\d{1,2})[.:](\d{2})\s*(?:am|pm)?/gi;
  const dayPatterns = {
    monday: /monday|mon/gi,
    tuesday: /tuesday|tue/gi,
    wednesday: /wednesday|wed/gi,
    thursday: /thursday|thu/gi,
    friday: /friday|fri/gi,
    saturday: /saturday|sat/gi,
    sunday: /sunday|sun/gi
  };

  const daysFound = Object.entries(dayPatterns).filter(([, pattern]) => pattern.test(normalized)).map(([day]) => day);
  const days = daysFound.length > 0 ? daysFound : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  const timeSlots = [];
  let timeMatch;
  while ((timeMatch = timePattern.exec(normalized)) !== null) {
    const startHour = parseInt(timeMatch[1], 10);
    const startMin = parseInt(timeMatch[2], 10);
    const endHour = parseInt(timeMatch[3], 10);
    const endMin = parseInt(timeMatch[4], 10);

    let startHour24 = startHour;
    let endHour24 = endHour;
    const timeStr = timeMatch[0].toLowerCase();

    if (timeStr.includes('pm')) {
      if (startHour < 12) startHour24 += 12;
      if (endHour < 12) endHour24 += 12;
    } else if (timeStr.includes('am') && startHour === 12) {
      startHour24 = 0;
    } else if (timeStr.includes('am') && endHour === 12) {
      endHour24 = 0;
    }

    timeSlots.push({
      startTime: `${String(startHour24).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
      endTime: `${String(endHour24).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
      lineIndex: normalized.substring(0, timeMatch.index).split('\n').length - 1
    });
  }

  const halls = new Map();
  const seenHallNumbers = new Set();

  for (const pattern of hallPatterns) {
    const regex = new RegExp(pattern.source, 'gi');
    let match;
    while ((match = regex.exec(normalized)) !== null) {
      const hallNumber = String(match[1] || match[0]);
      if (seenHallNumbers.has(hallNumber)) continue;
      seenHallNumbers.add(hallNumber);
      const hallName = `KP-${hallNumber}`;
      const lineIndex = normalized.substring(0, match.index).split('\n').length - 1;
      if (!halls.has(hallName)) {
        halls.set(hallName, { lineIndex, hallNumber });
      }
    }
  }

  if (halls.size === 0) {
    return [];
  }

  const start = new Date(windowStart);
  const end = new Date(windowEnd);
  const allDates = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    allDates.push(new Date(date));
  }

  const dayNameToNumber = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  const relevantDates = allDates.filter((date) => {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    return days.includes(dayName);
  });

  for (const bookingDate of relevantDates) {
    const dateStr = formatDate(bookingDate);
    for (const [hallName, hallData] of halls.entries()) {
      if (timeSlots.length > 0) {
        for (const slot of timeSlots) {
          const lineDiff = Math.abs(hallData.lineIndex - slot.lineIndex);
          if (lineDiff <= 10) {
            bookings.push({ hall: hallName, date: dateStr, startTime: slot.startTime, endTime: slot.endTime });
          }
        }
      } else {
        for (let hour = 9; hour < 17; hour += 1) {
          bookings.push({ hall: hallName, date: dateStr, startTime: `${String(hour).padStart(2, '0')}:00`, endTime: `${String(hour + 1).padStart(2, '0')}:00` });
        }
      }
    }
  }

  return bookings;
}

function buildCalendarEvents(slots, batchName, userName) {
  return (slots || []).map((slot) => ({
    summary: `${batchName} - ${slot.hall}`,
    location: slot.hall,
    start: `${slot.date}T${slot.startTime}:00`,
    end: `${slot.date}T${slot.endTime}:00`,
    description: `Booked by ${userName}`
  }));
}

async function parsePdfBuffer(buffer) {
  const parsed = await pdfParse(buffer);
  return parsed.text;
}

module.exports = {
  classifyDocument,
  extractBatchName,
  extractDocumentMetadata,
  getBookingWindow,
  parseTimetablePDF,
  buildCalendarEvents,
  parsePdfBuffer
};
