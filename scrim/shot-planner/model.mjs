export const TYPES = {
  hero: {
    label: "Hero",
    prompt: "Show the whole product. Leave room for the intended crop.",
  },
  detail: {
    label: "Detail",
    prompt: "Show the material, finish or feature a buyer needs to inspect.",
  },
  scale: {
    label: "Scale",
    prompt: "Use a familiar, appropriate size reference. Keep it consistent.",
  },
  packaging: {
    label: "Packaging",
    prompt:
      "Show what is included. Remove items that are not part of the purchase.",
  },
};
export const FIELDS = [
  "camera",
  "position",
  "light",
  "background",
  "whiteBalance",
  "exposure",
  "crop",
];
export const LABELS = [
  "Camera & lens",
  "Camera position & distance",
  "Light position & modifier",
  "Background & product marks",
  "White balance reference",
  "Exposure notes",
  "Delivery crop & size",
];
export function validate(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.version !== 1
  )
    throw Error("Use a Scrim shot plan version 1 file.");
  const text = (s, limit) =>
    typeof s === "string" &&
    s.length <= limit &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s);
  if (!text(value.title, 100) || !value.title.trim())
    throw Error("Give the shoot a name (up to 100 characters).");
  if (
    !Array.isArray(value.products) ||
    value.products.length < 1 ||
    value.products.length > 20 ||
    value.products.some((p) => !text(p, 80) || !p.trim() || /[\r\n]/.test(p))
  )
    throw Error("Add 1–20 product names, up to 80 characters each.");
  if (
    new Set(value.products.map((p) => p.trim().toLowerCase())).size !==
    value.products.length
  )
    throw Error("Give each product a different name or SKU.");
  if (
    !Array.isArray(value.shots) ||
    !value.shots.length ||
    value.shots.length > 4 ||
    value.shots.some(
      (s) => typeof s !== "string" || !Object.hasOwn(TYPES, s),
    ) ||
    new Set(value.shots).size !== value.shots.length
  )
    throw Error("Choose at least one of the four shot types.");
  if (
    !value.setup ||
    typeof value.setup !== "object" ||
    FIELDS.some((k) => !text(value.setup[k], 200))
  )
    throw Error("Setup notes must be text, up to 200 characters per field.");
  if (!text(value.notes, 600))
    throw Error("Shoot notes must be text, up to 600 characters.");
  const ids = new Set(
    value.products.flatMap((_, i) => value.shots.map((s) => `${i}:${s}`)),
  );
  if (
    !Array.isArray(value.completed) ||
    value.completed.some((id) => typeof id !== "string" || !ids.has(id)) ||
    new Set(value.completed).size !== value.completed.length
  )
    throw Error("The completed shots do not match this plan.");
  return {
    version: 1,
    title: value.title.trim(),
    products: value.products.map((p) => p.trim()),
    shots: [...value.shots],
    setup: Object.fromEntries(FIELDS.map((k) => [k, value.setup[k]])),
    notes: value.notes,
    completed: [...value.completed],
  };
}
export function parsePlan(text) {
  if (typeof text !== "string" || text.length > 32768)
    throw Error("Choose a shot plan file smaller than 32 KB.");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw Error("This file is not valid JSON. Your current plan is unchanged.");
  }
  return validate(value);
}
export function cards(plan) {
  return plan.products.flatMap((product, i) =>
    plan.shots.map((type) => ({
      id: `${i}:${type}`,
      product,
      type,
      ...TYPES[type],
    })),
  );
}
export function summary(plan) {
  const p = validate(plan);
  return [
    `${p.title} — Scrim shot plan`,
    "",
    ...FIELDS.map((k, i) => `${LABELS[i]}: ${p.setup[k] || "Not recorded"}`),
    "",
    ...cards(p).map(
      (c, i) =>
        `${p.completed.includes(c.id) ? "[x]" : "[ ]"} ${i + 1}. ${c.product} — ${c.label}\n    ${c.prompt}`,
    ),
    "",
    `Shoot notes: ${p.notes || "None"}`,
    "",
    "Repeat: match the setup notes, make a test image, compare with your reference, then start the next batch.",
    "Made with Scrim’s free shot planner: https://berkemd.github.io/norea/scrim/shot-planner/",
  ].join("\n");
}
