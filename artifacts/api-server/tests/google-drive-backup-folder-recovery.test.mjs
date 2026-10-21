import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("../src/lib/google-drive-backups.ts", import.meta.url),
  "utf8",
);
const authSource = readFileSync(
  new URL("../src/lib/google-drive-auth.ts", import.meta.url),
  "utf8",
);
const folderLookup = source.slice(
  source.indexOf("async function findExistingBackupFolder"),
  source.indexOf("async function ensureBackupFolder"),
);
const ensureFolder = source.slice(
  source.indexOf("async function ensureBackupFolder"),
  source.indexOf("async function findExistingBackupFile"),
);

test("a missing Drive folder ID is recovered by finding the existing backup folder", () => {
  assert.match(folderLookup, /name = .*BACKUP_FOLDER_NAME/);
  assert.match(
    folderLookup,
    /mimeType = 'application\/vnd\.google-apps\.folder'/,
  );
  assert.match(folderLookup, /trashed = false/);
  assert.match(ensureFolder, /findExistingBackupFolder\(accessToken\)/);
  assert.match(ensureFolder, /await persistFolder\(existingFolder\)/);
  assert.match(ensureFolder, /return createBackupFolder\(accessToken\)/);
});

test("duplicate backup folders are not selected arbitrarily", () => {
  assert.match(folderLookup, /folderHasBackupFiles\(accessToken, folder\.id\)/);
  assert.match(folderLookup, /foldersWithBackups\.length === 1/);
  assert.match(
    folderLookup,
    /MULTIPLE_MATCHING_BACKUP_FOLDERS/,
  );
});

test("Google Drive authorization can find existing backup folders", () => {
  assert.match(
    authSource,
    /const DRIVE_SCOPE = "https:\/\/www\.googleapis\.com\/auth\/drive";/,
  );
});
