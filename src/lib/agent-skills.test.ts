import { describe, it, expect } from "vitest";
import { getAgentSkillMappings, getAllUsedSkills } from "@/lib/agent-skills";

// Mock fs module for tests
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
    readFileSync: vi.fn(() => ""),
    statSync: vi.fn(() => ({ isDirectory: () => true })),
  },
  existsSync: vi.fn(() => false),
  readdirSync: vi.fn(() => []),
  readFileSync: vi.fn(() => ""),
  statSync: vi.fn(() => ({ isDirectory: () => true })),
}));

describe("agent-skills", () => {
  describe("getAgentSkillMappings", () => {
    it("returns empty array when no workspaces exist", () => {
      const result = getAgentSkillMappings();
      expect(result).toEqual([]);
    });
  });

  describe("getAllUsedSkills", () => {
    it("returns empty array when no skills exist", () => {
      const result = getAllUsedSkills();
      expect(result).toEqual([]);
    });
  });
});
