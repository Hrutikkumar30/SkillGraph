import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver: Driver | null = null;

export function getDriver() {
  if (!driver) {
    const uri = process.env.COGNODB_URI || 'neo4j://localhost:7687';
    const user = process.env.COGNODB_USERNAME || 'cognodb';
    const password = process.env.COGNODB_PASSWORD || 'password';

    if (!process.env.COGNODB_URI) {
      console.warn('COGNODB_URI not set. Application might fail to connect.');
    }
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
