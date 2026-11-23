/**
 * StudySync Modified SM-2 Spaced Repetition Algorithm
 *
 * Confidence score q:
 * 1 = Complete Failure
 * 2 = Poor
 * 3 = Medium
 * 4 = Good
 * 5 = Perfect Mastery
 */

/**
 * Calculate updated Ease Factor (EF) using the SuperMemo SM-2 formula
 * Clamped to a minimum of 1.30
 *
 * @param {number} oldEF - Current Ease Factor (default 2.50)
 * @param {number} q - User confidence rating (1 to 5)
 * @returns {number} New Ease Factor rounded to 2 decimal places
 */
export const calculateEaseFactor = (oldEF, q) => {
  const currentEF = Number(oldEF) || 2.5;
  const rating = Number(q);

  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
  const newEF = Math.max(1.3, currentEF + delta);

  return Math.round(newEF * 100) / 100;
};

/**
 * Calculate new repetition number and interval (in days) based on SM-2 rules
 *
 * @param {number} currentRepetition - Existing repetition counter on topic
 * @param {number} ef - Updated Ease Factor
 * @param {number} q - Confidence score (1 to 5)
 * @param {number} [lastInterval=1] - Duration of the previous interval in days
 * @returns {{ newRepetitionNumber: number, nextIntervalDays: number, requiresRemedial: boolean }}
 */
export const calculateNextReviewInterval = (currentRepetition, ef, q, lastInterval = 1) => {
  const rep = Number(currentRepetition) || 0;
  const rating = Number(q);

  // If confidence is low (q < 3: complete failure or poor)
  if (rating < 3) {
    return {
      newRepetitionNumber: 1,
      nextIntervalDays: 1,
      requiresRemedial: true,
    };
  }

  // If confidence is acceptable or mastery (q >= 3)
  const nextRep = rep + 1;
  let nextIntervalDays = 1;

  if (nextRep === 1) {
    nextIntervalDays = 1;
  } else if (nextRep === 2) {
    nextIntervalDays = 6;
  } else {
    const prevInt = lastInterval >= 6 ? lastInterval : 6;
    nextIntervalDays = Math.round(prevInt * ef);
  }

  return {
    newRepetitionNumber: nextRep,
    nextIntervalDays: Math.max(1, nextIntervalDays),
    requiresRemedial: false,
  };
};

export default {
  calculateEaseFactor,
  calculateNextReviewInterval,
};

