// Migration to remove duplicate indexes on admins.email
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // List all indexes on the admins table
    // Remove all but one unique index on email
    // You may need to adjust index names if they are different
    // This migration is safe to run multiple times
    const [indexes] = await queryInterface.sequelize.query('SHOW INDEX FROM admins;');
    const emailIndexes = indexes.filter(idx => idx.Column_name === 'email' && idx.Key_name !== 'PRIMARY');
    // Keep only the first unique index, drop the rest
    let kept = false;
    for (const idx of emailIndexes) {
      if (idx.Non_unique === 0 && !kept) {
        kept = true; // keep the first unique index
        continue;
      }
      await queryInterface.removeIndex('admins', idx.Key_name);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No-op: do not re-add duplicate indexes
    return Promise.resolve();
  }
};
