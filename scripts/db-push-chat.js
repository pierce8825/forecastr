import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { chatConversations, chatMessages } from '../shared/schema.js';

dotenv.config();

// For migrations
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

const db = drizzle(migrationClient);

// Create the new chat tables manually
async function createTables() {
  try {
    console.log('Creating chat_conversations table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        subaccount_id INTEGER,
        forecast_id INTEGER,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Creating chat_messages table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await migrationClient.end();
  }
}

createTables();