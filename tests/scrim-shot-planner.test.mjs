import test from "node:test";
import assert from "node:assert/strict";
import {
  validate,
  parsePlan,
  cards,
  summary,
  FIELDS,
} from "../scrim/shot-planner/model.mjs";
const seed = () => ({
  version: 1,
  title: "Repeated product shoot",
  products: ["Mug A", "Bowl B"],
  shots: ["hero", "detail"],
  setup: Object.fromEntries(FIELDS.map((k) => [k, ""])),
  notes: "Keep the handle visible.",
  completed: ["0:hero"],
});
test("two products generate four stable distinct shots and retain B when A completes", () => {
  const p = validate(seed());
  assert.deepEqual(
    cards(p).map((x) => x.id),
    ["0:hero", "0:detail", "1:hero", "1:detail"],
  );
  assert.equal(cards(p)[2].product, "Bowl B");
  assert.deepEqual(p.completed, ["0:hero"]);
});
test("export/import retains setup, completion and multilingual punctuation", () => {
  const p = seed();
  p.products = ["İzmir fincanı", "Tasse — groß"];
  p.setup.light = "Window at left, reflector 30 cm";
  assert.deepEqual(parsePlan(JSON.stringify(p)), p);
});
test("invalid import leaves existing input object untouched", () => {
  const p = seed(),
    snapshot = structuredClone(p);
  for (const bad of ["", "{}", "null", "[]", '{"version":2}'])
    assert.throws(() => parsePlan(bad));
  assert.deepEqual(p, snapshot);
});
test("reject malformed shot values, prototype names, duplicates and empty selection", () => {
  for (const shots of [
    [],
    ["hero", "hero"],
    ["__proto__"],
    [["hero"]],
    [1],
    [null],
  ])
    assert.throws(() => validate({ ...seed(), shots }));
});
test("reject missing setup fields, nontext and too long notes", () => {
  assert.throws(() => validate({ ...seed(), setup: {} }));
  assert.throws(() =>
    validate({ ...seed(), setup: { ...seed().setup, light: 55 } }),
  );
  assert.throws(() => validate({ ...seed(), notes: "a".repeat(601) }));
});
test("only exact shot IDs may be marked complete", () => {
  for (const completed of [
    ["2:hero"],
    ["0:hero", "0:hero"],
    [1],
    ["0:packaging"],
  ])
    assert.throws(() => validate({ ...seed(), completed }));
});
test("reject zero/21 products, duplicate SKU, empty and multiline product", () => {
  for (const products of [
    [],
    Array.from({ length: 21 }, (_, i) => `${i}`),
    ["A", " a "],
    [""],
    ["A\nB"],
    ["x".repeat(81)],
  ])
    assert.throws(() => validate({ ...seed(), products, completed: [] }));
});
test("20 products times four types fits export and roundtrip", () => {
  const p = validate({
    ...seed(),
    products: Array.from({ length: 20 }, (_, i) => `SKU-${i}`),
    shots: ["hero", "detail", "scale", "packaging"],
  });
  assert.equal(cards(p).length, 80);
  assert.deepEqual(parsePlan(JSON.stringify(p)), p);
});
test("unexpected fields are discarded, never propagated to exported plan", () => {
  const p = seed();
  p.tracker = "https://example.invalid";
  p.setup.extra = "unrecognized";
  assert.equal(validate(p).tracker, undefined);
  assert.equal(validate(p).setup.extra, undefined);
});
test("HTML-looking notes remain plain strings for safe rendering", () => {
  const p = seed();
  p.products = ["<img src=x onerror=alert(1)>"];
  p.completed = [];
  assert.equal(validate(p).products[0], p.products[0]);
  assert.ok(summary(p).includes(p.products[0]));
});
test("copy checklist includes actual setup and explicit missing values", () => {
  const p = seed();
  p.setup.camera = "Camera A";
  const text = summary(p);
  assert.ok(text.includes("Camera & lens: Camera A"));
  assert.ok(text.includes("Light position & modifier: Not recorded"));
  assert.ok(text.includes("[x] 1. Mug A — Hero"));
  assert.ok(text.includes("[ ] 3. Bowl B — Hero"));
});
test("oversized import rejected before parsing", () =>
  assert.throws(() => parsePlan(" ".repeat(32769)), /32 KB/));
