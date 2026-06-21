import type { UnitSystem } from "../api/types";
import { num } from "./format";

// The backend always stores metric (kg / grams). These helpers convert to and
// from the user's preferred display units. Energy (kcal) is identical in both
// systems and is never converted.
const LB_PER_KG = 2.2046226218;
const OZ_PER_G = 0.0352739619;

export interface Units {
  system: UnitSystem;
  /** Large body weight unit label: "kg" or "lb". */
  weightUnit: string;
  /** Small food/portion mass unit label: "g" or "oz". */
  massUnit: string;
  /** Metric kg -> display number (lb when imperial). */
  fromKg: (kg: number) => number;
  /** Metric grams -> display number (oz when imperial). */
  fromG: (g: number) => number;
  /** Display number -> metric kg (for API payloads). */
  toKg: (val: number) => number;
  /** Display number -> metric grams (for API payloads). */
  toG: (val: number) => number;
  /** Format a metric kg value as a localized string with unit, e.g. "12.3 lb". */
  weight: (kg: number | null | undefined, digits?: number) => string;
  /** Format a metric grams value as a localized string with unit, e.g. "3.2 oz". */
  mass: (g: number | null | undefined, digits?: number) => string;
}

export function makeUnits(system: UnitSystem): Units {
  const imperial = system === "imperial";

  const fromKg = (kg: number) => (imperial ? kg * LB_PER_KG : kg);
  const fromG = (g: number) => (imperial ? g * OZ_PER_G : g);
  const toKg = (val: number) => (imperial ? val / LB_PER_KG : val);
  const toG = (val: number) => (imperial ? val / OZ_PER_G : val);

  const weightUnit = imperial ? "lb" : "kg";
  const massUnit = imperial ? "oz" : "g";

  return {
    system,
    weightUnit,
    massUnit,
    fromKg,
    fromG,
    toKg,
    toG,
    weight: (kg, digits = imperial ? 1 : 2) =>
      kg == null ? "—" : `${num(fromKg(kg), digits)} ${weightUnit}`,
    mass: (g, digits = imperial ? 1 : 0) =>
      g == null ? "—" : `${num(fromG(g), digits)} ${massUnit}`,
  };
}
