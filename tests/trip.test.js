import test from "node:test";
import assert from "node:assert/strict";
import {
  initialTrip,
  itineraryText,
  totalCost,
  validateTrip,
} from "../lib/trip.js";

test("sample trip passes the import schema", () =>
  assert.equal(validateTrip(initialTrip), true));
test("budget sums every day and handles empty days", () => {
  assert.equal(totalCost(initialTrip.days), 46);
  assert.equal(totalCost([{ stops: [] }]), 0);
});
test("import rejects dangerous and malformed numeric values", () => {
  for (const budget of [-1, NaN, Infinity, "400", 1e8])
    assert.equal(validateTrip({ ...initialTrip, budget }), false);
});
test("import rejects duplicate identifiers", () => {
  const trip = structuredClone(initialTrip);
  trip.days[1].stops[0].id = trip.days[0].stops[0].id;
  assert.equal(validateTrip(trip), false);
});
test("import validates time, category, and negative costs", () => {
  for (const patch of [
    { time: "25:30" },
    { time: "12:99" },
    { category: "Other" },
    { cost: -2 },
    { name: " " },
  ]) {
    const trip = structuredClone(initialTrip);
    Object.assign(trip.days[0].stops[0], patch);
    assert.equal(validateTrip(trip), false);
  }
});
test("import requires at least one day and caps the itinerary size", () => {
  assert.equal(validateTrip({ ...initialTrip, days: [] }), false);
  assert.equal(
    validateTrip({ ...initialTrip, days: Array(15).fill(initialTrip.days[0]) }),
    false,
  );
});
test("export includes all days, budget, and empty day guidance", () => {
  const text = itineraryText(initialTrip);
  assert.match(text, /Planned: €46/);
  assert.match(text, /## Day 3/);
  assert.match(text, /Leave room/);
});
