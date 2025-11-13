import psycopg2
from psycopg2 import sql

# Connect to the default postgres database to manage other databases
conn = psycopg2.connect(
    dbname="postgres",
    user="rudi_user",
    password="rudi_password",
    host="localhost",
    port="5432"
)
conn.autocommit = True
cursor = conn.cursor()

# Drop the database if it exists
cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier("rudi_app")))

# Create the database
cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier("rudi_app")))

cursor.close()
conn.close()

print("Database rudi_app dropped and recreated successfully.")