import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Database from 'better-sqlite3';

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), '.openclaw');
const WORKSPACE = process.env.OPENCLAW_WORKSPACE || path.join(OPENCLAW_DIR, 'workspace');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

export type SearchResultType = 'memory' | 'activity' | 'task' | 'file' | 'notification' | 'git' | 'cron';

interface SearchResult {
  type: SearchResultType;
  title: string;
  snippet: string;
  path?: string;
  timestamp?: string;
}

function searchInFile(filePath: string, query: string, type: SearchResultType = 'memory'): SearchResult[] {
  const results: SearchResult[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const lowerQuery = query.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerQuery)) {
        const start = Math.max(0, index - 1);
        const end = Math.min(lines.length, index + 2);
        const snippet = lines.slice(start, end).join('\n');

        results.push({
          type,
          title: path.basename(filePath),
          snippet: snippet.substring(0, 200),
          path: filePath,
        });
      }
    });
  } catch {
    // Skip files that can't be read
  }
  return results;
}

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Direct contains match first
  if (lowerText.includes(lowerQuery)) return true;

  // Fuzzy: each character of query must appear in order
  let qi = 0;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      qi++;
    }
  }
  return qi === lowerQuery.length;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Helper: check if we should include this type
  const include = (t: SearchResultType): boolean => {
    if (typeFilter === 'all') return true;
    return typeFilter === t;
  };

  // ── Search memory files ──────────────────────────────
  if (include('memory')) {
    const memoryFiles = [
      path.join(WORKSPACE, 'MEMORY.md'),
      ...(() => {
        try {
          return fs.readdirSync(MEMORY_DIR)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join(MEMORY_DIR, f));
        } catch {
          return [];
        }
      })(),
    ];

    for (const file of memoryFiles) {
      results.push(...searchInFile(file, query, 'memory'));
    }
  }

  // ── Search workspace files (.md, .txt, .json) ────────
  if (include('file')) {
    try {
      const workspaceFiles = fs.readdirSync(WORKSPACE)
        .filter(f => /\.(md|txt|json)$/i.test(f) && !f.startsWith('.'))
        .map(f => path.join(WORKSPACE, f));

      for (const file of workspaceFiles) {
        // Only add if not already searched as memory
        if (!file.includes('MEMORY.md') && !file.includes(MEMORY_DIR)) {
          results.push(...searchInFile(file, query, 'file'));
        }
      }
    } catch {
      // Skip
    }
  }

  // ── Search activities from SQLite DB ──────────────────
  if (include('activity')) {
    try {
      const dbPath = path.join(process.cwd(), 'data', 'activities.db');
      if (fs.existsSync(dbPath)) {
        const db = new Database(dbPath, { readonly: true });
        try {
          const rows = db.prepare(`
            SELECT type, description, timestamp FROM activities
            WHERE description LIKE ? OR type LIKE ?
            ORDER BY timestamp DESC LIMIT 15
          `).all(`%${query}%`, `%${query}%`) as Array<{ type: string; description: string; timestamp: string }>;

          for (const row of rows) {
            results.push({
              type: 'activity',
              title: row.type,
              snippet: row.description || '',
              timestamp: row.timestamp,
            });
          }
        } finally {
          db.close();
        }
      }
    } catch {
      // Skip
    }
  }

  // ── Search tasks from data/tasks.json ─────────────────
  if (include('task')) {
    try {
      const tasksPath = path.join(process.cwd(), 'data', 'tasks.json');
      if (fs.existsSync(tasksPath)) {
        const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));

        for (const task of (Array.isArray(tasks) ? tasks : [])) {
          const name = task.name || '';
          const description = task.description || '';
          if (fuzzyMatch(name, query) || fuzzyMatch(description, query)) {
            results.push({
              type: 'task',
              title: name,
              snippet: description || '',
              timestamp: task.nextRun,
            });
          }
        }
      }
    } catch {
      // Skip
    }
  }

  // ── Search notifications from data/notifications.json ─
  if (include('notification')) {
    try {
      const notifPath = path.join(process.cwd(), 'data', 'notifications.json');
      if (fs.existsSync(notifPath)) {
        const notifs = JSON.parse(fs.readFileSync(notifPath, 'utf-8'));
        const list = Array.isArray(notifs) ? notifs : (notifs.notifications || []);

        for (const n of list) {
          const title = n.title || '';
          const message = n.message || '';
          if (fuzzyMatch(title, query) || fuzzyMatch(message, query)) {
            results.push({
              type: 'notification',
              title: title,
              snippet: message || '',
              timestamp: n.timestamp,
            });
          }
        }
      }
    } catch {
      // Skip
    }
  }

  // ── Search git commits from data/git.json ─────────────
  if (include('git')) {
    try {
      const gitPath = path.join(process.cwd(), 'data', 'git.json');
      if (fs.existsSync(gitPath)) {
        const gitData = JSON.parse(fs.readFileSync(gitPath, 'utf-8'));
        const commits = Array.isArray(gitData) ? gitData : (gitData.commits || []);

        for (const c of commits) {
          const msg = c.message || '';
          const hash = c.hash || '';
          if (fuzzyMatch(msg, query) || fuzzyMatch(hash, query)) {
            results.push({
              type: 'git',
              title: (c.message || '').split('\n')[0],
              snippet: c.author ? `${c.author} · ${hash?.slice(0, 7) || ''}` : hash?.slice(0, 7) || '',
              timestamp: c.date,
            });
          }
        }
      }
    } catch {
      // Skip
    }
  }

  // ── Search cron jobs from data/cron.json ─────────────
  if (include('cron')) {
    try {
      const cronPath = path.join(process.cwd(), 'data', 'cron.json');
      if (fs.existsSync(cronPath)) {
        const cronData = JSON.parse(fs.readFileSync(cronPath, 'utf-8'));
        const jobs = Array.isArray(cronData) ? cronData : (cronData.jobs || []);

        for (const j of jobs) {
          const name = j.name || '';
          const command = j.command || '';
          const schedule = j.schedule || '';
          if (fuzzyMatch(name, query) || fuzzyMatch(command, query) || fuzzyMatch(schedule, query)) {
            results.push({
              type: 'cron',
              title: name,
              snippet: `${schedule} → ${command}`,
              timestamp: j.nextRun,
            });
          }
        }
      }
    } catch {
      // Skip
    }
  }

  return NextResponse.json(results.slice(0, 50));
}
