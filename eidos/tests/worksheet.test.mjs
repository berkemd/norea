import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(
  new URL("../worksheet.js", import.meta.url),
  "utf8",
);
const { buildSummary, createCopyController } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const example = (selected, include = {}) => ({
  selected,
  include,
  values: {
    title: "Visible work",
    situation: "PRIVATE situation",
    contribution: "I wrote the guide",
    outcome: "PRIVATE outcome",
    source: "https://example.com/PRIVATE",
    note: "PRIVATE note",
  },
});
function pending() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("starts empty and excludes an unselected example and every unselected field", () => {
  assert.equal(
    buildSummary({
      includePurpose: true,
      purpose: "PRIVATE purpose",
      examples: [example(false, { title: true })],
    }),
    "",
  );
  assert.equal(buildSummary({ examples: [example(true)] }), "");
  const output = buildSummary({
    purpose: "PRIVATE purpose",
    examples: [
      example(true, { title: true, contribution: true }),
      {
        ...example(false, { note: true }),
        values: { note: "PRIVATE other example" },
      },
    ],
  });
  assert.ok(output.includes("Visible work"));
  assert.ok(output.includes("I wrote the guide"));
  assert.ok(!output.includes("PRIVATE"));
});
test("purpose and private note require independent explicit opt-in", () => {
  const state = {
    purpose: "A customer discussion",
    includePurpose: true,
    examples: [example(true, { note: true })],
  };
  const output = buildSummary(state);
  assert.ok(output.includes("Purpose: A customer discussion"));
  assert.ok(output.includes("Private working note: PRIVATE note"));
  assert.ok(!output.includes("Visible work"));
  assert.ok(
    !buildSummary({ ...state, includePurpose: false }).includes("customer"),
  );
  assert.equal(
    buildSummary({ ...state, examples: [example(false, { note: true })] }),
    "",
  );
});
test("keeps HTML-like content literal and does not silently truncate selected input", () => {
  const literal =
    '<img src=x onerror="alert(1)"> & <script>secret</script>' +
    "x".repeat(1800);
  const output = buildSummary({
    examples: [
      {
        selected: true,
        values: { contribution: literal },
        include: { contribution: true },
      },
    ],
  });
  assert.ok(output.endsWith(literal));
  assert.ok(!source.includes("innerHTML"));
});
test("enforces two examples and strict boolean selection", () => {
  const output = buildSummary({
    examples: [
      example(true, { title: true }),
      example("true", { note: true }),
      {
        selected: true,
        include: { title: true },
        values: { title: "THIRD PRIVATE" },
      },
    ],
  });
  assert.ok(!output.includes("PRIVATE"));
  assert.ok(!output.includes("THIRD"));
});
test("announces copy only after clipboard resolution and refuses duplicate requests", async () => {
  const operation = pending();
  const states = [];
  const writes = [];
  const controller = createCopyController({
    getText: () => "exact preview",
    write: (value) => {
      writes.push(value);
      return operation.promise;
    },
    onState: (state) => states.push(state),
  });
  const first = controller.copy();
  await controller.copy();
  assert.deepEqual(writes, ["exact preview"]);
  assert.equal(states.at(-1).status, "Copying…");
  assert.equal(states.at(-1).busy, true);
  operation.resolve();
  await first;
  assert.match(states.at(-1).status, /^Copied/);
  assert.equal(states.at(-1).busy, false);
});
test("clipboard rejection offers manual selection without false success", async () => {
  const states = [];
  const controller = createCopyController({
    getText: () => "preview",
    write: async () => {
      throw new Error("denied");
    },
    onState: (state) => states.push(state),
  });
  await controller.copy();
  assert.match(states.at(-1).status, /Select text/);
  assert.ok(!states.some(({ status }) => status.startsWith("Copied")));
});
test("edited and cleared worksheets never receive stale copy success or failure", async () => {
  for (const [message, fail] of [
    ["", false],
    ["Worksheet cleared.", false],
    ["Worksheet cleared.", true],
  ]) {
    const operation = pending();
    const states = [];
    const controller = createCopyController({
      getText: () => "old preview",
      write: () => operation.promise,
      onState: (state) => states.push(state),
    });
    const copying = controller.copy();
    controller.invalidate(message);
    if (fail) operation.reject(new Error("denied"));
    else operation.resolve();
    await copying;
    assert.equal(states.at(-1).status, message);
    assert.equal(states.at(-1).busy, false);
  }
});
