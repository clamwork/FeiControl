/**
 * Plugin Engine — Lightweight plugin system for FeiControl
 *
 * Plugins are loaded from `plugins/` directory at the project root.
 * Each plugin is a directory with a plugin.json manifest and a plugin.js entry.
 *
 * @note Dynamic require() is used at runtime only (Node.js server-side).
 *       During build, plugins/ directory may not exist, so we handle that gracefully.
 */

import fs from "fs";
import path from "path";
import { logActivity } from "@/lib/activities-db";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  entry: string;
  icon?: string;
  permissions?: string[];
  enabled?: boolean;
  /** Optional JSON schema for plugin config (shown in config UI) */
  configSchema?: Record<string, unknown>;
}

export interface PluginLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  pluginId: string;
}

export interface PluginAPI {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  fetch: typeof fetch;
  registerRoute: (path: string, handler: any) => void;
  getActivity: (type: string, description: string, status: string) => void;
  /** Read this plugin's persisted config */
  getConfig: <T = Record<string, unknown>>() => T;
  /** Write this plugin's persisted config */
  setConfig: <T = Record<string, unknown>>(config: T) => void;
}

export interface PluginInstance {
  manifest: PluginManifest;
  api: PluginAPI;
  module: any;
  /** Timestamp when the plugin was loaded */
  loadedAt: string;
  /** Error count since load */
  errorCount: number;
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const PLUGINS_DIR = path.join(process.cwd(), "plugins");

const noopAPI: PluginAPI = {
  log: () => {},
  warn: () => {},
  error: () => {},
  fetch: async () => new Response(null, { status: 503 }),
  registerRoute: () => {},
  getActivity: () => {},
  getConfig: () => ({}),
  setConfig: () => {},
};

/* ------------------------------------------------------------------ */
/*  PluginManager                                                     */
/* ------------------------------------------------------------------ */

export class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();
  private configPath: string;
  /** In-memory ring buffer of plugin logs (max 1000 entries) */
  private logs: PluginLogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  constructor() {
    this.configPath = path.join(PLUGINS_DIR, ".plugin-state.json");
    this.ensurePluginsDir();
  }

  /* ---- helpers ---- */

  private ensurePluginsDir() {
    try {
      if (!fs.existsSync(PLUGINS_DIR)) {
        fs.mkdirSync(PLUGINS_DIR, { recursive: true });
      }
    } catch {
      // plugins/ dir might not exist during build; that's fine
    }
  }

  private readPluginState(): Record<string, boolean> {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, "utf-8"));
      }
    } catch {}
    return {};
  }

  private writePluginState(state: Record<string, boolean>) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(state, null, 2));
    } catch (e) {
      console.warn("[PluginManager] Failed to write plugin state:", e);
    }
  }

  private getPluginConfigPath(pluginId: string): string {
    return path.join(PLUGINS_DIR, pluginId, ".config.json");
  }

  private pushLog(pluginId: string, level: PluginLogEntry["level"], message: string) {
    this.logs.push({ timestamp: new Date().toISOString(), level, message, pluginId });
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }
  }

  /** Returns a copy of the in-memory log buffer, newest first */
  getLogs(pluginId?: string, limit = 200): PluginLogEntry[] {
    let filtered = pluginId
      ? this.logs.filter((l) => l.pluginId === pluginId)
      : [...this.logs];
    return filtered.reverse().slice(0, limit);
  }

  /* ---- config per plugin ---- */

  readPluginConfig<T = Record<string, unknown>>(pluginId: string): T {
    try {
      const cfgPath = this.getPluginConfigPath(pluginId);
      if (fs.existsSync(cfgPath)) {
        return JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      }
    } catch {}
    return {} as T;
  }

  writePluginConfig<T = Record<string, unknown>>(pluginId: string, config: T): boolean {
    try {
      const cfgPath = this.getPluginConfigPath(pluginId);
      fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.warn(`[PluginManager] Failed to write config for ${pluginId}:`, e);
      return false;
    }
  }

  /* ---- scan ---- */

  async scan(): Promise<PluginManifest[]> {
    const manifests: PluginManifest[] = [];
    const state = this.readPluginState();

    try {
      if (!fs.existsSync(PLUGINS_DIR)) return [];

      const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const manifestPath = path.join(PLUGINS_DIR, entry.name, "plugin.json");
        if (!fs.existsSync(manifestPath)) continue;

        try {
          const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          manifest.id = manifest.id || entry.name;
          manifest.enabled = state[manifest.id] !== false;
          manifests.push(manifest);
        } catch {
          this.pushLog(entry.name, "warn", `Invalid plugin.json manifest`);
        }
      }
    } catch (error) {
      console.error("[PluginManager] Scan error:", error);
    }

    return manifests.sort((a, b) => a.name.localeCompare(b.name));
  }

  /* ---- load / unload ---- */

  async load(manifest: PluginManifest): Promise<PluginInstance | null> {
    try {
      const entryPath = path.join(PLUGINS_DIR, manifest.id, manifest.entry || "plugin.js");
      if (!fs.existsSync(entryPath)) {
        this.pushLog(manifest.id, "warn", `Entry file not found: ${manifest.entry || "plugin.js"}`);
        return null;
      }

      // Create plugin API
      const api: PluginAPI = {
        log: (message: string) => {
          this.pushLog(manifest.id, "info", message);
          console.log(`[Plugin:${manifest.name}] ${message}`);
        },
        warn: (message: string) => {
          this.pushLog(manifest.id, "warn", message);
          console.warn(`[Plugin:${manifest.name}] ${message}`);
        },
        error: (message: string) => {
          this.pushLog(manifest.id, "error", message);
          console.error(`[Plugin:${manifest.name}] ${message}`);
        },
        fetch: globalThis.fetch.bind(globalThis),
        registerRoute: (_path: string, _handler: any) => {
          this.pushLog(manifest.id, "warn", `Route registration not yet supported: ${_path}`);
        },
        getActivity: (type: string, description: string, status: string) => {
          logActivity(type, description, status, { agent: manifest.id });
        },
        getConfig: <T = Record<string, unknown>>() => this.readPluginConfig<T>(manifest.id),
        setConfig: <T = Record<string, unknown>>(config: T) => {
          this.writePluginConfig(manifest.id, config);
        },
      };

      // Load plugin module (dynamic require — only called at runtime, never during build)
      const pluginModule = require(entryPath);
      const instance: PluginInstance = {
        manifest,
        api,
        module: pluginModule,
        loadedAt: new Date().toISOString(),
        errorCount: 0,
      };

      // Call onLoad if exported
      if (typeof pluginModule.onLoad === "function") {
        await pluginModule.onLoad(api);
        instance.onLoad = () => pluginModule.onLoad(api);
      }

      if (typeof pluginModule.onUnload === "function") {
        instance.onUnload = () => pluginModule.onUnload(api);
      }

      this.plugins.set(manifest.id, instance);
      this.pushLog(manifest.id, "info", `Loaded v${manifest.version}`);
      console.log(`[PluginManager] Loaded: ${manifest.name} v${manifest.version}`);

      return instance;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.pushLog(manifest.id, "error", `Load failed: ${msg}`);
      console.error(`[PluginManager] Failed to load ${manifest.id}:`, error);
      return null;
    }
  }

  async unload(pluginId: string): Promise<boolean> {
    const instance = this.plugins.get(pluginId);
    if (!instance) return false;

    try {
      if (instance.onUnload) {
        await instance.onUnload();
      }
      this.plugins.delete(pluginId);
      // Clear require cache
      const entryPath = path.join(PLUGINS_DIR, pluginId, instance.manifest.entry || "plugin.js");
      delete require.cache[require.resolve(entryPath)];
      this.pushLog(pluginId, "info", "Unloaded");
      console.log(`[PluginManager] Unloaded: ${instance.manifest.name}`);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.pushLog(pluginId, "error", `Unload failed: ${msg}`);
      return false;
    }
  }

  /* ---- bulk operations ---- */

  async loadAll(): Promise<PluginInstance[]> {
    const manifests = await this.scan();
    const loaded: PluginInstance[] = [];

    for (const manifest of manifests) {
      if (manifest.enabled) {
        const instance = await this.load(manifest);
        if (instance) loaded.push(instance);
      }
    }

    return loaded;
  }

  async reloadAll(): Promise<number> {
    const ids = Array.from(this.plugins.keys());
    for (const id of ids) {
      await this.unload(id);
    }
    const instances = await this.loadAll();
    return instances.length;
  }

  async toggle(pluginId: string, enabled: boolean): Promise<boolean> {
    const state = this.readPluginState();
    state[pluginId] = enabled;
    this.writePluginState(state);

    if (enabled) {
      const manifests = await this.scan();
      const manifest = manifests.find((m) => m.id === pluginId);
      if (manifest) {
        const instance = await this.load(manifest);
        return instance !== null;
      }
      return false;
    } else {
      return this.unload(pluginId);
    }
  }

  /* ---- query ---- */

  getLoaded(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  get(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton                                                         */
/* ------------------------------------------------------------------ */

let _instance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!_instance) {
    _instance = new PluginManager();
  }
  return _instance;
}
