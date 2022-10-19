require('dotenv-safe').config();
const fs = require('fs');

const SOURCE = '.env.example';
const TARGET = 'src/environments/environment.ts';

function readKeys() {
  const data = fs.readFileSync(SOURCE);
  const text = data.toString();
  return text
    .split('\n')
    .filter(Boolean)
    .map(name => name.trim().replace(/=$/, ''));
}

function isProduction() {
  return process.argv[2]?.split('=')[1] === 'prod';
}

function targetFileNameFor(isProduction) {
  return TARGET.replace(
    'environment.ts',
    `environment.${isProduction ? 'prod' : 'dev'}.ts`,
  );
}

function writeEnv(keys, targetFileName) {
  const envVars = {};
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'undefined') {
      throw new Error(`Missing environment variable: ${key}`);
    }
    envVars[key] = value;
  }

  return `export const environment = {
    production: ${isProduction},
    ${Object.entries(envVars)
      .map(([key, value]) => `  ${key}: '${value || ''}'`)
      .join(',\n')},
  `;
}

writeEnv(readKeys(), targetFileNameFor(isProduction()));
