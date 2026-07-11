import { describe, it, expect } from "vitest";
import { formatBRL, formatPercentage } from "./formatters";

describe("formatBRL", () => {
  it("formats a simple value with thousands separator", () => {
    expect(formatBRL(1234.56)).toBe("R$ 1.234,56");
  });

  it("formats zero", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
  });

  it("formats large numbers with multiple thousands separators", () => {
    expect(formatBRL(1234567.89)).toBe("R$ 1.234.567,89");
  });

  it("formats small decimal values", () => {
    expect(formatBRL(0.5)).toBe("R$ 0,50");
  });

  it("guards against NaN", () => {
    expect(formatBRL(NaN)).toBe("R$ 0,00");
  });

  it("guards against undefined", () => {
    expect(formatBRL(undefined as any)).toBe("R$ 0,00");
  });

  it("guards against null", () => {
    expect(formatBRL(null as any)).toBe("R$ 0,00");
  });

  it("formats integer values with ,00 decimals", () => {
    expect(formatBRL(100)).toBe("R$ 100,00");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatBRL(10.999)).toBe("R$ 11,00");
  });
});

describe("formatPercentage", () => {
  it("formats with default 1 decimal place", () => {
    expect(formatPercentage(45.678)).toBe("45,7%");
  });

  it("formats with custom decimal places", () => {
    expect(formatPercentage(45.678, 2)).toBe("45,68%");
  });

  it("formats zero", () => {
    expect(formatPercentage(0)).toBe("0,0%");
  });

  it("formats 100%", () => {
    expect(formatPercentage(100)).toBe("100,0%");
  });

  it("guards against NaN", () => {
    expect(formatPercentage(NaN)).toBe("0,0%");
  });

  it("guards against undefined", () => {
    expect(formatPercentage(undefined as any)).toBe("0,0%");
  });

  it("formats with 0 decimal places", () => {
    expect(formatPercentage(45.678, 0)).toBe("46%");
  });
});

import * as fc from "fast-check";

// Feature: financial-dashboard, Property 4: BRL currency formatting
describe("formatBRL - Property 4: BRL currency formatting", () => {
  /**
   * **Validates: Requirements 9.1, 3.1, 4.2**
   *
   * For any non-negative number, formatBRL SHALL produce a string matching
   * the pattern R$ X.XXX,XX where the integer part uses dots as thousands
   * separators, the decimal part uses a comma, and exactly 2 decimal digits
   * are present.
   */
  it("should always start with 'R$ '", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1_000_000_000, noNaN: true, noDefaultInfinity: true }),
        (value) => {
          const result = formatBRL(value);
          expect(result.startsWith("R$ ")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have exactly one comma followed by exactly 2 digits at the end", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1_000_000_000, noNaN: true, noDefaultInfinity: true }),
        (value) => {
          const result = formatBRL(value);
          // The string after "R$ " should end with ,XX where X is a digit
          const afterPrefix = result.slice(3);
          expect(afterPrefix).toMatch(/,\d{2}$/);
          // Exactly one comma in the numeric part
          const commaCount = (afterPrefix.match(/,/g) || []).length;
          expect(commaCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should use dots as thousands separators in the integer part", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1_000_000_000, noNaN: true, noDefaultInfinity: true }),
        (value) => {
          const result = formatBRL(value);
          const afterPrefix = result.slice(3); // Remove "R$ "
          const [integerPart] = afterPrefix.split(",");

          // If the integer part contains dots, they must be valid thousands separators
          if (integerPart.includes(".")) {
            // Split by dots - each group between dots should have exactly 3 digits
            // except the first group which can have 1-3 digits
            const groups = integerPart.split(".");
            expect(groups[0].length).toBeGreaterThanOrEqual(1);
            expect(groups[0].length).toBeLessThanOrEqual(3);
            for (let i = 1; i < groups.length; i++) {
              expect(groups[i].length).toBe(3);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should contain only valid characters (digits, dots, comma, space, and R$)", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1_000_000_000, noNaN: true, noDefaultInfinity: true }),
        (value) => {
          const result = formatBRL(value);
          // Should match the full BRL format pattern: R$ followed by digits/dots, comma, 2 digits
          expect(result).toMatch(/^R\$ [\d.]+,\d{2}$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
