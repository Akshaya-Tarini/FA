const Task = require('../models/Task');
const { getToken, fetchDataset } = require('./apiService');
const { validateRecord, sanitizeRecord } = require('../utils/validator');

/**
 * Full sync pipeline: authenticate → fetch → validate → sanitize → persist
 */
const syncData = async () => {
  // Step 1: Obtain token
  const token = await getToken(
    process.env.STUDENT_ID,
    process.env.STUDENT_PASSWORD
  );

  // Step 2: Fetch dataset
  const rawData = await fetchDataset(token);
  const records = Array.isArray(rawData) ? rawData : rawData.data || rawData.tasks || [];

  const stats = {
    totalFetched: records.length,
    inserted: 0,
    duplicates: 0,
    rejected: 0,
  };

  for (const record of records) {
    try {
      // Step 3: Validate
      if (!validateRecord(record)) {
        stats.rejected++;
        continue;
      }

      // Step 4: Sanitize
      const cleaned = sanitizeRecord(record);

      // Step 5: Check for duplicates using originalId
      const identifier = cleaned.originalId;
      if (identifier) {
        const exists = await Task.findOne({ originalId: identifier });
        if (exists) {
          stats.duplicates++;
          continue;
        }
      }

      // Step 6: Insert into MongoDB
      await Task.create(cleaned);
      stats.inserted++;
    } catch (err) {
      // Duplicate key error (E11000) or validation error
      if (err.code === 11000) {
        stats.duplicates++;
      } else {
        stats.rejected++;
      }
    }
  }

  return stats;
};

module.exports = { syncData };
