const prisma = require('../config/prisma');

/**
 * Write an audit-log row. Accepts an optional transaction client so it can run
 * inside the same transaction as the operation it records.
 */
async function log(entry, client = prisma) {
  try {
    await client.auditLog.create({ data: { details: {}, ...entry } });
  } catch (e) {
    // Auditing must never break the primary operation.
    // eslint-disable-next-line no-console
    console.error('[audit] failed to write log:', e.message);
  }
}

module.exports = { log };
