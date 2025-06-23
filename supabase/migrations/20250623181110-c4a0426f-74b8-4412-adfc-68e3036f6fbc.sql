
-- Add missing fields to Photographers table
ALTER TABLE "Photographers" 
ADD COLUMN username VARCHAR NOT NULL DEFAULT '',
ADD COLUMN name VARCHAR NOT NULL DEFAULT '',
ADD COLUMN email VARCHAR NOT NULL DEFAULT '';

-- Add missing fields to Clients table  
ALTER TABLE "Clients"
ADD COLUMN username VARCHAR NOT NULL DEFAULT '',
ADD COLUMN name VARCHAR NOT NULL DEFAULT '',
ADD COLUMN email VARCHAR NOT NULL DEFAULT '';

-- Add unique constraints for usernames and emails
ALTER TABLE "Photographers" 
ADD CONSTRAINT photographers_username_unique UNIQUE (username),
ADD CONSTRAINT photographers_email_unique UNIQUE (email);

ALTER TABLE "Clients"
ADD CONSTRAINT clients_username_unique UNIQUE (username),
ADD CONSTRAINT clients_email_unique UNIQUE (email);
