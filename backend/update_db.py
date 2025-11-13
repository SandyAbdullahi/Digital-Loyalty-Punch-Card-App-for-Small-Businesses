import sqlite3

conn = sqlite3.connect('test.db')
c = conn.cursor()

# Add columns to loyalty_programs
# reward_expiry_days and allow_repeat_cycles already added
c.execute("ALTER TABLE loyalty_programs ADD COLUMN created_at DATETIME;")
c.execute("ALTER TABLE loyalty_programs ADD COLUMN updated_at DATETIME;")

# Add columns to customer_program_memberships
c.execute("ALTER TABLE customer_program_memberships ADD COLUMN merchant_id TEXT;")  # UUID as TEXT in sqlite
c.execute("ALTER TABLE customer_program_memberships ADD COLUMN joined_via VARCHAR;")
c.execute("UPDATE customer_program_memberships SET joined_via = 'qr';")
c.execute("ALTER TABLE customer_program_memberships ADD COLUMN last_visit_at DATETIME;")
c.execute("ALTER TABLE customer_program_memberships ADD COLUMN current_cycle INTEGER;")
c.execute("UPDATE customer_program_memberships SET current_cycle = 1;")

# Add columns to ledger_entries
c.execute("ALTER TABLE ledger_entries ADD COLUMN issued_by_staff_id TEXT;")
c.execute("ALTER TABLE ledger_entries ADD COLUMN issued_at DATETIME;")
# Rename tx_ref to tx_id - SQLite doesn't support RENAME COLUMN, so add new and copy data if needed
c.execute("ALTER TABLE ledger_entries ADD COLUMN tx_id VARCHAR;")
# Copy data from tx_ref to tx_id
c.execute("UPDATE ledger_entries SET tx_id = tx_ref;")
# Drop tx_ref - but SQLite doesn't support DROP COLUMN, so leave it for now

# Create rewards table
c.execute("""
CREATE TABLE rewards (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL,
    program_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'inactive',
    reached_at DATETIME,
    voucher_code VARCHAR(32) UNIQUE,
    redeem_expires_at DATETIME,
    redeemed_at DATETIME,
    redeemed_by_staff_id TEXT,
    audit JSON,
    cycle INTEGER DEFAULT 1,
    UNIQUE(enrollment_id, cycle)
);
""")

# Create audit_logs table
c.execute("""
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    actor_type VARCHAR NOT NULL,
    actor_id TEXT,
    action VARCHAR NOT NULL,
    entity VARCHAR NOT NULL,
    entity_id TEXT NOT NULL,
    details JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()
conn.close()

print("Database updated successfully.")