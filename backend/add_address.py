from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE merchants ADD COLUMN address VARCHAR;'))
    conn.commit()
    print("Added address column")