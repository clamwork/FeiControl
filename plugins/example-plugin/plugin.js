/**
 * Example Plugin — FeiControl Plugin System Demo
 *
 * Demonstrates the PluginAPI: logging, config read/write, lifecycle hooks.
 */

/**
 * Called when the plugin is loaded.
 * @param {import("@/lib/plugin-engine").PluginAPI} api
 */
async function onLoad(api) {
  api.log("Plugin loaded! 🎉");

  // Read existing config
  const config = api.getConfig();
  api.log(`Current config: ${JSON.stringify(config)}`);

  // Set default config if empty
  if (!config || Object.keys(config).length === 0) {
    api.setConfig({
      greeting: "Hello from Example Plugin!",
      intervalMs: 30000,
      enabled: true,
    });
    api.log("Default config written");
  }
}

/**
 * Called when the plugin is unloaded.
 * @param {import("@/lib/plugin-engine").PluginAPI} api
 */
async function onUnload(api) {
  api.log("Plugin unloaded. Goodbye! 👋");
}

/**
 * Utility: greet a name
 * @param {string} name
 * @returns {string}
 */
function greet(name) {
  return `Hello, ${name}! Welcome to FeiControl plugins.`;
}

module.exports = { onLoad, onUnload, greet };
