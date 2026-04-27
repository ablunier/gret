import { test, expect, describe } from "bun:test";
import { parseResponse } from "../response-parser.js";

describe("parseResponse", () => {
  test("parses valid JSON with known animation", () => {
    const raw = JSON.stringify({ animation: "purr", text: "*purrs*" });
    const result = parseResponse(raw);
    expect(result).toEqual({ animation: "purr", text: "*purrs*" });
  });

  test("falls back to loaf on invalid JSON", () => {
    const raw = "not json at all";
    const result = parseResponse(raw);
    expect(result.animation).toBe("loaf");
    expect(result.text).toBe(raw);
  });

  test("falls back to loaf on unknown animation name", () => {
    const raw = JSON.stringify({ animation: "fly", text: "zoom" });
    const result = parseResponse(raw);
    expect(result.animation).toBe("loaf");
    expect(result.text).toBe("zoom");
  });

  test("falls back to loaf when animation field is missing", () => {
    const raw = JSON.stringify({ text: "meow" });
    const result = parseResponse(raw);
    expect(result.animation).toBe("loaf");
    expect(result.text).toBe("meow");
  });

  test("falls back to loaf when animation field is not a string", () => {
    const raw = JSON.stringify({ animation: 42, text: "beep" });
    const result = parseResponse(raw);
    expect(result.animation).toBe("loaf");
  });

  test("uses raw string as text when text field is not a string", () => {
    const raw = JSON.stringify({ animation: "hiss", text: 99 });
    const result = parseResponse(raw);
    expect(result.animation).toBe("hiss");
    expect(result.text).toBe(raw);
  });

  test("accepts all registered animation names", () => {
    const animations = [
      "idle", "thinking", "purr", "stretch", "pounce", "hiss",
      "sleep", "curious", "loaf", "knock", "groom", "zoomies",
      "blep", "scared", "love",
    ];
    for (const anim of animations) {
      const raw = JSON.stringify({ animation: anim, text: "ok" });
      const result = parseResponse(raw);
      expect(result.animation).toBe(anim);
    }
  });

  test("handles empty string gracefully", () => {
    const result = parseResponse("");
    expect(result.animation).toBe("loaf");
  });
});
