import {
  validate,
  parsePlan,
  cards,
  summary,
  FIELDS,
  LABELS,
} from "./model.mjs";
const $ = (id) => document.getElementById(id);
let plan = null;
let pending = null;
let revision = 0;
function status(message, error = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", error);
}
function readForm() {
  return validate({
    version: 1,
    title: $("title").value,
    products: $("products")
      .value.split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    shots: [...document.querySelectorAll("[name=shot]:checked")].map(
      (x) => x.value,
    ),
    setup: Object.fromEntries(FIELDS.map((k) => [k, $(k).value])),
    notes: $("notes").value,
    completed: [],
  });
}
function fill(p) {
  $("title").value = p.title;
  $("products").value = p.products.join("\n");
  document.querySelectorAll("[name=shot]").forEach((x) => {
    x.checked = p.shots.includes(x.value);
  });
  FIELDS.forEach((k) => {
    $(k).value = p.setup[k];
  });
  $("notes").value = p.notes;
}
function progress() {
  $("progress").textContent =
    `${plan.completed.length} of ${cards(plan).length} shots marked complete.`;
}
function render() {
  $("empty").hidden = true;
  $("result").hidden = false;
  $("new-batch").disabled = false;
  $("result-title").textContent = plan.title;
  $("setup-list").replaceChildren();
  FIELDS.forEach((k, i) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = LABELS[i];
    dd.textContent = plan.setup[k] || "Not recorded";
    $("setup-list").append(dt, dd);
  });
  $("result-notes").textContent = plan.notes
    ? `Shoot notes: ${plan.notes}`
    : "";
  $("shots").replaceChildren();
  cards(plan).forEach((c) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const check = document.createElement("input");
    const span = document.createElement("span");
    const small = document.createElement("small");
    check.type = "checkbox";
    check.checked = plan.completed.includes(c.id);
    check.dataset.shot = c.id;
    span.textContent = `${c.product} — ${c.label}`;
    small.textContent = c.prompt;
    span.append(small);
    label.append(check, span);
    li.append(label);
    $("shots").append(li);
    check.addEventListener("change", () => {
      plan.completed = check.checked
        ? [...plan.completed, c.id]
        : plan.completed.filter((x) => x !== c.id);
      revision++;
      progress();
    });
  });
  progress();
}
function accept(p, message) {
  plan = p;
  revision++;
  render();
  status(message);
  $("plan-heading").focus();
}
$("planner").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    accept(
      readForm(),
      "Plan built. Export a file to keep it for your next shoot.",
    );
  } catch (error) {
    status(error.message, true);
    $("status").focus();
  }
});
$("example").addEventListener("click", () => {
  if (
    (plan || $("products").value || $("title").value) &&
    !confirm(
      "Replace the current entries with an example? Export your existing plan first if needed.",
    )
  )
    return;
  const p = {
    version: 1,
    title: "Ceramics catalogue — example",
    products: ["Blue mug, 250 ml", "Sand bowl, medium"],
    shots: ["hero", "detail", "scale"],
    setup: {
      camera: "Your camera and lens",
      position: "Record measured tripod height and distance",
      light: "Record window direction and reflector placement",
      background: "Neutral backdrop; mark product centre",
      whiteBalance: "Record the setting used for the reference image",
      exposure: "Record your tested camera settings",
      crop: "Square listing; leave space around the item",
    },
    notes: "Example only. Replace these notes with your actual setup.",
    completed: [],
  };
  fill(p);
  accept(
    validate(p),
    "Example loaded. Replace it with your own products and settings.",
  );
});
$("import").addEventListener("change", async () => {
  const file = $("import").files[0];
  pending = null;
  $("import-preview").hidden = true;
  if (!file) return;
  const currentRevision = revision;
  try {
    if (file.size > 32768)
      throw Error("Choose a shot plan file smaller than 32 KB.");
    const candidate = parsePlan(await file.text());
    if (revision !== currentRevision)
      throw Error(
        "The plan changed while the file was opening. Choose the file again.",
      );
    pending = candidate;
    $("import-description").textContent =
      `Open “${candidate.title}”: ${candidate.products.length} products, ${cards(candidate).length} shots. Your current entries will be replaced only when you confirm.`;
    $("import-preview").hidden = false;
    status(
      "Saved plan checked. Confirm below the file field to replace your entries.",
    );
  } catch (error) {
    status(`${error.message} Current entries are unchanged.`, true);
  } finally {
    $("import").value = "";
  }
});
$("apply-import").addEventListener("click", () => {
  if (!pending) return;
  const p = pending;
  pending = null;
  $("import-preview").hidden = true;
  fill(p);
  accept(p, "Saved plan opened, including its completion marks.");
});
$("cancel-import").addEventListener("click", () => {
  pending = null;
  $("import-preview").hidden = true;
  status("Import cancelled. Current entries are unchanged.");
});
$("planner").addEventListener("input", () => {
  revision++;
  if (pending) {
    pending = null;
    $("import-preview").hidden = true;
  }
  if (plan)
    status(
      "Entries changed. Build the plan again before exporting these edits.",
    );
});
function requireCurrent() {
  if (!plan) throw Error("Build a plan first.");
  const form = readForm();
  if (
    JSON.stringify({ ...form, completed: plan.completed }) !==
    JSON.stringify(plan)
  )
    throw Error(
      "Entries changed. Build the plan again before exporting these edits.",
    );
}
$("export").addEventListener("click", () => {
  try {
    requireCurrent();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(plan, null, 2) + "\n"], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "scrim-shot-plan.json";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    status(
      "Download prepared. Keep the JSON file with your reference image for next time.",
    );
  } catch (e) {
    status(e.message, true);
  }
});
$("copy").addEventListener("click", async () => {
  try {
    requireCurrent();
    await navigator.clipboard.writeText(summary(plan));
    status("Checklist copied. Paste it into your own notes or message.");
  } catch (e) {
    status(
      e.message || "Copy failed. Export the file or print your plan instead.",
      true,
    );
  }
});
$("print").addEventListener("click", () => {
  try {
    requireCurrent();
    window.print();
  } catch (e) {
    status(e.message, true);
  }
});
$("new-batch").addEventListener("click", () => {
  if (!plan) return;
  plan.completed = [];
  revision++;
  render();
  status("Completion marks cleared. The shot list and setup are unchanged.");
});
window.addEventListener("beforeunload", (e) => {
  if (plan || $("products").value || $("title").value) {
    e.preventDefault();
    e.returnValue = "";
  }
});
