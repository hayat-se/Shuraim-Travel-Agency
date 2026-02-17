-- Migration to fix "Data truncated for column 'group'" error
-- This changes the 'group' column from ENUM to VARCHAR to accept any group name

-- Option 1: Change column type (Recommended)
ALTER TABLE flights 
MODIFY COLUMN `group` VARCHAR(255) NOT NULL DEFAULT 'ALL';

-- Verify the change
DESCRIBE flights;

-- The 'group' column should now show type: varchar(255)
