import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_7iFHfmtYh8Oy@ep-ancient-sea-aiarakjh-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✓ Successfully connected to database!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✓ Query executed successfully:', result.rows[0]);
    
    await client.end();
    console.log('✓ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
