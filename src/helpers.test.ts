import { describe, it, expect } from "vitest";
import { fmtPrice, capitalize, cardImg } from "./helpers";
import type { ScryfallCard } from "./types";

describe("fmtPrice", () => {
  it("formats a price string to two decimal places with dollar sign", () => {
    expect(fmtPrice("1.5")).toBe("$1.50");
  });

  it("handles whole numbers", () => {
    expect(fmtPrice("25")).toBe("$25.00");
  });

  it("returns dash for undefined", () => {
    expect(fmtPrice(undefined)).toBe("—");
  });

  it("returns dash for empty string", () => {
    expect(fmtPrice("")).toBe("—");
  });

  it("formats zero correctly", () => {
    expect(fmtPrice("0")).toBe("$0.00");
  });

  it("handles long decimals", () => {
    expect(fmtPrice("12.999")).toBe("$13.00");
  });
});

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("preserves remaining casing", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });
});

describe("cardImg", () => {
  it("returns image from image_uris when available", () => {
    const card: ScryfallCard = {
      id: "1",
      name: "Test",
      image_uris: { small: "https://img/small.jpg", normal: "https://img/normal.jpg" },
    };
    expect(cardImg(card, "small")).toBe("https://img/small.jpg");
    expect(cardImg(card, "normal")).toBe("https://img/normal.jpg");
  });

  it("defaults to small size", () => {
    const card: ScryfallCard = {
      id: "1",
      name: "Test",
      image_uris: { small: "https://img/small.jpg" },
    };
    expect(cardImg(card)).toBe("https://img/small.jpg");
  });

  it("falls back to first card face image", () => {
    const card: ScryfallCard = {
      id: "1",
      name: "DFC",
      card_faces: [
        { name: "Front", image_uris: { small: "https://img/front.jpg" } },
        { name: "Back", image_uris: { small: "https://img/back.jpg" } },
      ],
    };
    expect(cardImg(card, "small")).toBe("https://img/front.jpg");
  });

  it("returns null when no images exist", () => {
    const card: ScryfallCard = { id: "1", name: "No image" };
    expect(cardImg(card)).toBeNull();
  });

  it("returns null for undefined card", () => {
    expect(cardImg(undefined)).toBeNull();
  });
});
