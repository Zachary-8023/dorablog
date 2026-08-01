import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

let db;

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultInitScript = path.resolve(moduleDirectory, "../sql/init-db.sql");
const seededAdminHash = "$2b$10$F4aHD/tBLn4D/bhT76MjOunoTLzXMb6/iRf3B8heFtoMWTbnRbhiG";
const disabledAdminHash = "$2b$10$jWlgcroeDEAbvZ41AuPJZey0X0zF600H0ogOZgiwvD/6vEeWvCitC";

function normalizeParameters(parameters) {
  if (parameters.length === 1 && Array.isArray(parameters[0])) {
    return parameters[0];
  }
  return parameters;
}

function toPlainRow(row) {
  return row ? { ...row } : undefined;
}

function createLibsqlAdapter(client) {
  return {
    async all(sql, ...parameters) {
      const result = await client.execute({ sql, args: normalizeParameters(parameters) });
      return result.rows.map(toPlainRow);
    },

    async get(sql, ...parameters) {
      const result = await client.execute({ sql, args: normalizeParameters(parameters) });
      return toPlainRow(result.rows[0]);
    },

    async run(sql, ...parameters) {
      const result = await client.execute({ sql, args: normalizeParameters(parameters) });
      return {
        lastID:
          result.lastInsertRowid === undefined || result.lastInsertRowid === null
            ? undefined
            : Number(result.lastInsertRowid),
        changes: result.rowsAffected
      };
    },

    async exec(sql) {
      return client.executeMultiple(sql);
    }
  };
}

/**
 * Returns a shared database connection. Local development uses the existing
 * SQLite file; Vercel uses Turso/libSQL when its environment variables exist.
 */
export async function getDatabase() {
  if (!db) {
    db = process.env.TURSO_DATABASE_URL ? await openRemoteDatabase() : await openLocalDatabase();
  }
  return db;
}

async function openRemoteDatabase() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN,
    intMode: "number"
  });
  const remoteDb = createLibsqlAdapter(client);

  const usersTable = await remoteDb.get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Users'"
  );
  if (!usersTable) {
    console.log("Initializing the Turso database...");
    await initDatabase(remoteDb);
  }

  // The local seed intentionally has a simple development admin password.
  // Never expose that privileged login in the public deployment.
  await remoteDb.run(
    `UPDATE Users
     SET passwordHash = ?, admin = FALSE
     WHERE username = 'admin' AND passwordHash = ?`,
    [disabledAdminHash, seededAdminHash]
  );

  return remoteDb;
}

async function openLocalDatabase() {
  const [{ default: sqlite3 }, { open }] = await Promise.all([import("sqlite3"), import("sqlite")]);
  const filename = process.env.DB_FILENAME || "./temp/dorablog.db";
  const dbExists = fs.existsSync(filename);
  const localDb = await open({ filename, driver: sqlite3.Database });

  await localDb.exec("PRAGMA foreign_keys = ON");
  if (!dbExists) {
    console.log(`Database ${filename} doesn't exist.`);
    await initDatabase(localDb);
  }

  return localDb;
}

async function initDatabase(database) {
  const configuredPath = process.env.DB_INIT_SCRIPT;
  const initScript = configuredPath ? path.resolve(configuredPath) : defaultInitScript;
  console.log(`Initializing database using init script ${initScript}`);
  const sql = fs.readFileSync(initScript, "utf8");
  await database.exec(sql);
  console.log("Database initialized successfully!");
}
