# Flight Group Column Migration

## Problem
When adding flights from the admin portal, you may encounter this error:
```
Data truncated for column 'group' at row 1
```

## Cause
The `group` column in the `flights` table was defined as an ENUM with only these specific values:
- 'ALL', 'KSA', 'UAE', 'QATAR', 'BAHRAIN', 'OMAN', 'KUWAIT'

However, the system now uses dynamic groups from the `groups` table (like 'MCT', 'DXB', etc.), which don't match the hardcoded ENUM values.

## Solution
Change the `group` column from ENUM to VARCHAR(255) to accept any group name.

---

## How to Fix (Choose ONE method)

### Method 1: Run Migration Script (Recommended)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Run the migration:
   ```bash
   npm run migrate:group
   ```

3. You should see:
   ```
   ✅ Migration completed successfully!
   ```

### Method 2: Run SQL Directly

If you prefer to run SQL directly in your database:

1. Connect to your MySQL/MariaDB database
2. Run this SQL command:
   ```sql
   ALTER TABLE flights 
   MODIFY COLUMN `group` VARCHAR(255) NOT NULL DEFAULT 'ALL';
   ```

3. Verify the change:
   ```sql
   DESCRIBE flights;
   ```
   
   The `group` column should now show type: `varchar(255)`

---

## After Migration

Once the migration is complete:

1. **The Flight model has been updated** (already done in code)
2. **The database column has been migrated** (you just did this)
3. **You can now add flights with any group name** from your Groups table

## Testing

1. Go to Admin Portal → Flight Management
2. Try adding a new flight with any group from your Groups table
3. The error should no longer appear

---

## What Changed

### Before:
```javascript
group: {
  type: DataTypes.ENUM('ALL', 'KSA', 'UAE', 'QATAR', 'BAHRAIN', 'OMAN', 'KUWAIT'),
  defaultValue: 'ALL'
}
```

### After:
```javascript
group: {
  type: DataTypes.STRING,
  defaultValue: 'ALL',
  allowNull: false
}
```

This allows the system to use any group name from the Groups table, making it flexible and dynamic.
