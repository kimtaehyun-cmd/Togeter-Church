import { randomBytes, scryptSync } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const usersFilePath = path.join(dataDir, 'users.json');

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function printUsage() {
  console.error(
    'Usage: npm run seed:admin -- --email admin@example.com --password Password123 --name Administrator',
  );
}

async function readUsers() {
  try {
    const raw = await fs.readFile(usersFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = String(args.email ?? '').trim().toLowerCase();
  const password = String(args.password ?? '').trim();
  const name = String(args.name ?? 'Administrator').trim() || 'Administrator';

  if (!email || !password) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (!validateEmail(email)) {
    console.error('The provided email address is not valid.');
    process.exitCode = 1;
    return;
  }

  if (!validatePassword(password)) {
    console.error('Password must be at least 8 characters long and include letters and numbers.');
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });

  const users = await readUsers();
  const existingIndex = users.findIndex(user => user?.email === email);
  const existingUser = existingIndex >= 0 ? users[existingIndex] : null;
  const now = new Date().toISOString();

  const adminUser = {
    id: existingUser?.id ?? Date.now().toString(),
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'admin',
    createdAt: existingUser?.createdAt ?? now,
  };

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...existingUser,
      ...adminUser,
    };
  } else {
    users.unshift(adminUser);
  }

  await fs.writeFile(usersFilePath, `${JSON.stringify(users, null, 2)}\n`, 'utf-8');

  console.log(
    existingUser
      ? `Updated local admin account for ${email}.`
      : `Created local admin account for ${email}.`,
  );
  console.log('You can now sign in at /login and open /admin.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
