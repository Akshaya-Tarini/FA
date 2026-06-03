/**
 * Validate a single record from the dataset
 * Returns true if the record is valid, false otherwise
 */
const validateRecord = (record) => {
  if (!record || typeof record !== 'object') return false;

  // Must have a title (non-empty string)
  if (!record.title || typeof record.title !== 'string' || record.title.trim().length === 0) {
    return false;
  }

  // If status is provided, it must be one of the allowed values
  if (record.status) {
    const allowed = ['pending', 'in-progress', 'completed', 'in_progress'];
    if (!allowed.includes(String(record.status).toLowerCase().trim())) {
      return false;
    }
  }

  // If priority is provided, it must be one of the allowed values
  if (record.priority) {
    const allowed = ['low', 'medium', 'high'];
    if (!allowed.includes(String(record.priority).toLowerCase().trim())) {
      return false;
    }
  }

  return true;
};

/**
 * Sanitize a single record — normalize and clean values
 */
const sanitizeRecord = (record) => {
  const cleaned = {};

  // Title — trim whitespace
  cleaned.title = String(record.title).trim();

  // Description — default to empty string
  cleaned.description = record.description
    ? String(record.description).trim()
    : '';

  // Status — normalize variations
  if (record.status) {
    let status = String(record.status).toLowerCase().trim();
    // Normalize common variations
    if (status === 'in_progress' || status === 'inprogress') {
      status = 'in-progress';
    }
    if (status === 'complete' || status === 'done') {
      status = 'completed';
    }
    cleaned.status = status;
  } else {
    cleaned.status = 'pending';
  }

  // Priority — normalize
  if (record.priority) {
    cleaned.priority = String(record.priority).toLowerCase().trim();
  } else {
    cleaned.priority = 'medium';
  }

  // Due date — parse if present
  if (record.dueDate) {
    const parsed = new Date(record.dueDate);
    cleaned.dueDate = isNaN(parsed.getTime()) ? null : parsed;
  } else {
    cleaned.dueDate = null;
  }

  // Original ID for deduplication
  cleaned.originalId = record._id || record.id || record.originalId || null;

  return cleaned;
};

module.exports = { validateRecord, sanitizeRecord };
