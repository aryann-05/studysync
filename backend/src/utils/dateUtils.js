/**
 * Date utility functions for StudySync scheduling and analytics
 */

/**
 * Format Date to YYYY-MM-DD string
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateOnly = (date) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD string into a normalized UTC Date object
 * @param {string} dateString
 * @returns {Date}
 */
export const parseDateOnly = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
};

/**
 * Calculate the number of whole days between two dates (date2 - date1)
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
export const daysDifference = (date1, date2) => {
  const d1 = parseDateOnly(typeof date1 === "string" ? date1 : formatDateOnly(date1));
  const d2 = parseDateOnly(typeof date2 === "string" ? date2 : formatDateOnly(date2));
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
};

/**
 * Add days to a given date
 * @param {Date|string} date
 * @param {number} days
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const base = parseDateOnly(typeof date === "string" ? date : formatDateOnly(date));
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/**
 * Get current UTC date normalized to 00:00:00
 * @returns {Date}
 */
export const getTodayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
};

/**
 * Calculate study streak in consecutive days based on completed session dates
 * @param {Array<{ scheduled_date: Date|string, completed_at: Date|string }>} completedSessions
 * @returns {number}
 */
export const calculateStreak = (completedSessions = []) => {
  if (!completedSessions || completedSessions.length === 0) return 0;

  // Extract unique active dates sorted descending
  const uniqueDates = Array.from(
    new Set(
      completedSessions
        .map((s) => {
          const raw = s.completed_at || s.scheduled_date;
          return raw ? formatDateOnly(raw) : null;
        })
        .filter(Boolean)
    )
  ).sort().reverse();

  if (uniqueDates.length === 0) return 0;

  const todayStr = formatDateOnly(new Date());
  const yesterdayStr = formatDateOnly(addDays(new Date(), -1));

  // Streak must be active today or yesterday
  const mostRecent = uniqueDates[0];
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = parseDateOnly(mostRecent);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = parseDateOnly(uniqueDates[i]);
    const diff = daysDifference(prevDate, currentDate);

    if (diff === 1) {
      streak += 1;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

