import { describe, it, expect } from "vitest";
import { getConfig } from "@/lib/env";

describe("env configuration", () => {
  it("returns default values for optional fields", () => {
    const config = getConfig();
    expect(config.appTitle).toBe("Mission Control");
    expect(config.agentEmoji).toBe("🤖");
    expect(config.agentDescription).toBe("Your AI co-pilot");
  });

  it("provides typed config object", () => {
    const config = getConfig();
    // Verify all required keys exist
    expect(config).toHaveProperty("adminPassword");
    expect(config).toHaveProperty("authSecret");
    expect(config).toHaveProperty("openclawDir");
    expect(config).toHaveProperty("weatherLat");
    expect(config).toHaveProperty("weatherLon");
    expect(config).toHaveProperty("appTitle");
    expect(config).toHaveProperty("agentName");
    expect(config).toHaveProperty("agentEmoji");
    expect(config).toHaveProperty("agentDescription");
  });
});
