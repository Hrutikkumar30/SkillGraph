import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const uri = process.env.COGNODB_URI || 'neo4j://localhost:7687';
const user = process.env.COGNODB_USERNAME || 'cognodb';
const password = process.env.COGNODB_PASSWORD || 'password';

async function main() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  
  try {
    console.log('Clearing database...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Seeding data...');
    const cypherPath = path.resolve(process.cwd(), 'cypher/seed.cypher');
    const cypher = fs.readFileSync(cypherPath, 'utf8');
    
    const statements = cypher.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
      await session.run(statement);
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
