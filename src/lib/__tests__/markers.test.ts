import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOUSE,
  MARKER_ICONS,
  PALETTE,
  ROOF_SHAPES,
  TOPPERS,
  WINDOWS,
  decodeHouse,
  encodeHouse,
  isValidIcon,
  markerSvg,
  randomHouse,
} from "../markers";

describe("preset icons", () => {
  it("every preset renders an svg and is accepted", () => {
    for (const icon of MARKER_ICONS) {
      expect(isValidIcon(icon.key)).toBe(true);
      expect(markerSvg(icon.key)).toMatch(/^<svg[\s\S]+<\/svg>$/);
    }
  });

  it("falls back to the first preset for an unknown key", () => {
    expect(markerSvg("nope")).toBe(markerSvg(MARKER_ICONS[0].key));
    expect(isValidIcon("nope")).toBe(false);
  });

  it("marks visited pins differently", () => {
    expect(markerSvg("book", true)).not.toBe(markerSvg("book", false));
  });
});

describe("custom house designs", () => {
  it("round-trips a design", () => {
    expect(decodeHouse(encodeHouse(DEFAULT_HOUSE))).toEqual(DEFAULT_HOUSE);
  });

  it("round-trips every option of every field", () => {
    const counts = [PALETTE.length, PALETTE.length, PALETTE.length, ROOF_SHAPES.length, WINDOWS.length, TOPPERS.length];
    const keys = ["pin", "roof", "wall", "shape", "window", "topper"] as const;
    keys.forEach((key, i) => {
      for (let v = 0; v < counts[i]; v++) {
        const design = { ...DEFAULT_HOUSE, [key]: v };
        expect(decodeHouse(encodeHouse(design))).toEqual(design);
        expect(markerSvg(encodeHouse(design))).toContain("<svg");
      }
    });
  });

  it("rejects codes that are malformed or out of range", () => {
    for (const bad of ["house:", "house:12345", "house:1234567", "house:41800a", "house:418009", "book"]) {
      expect(decodeHouse(bad)).toBeNull();
    }
  });

  it("accepts anything randomHouse produces", () => {
    for (let i = 0; i < 50; i++) {
      const code = encodeHouse(randomHouse());
      expect(isValidIcon(code)).toBe(true);
      expect(decodeHouse(code)).not.toBeNull();
    }
  });
});
