#!/usr/bin/env python3
"""
Database initialization script
Creates the users and tickets tables in SQLite
"""
from pathlib import Path
import sys
import sqlite3

# Add the project root to Python path so backend can be imported as a package.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.db.db import get_connection

def create_tables():
    """Create the database and tables"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("=" * 60)
        print("Creating database tables...")
        print("=" * 60)
        
        # Create users table
        create_users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_users_table)
        print("✓ Users table created")

        cursor.execute("PRAGMA table_info(users)")
        user_columns = {row["name"] for row in cursor.fetchall()}
        if "password_hash" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
            print("✓ Users password_hash column added")
        
        # Create tickets table
        create_tickets_table = """
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status INTEGER DEFAULT 1,
            priority INTEGER DEFAULT 1,
            assigned_to INTEGER,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
        """
        cursor.execute(create_tickets_table)
        print("✓ Tickets table created")

        create_update_trigger = """
        CREATE TRIGGER IF NOT EXISTS set_ticket_updated_at
        AFTER UPDATE ON tickets
        FOR EACH ROW
        BEGIN
            UPDATE tickets
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.id;
        END;
        """
        cursor.execute(create_update_trigger)
        print("✓ Ticket update trigger created")
        
        conn.commit()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✓ Database initialized successfully!")
        print("=" * 60)
        
    except sqlite3.Error as err:
        print(f"✗ Error: {err}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    create_tables()
