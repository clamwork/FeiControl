/**
 * Plugin Engine — Lightweight plugin system for FeiControl
 *
 * Plugins are loaded from `plugins/` directory at the project root.
 * Each plugin is a directory with a plugin.json manifest and a plugin.js entry.
 */

import fs from "fs";
import path from "path";
import { logActivity } from "@/lib/activities-db";

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
}

export interface PluginAPI {
  log: (message: string) => void;
  fetch: typeof fetch;
  registerRoute: (path: string, handler: any) => void;
  getActivity: (type: string, description: string, status: string) => void;
}

export interface PluginInstance {
  manifest: PluginManifest;
  api: PluginAPI;
  module: any;
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
}

const PLUGINS_DIR = path.join(process.cwd(), "plugins");

export class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();
  private configPath: string;

  constructor() {
    this.configPath = path.join(PLUGINS_DIR, ".plugin-state.json");
    this.ensurePluginsDir();
  }

  private ensurePluginsDir() {
    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
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
    fs.writeFileSync(this.configPath, JSON.stringify(state, null, 2));
  }

  async scan(): Promise<PluginManifest[]> {
    const manifests: PluginManifest[] = [];
    const state = this.readPluginState();

    try {
      const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const manifestPath = path.join(PLUGINS_DIR, entry.name, "plugin.json");
        if (!fs.existsSync(manifestPath)) continue;

        try {
          const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          manifest.id = manifest.id || entry.name;
          manifest.enabled = state[manifest.id] !== false; // default enabled
          manifests.push(manifest);
        } catch {
          console.warn(`[PluginManager] Invalid manifest in ${entry.name}`);
        }
      }
    } catch (error) {
      console.error("[PluginManager] Scan error:", error);
    }

    return manifests.sort((a, b) => a.name.localeCompare(b.name));
  }

  async load(manifest: PluginManifest): Promise<PluginInstance | null> {
    try {
      const entryPath = path.join(PLUGINS_DIR, manifest.id, manifest.entry || "plugin.js");
      if (!fs.existsSync(entryPath)) {
        console.warn(`[PluginManager] Entry not found: ${entryPath}`);
        return null;
      }

      // Create plugin API
      const api: PluginAPI = {
        log: (message: string) => console.log(`[Plugin:${manifest.name}] ${message}`),
        fetch: globalThis.fetch.bind(globalThis),
        registerRoute: (_path: string, _handler: any) => {
          console.log(`[PluginManager] Route registration not yet supported: ${_path}`);
        },
        getActivity: (type: string, description: string, status: string) => {
          logActivity(type, description, status, { agent: manifest.id });
        },
      };

      // Load plugin module (dynamic require)
      const pluginModule = require(entryPath);
      const instance: PluginInstance = {
        manifest,
        api,
        module: pluginModule,
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
      console.log(`[PluginManager] Loaded: ${manifest.name} v${manifest.version}`);

      return instance;
    } catch (error) {
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
      console.log(`[PluginManager] Unloaded: ${instance.manifest.name}`);
      return true;
    } catch (error) {
      console.error(`[PluginManager] Failed to unload ${pluginId}:`, error);
      return false;
    }
  }

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
    // Unload all
    const ids = Array.from(this.plugins.keys());
    for (const id of ids) {
      await this.unload(id);
    }

    // Reload
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

  getLoaded(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  get(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }
}

// Singleton
let _instance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!_instance) {
    _instance = new PluginManager();
  }
  return _instance;
}
