import { test, expect, describe } from "bun:test";
import { buildSystemPrompt } from "../system-prompt.js";
import { ANIMATIONS } from "../../animations/animation-registry.js";

describe("buildSystemPrompt", () => {
  test("returns a non-empty string", () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  test("includes all response animations (excluding idle and thinking)", () => {
    const prompt = buildSystemPrompt();
    const excluded = new Set(["idle", "thinking"]);
    for (const name of Object.keys(ANIMATIONS)) {
      if (excluded.has(name)) {
        expect(prompt).not.toContain(`- ${name}:`);
      } else {
        expect(prompt).toContain(`- ${name}:`);
      }
    }
  });

  test("instructs LLM to return JSON only", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("animation");
    expect(prompt).toContain("text");
  });

  test("includes example responses", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("purr");
    expect(prompt).toContain("hiss");
    expect(prompt).toContain("love");
    expect(prompt).toContain("scared");
  });

  test("describes each animation", () => {
    const prompt = buildSystemPrompt();
    for (const [name, config] of Object.entries(ANIMATIONS)) {
      if (name === "idle" || name === "thinking") continue;
      expect(prompt).toContain(config.description);
    }
  });
});
