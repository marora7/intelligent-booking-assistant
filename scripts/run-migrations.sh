#!/bin/bash
# Migration Runner for SQLite Database
# Usage: ./scripts/run-migrations.sh

set -e  # Exit on error

DB_PATH="data/database.db"
BACKUP_DIR="data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔧 SQLite Database Migration Tool"
echo "=================================="
echo ""

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Error: Database not found at $DB_PATH"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current database
echo "📦 Creating backup..."
BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.db"
cp "$DB_PATH" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# Run migration 001
echo "🚀 Running Migration 001: Add milestone fields..."
sqlite3 "$DB_PATH" < scripts/001_add_milestone_fields.sql
if [ $? -eq 0 ]; then
    echo "✅ Migration 001 completed successfully"
else
    echo "❌ Migration 001 failed! Restoring backup..."
    cp "$BACKUP_FILE" "$DB_PATH"
    exit 1
fi
echo ""

# Run migration 002
echo "🚀 Running Migration 002: Populate interest scores..."
sqlite3 "$DB_PATH" < scripts/002_populate_interest_scores.sql
if [ $? -eq 0 ]; then
    echo "✅ Migration 002 completed successfully"
else
    echo "❌ Migration 002 failed! Restoring backup..."
    cp "$BACKUP_FILE" "$DB_PATH"
    exit 1
fi
echo ""

# Verify database integrity
echo "🔍 Verifying database integrity..."
sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"
if [ $? -eq 0 ]; then
    echo "✅ Database integrity verified"
else
    echo "⚠️  Warning: Database integrity check returned warnings"
fi
echo ""

# Show summary
echo "📊 Migration Summary"
echo "===================="
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' destinations' FROM destinations;"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' cities with interest scores' FROM destinations WHERE type='city' AND interest_art IS NOT NULL;"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' attractions' FROM attractions;"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' activities' FROM activities;"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' packages' FROM packages;"
sqlite3 "$DB_PATH" "SELECT COUNT(*) || ' restaurants' FROM restaurants;"
echo ""

# Show sample destination
echo "📍 Sample Enhanced Destination:"
echo "================================"
sqlite3 -header -column "$DB_PATH" "
SELECT 
  name,
  budget_tier,
  avg_daily_cost,
  interest_art,
  interest_food,
  interest_nightlife
FROM destinations 
WHERE name = 'Amsterdam' AND type = 'city';
"
echo ""

echo "🎉 All migrations completed successfully!"
echo ""
echo "💡 Next steps:"
echo "   1. Review the changes in your database"
echo "   2. Start building the Next.js application"
echo "   3. Implement the conversation agents"
echo ""
echo "📁 Backup stored at: $BACKUP_FILE"

