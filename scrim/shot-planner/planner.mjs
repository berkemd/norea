import { validate, parsePlan, FIELDS, LABELS } from "./model.mjs";
import { createLocale } from "./locale.mjs";
const {
  t,
  cards,
  summary,
  progress: progressText,
  notes: notesText,
  importDescription,
} = createLocale(document.documentElement.lang);
const $ = (id) => document.getElementById(id);
let plan = null;
let pending = null;
let revision = 0;
let importSequence = 0;
let feedbackSequence = 0;

function hasDraft() {
  return (
    plan !== null ||
    ["title", "products", "notes", ...FIELDS].some(
      (id) => $(id).value !== $(id).defaultValue,
    ) ||
    [...document.querySelectorAll("[name=shot]")].some(
      (shot) => shot.checked !== shot.defaultChecked,
    )
  );
}
function status(message, error = false) {
  feedbackSequence++;
  $("status").textContent = t(message);
  $("status").classList.toggle("error", error);
}
function dismissStaleImport() {
  if (!pending) return false;
  pending = null;
  $("import-preview").hidden = true;
  return true;
}
function reselectFileMessage() {
  return t(
    "The plan changed while the file was opening. Choose the file again.",
  );
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
  $("new-batch").disabled = plan.completed.length === 0;
  $("progress").textContent = progressText(
    plan.completed.length,
    cards(plan).length,
  );
}
function render() {
  $("empty").hidden = true;
  $("result").hidden = false;
  $("result-title").textContent = plan.title;
  $("setup-list").replaceChildren();
  FIELDS.forEach((k, i) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = t(LABELS[i]);
    dd.textContent = plan.setup[k] || t("Not recorded");
    $("setup-list").append(dt, dd);
  });
  $("result-notes").textContent = plan.notes ? notesText(plan.notes) : "";
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
      if (dismissStaleImport()) status(reselectFileMessage(), true);
      showBatchConfirmation(false);
      progress();
    });
  });
  progress();
}
function accept(p, message) {
  showBatchConfirmation(false);
  pending = null;
  $("import-preview").hidden = true;
  plan = p;
  revision++;
  render();
  status(message);
  $("plan-heading").focus();
}
$("planner").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const form = readForm();
    const next = plan
      ? {
          ...form,
          shots: sameShotSelection(form.shots, plan.shots)
            ? plan.shots
            : form.shots,
          title:
            form.title === inputText(plan.title).trim()
              ? plan.title
              : form.title,
          setup: Object.fromEntries(
            FIELDS.map((key) => [
              key,
              form.setup[key] === inputText(plan.setup[key])
                ? plan.setup[key]
                : form.setup[key],
            ]),
          ),
          notes:
            form.notes === textareaText(plan.notes) ? plan.notes : form.notes,
          completed: matchesForm(form, {
            ...plan,
            title: form.title,
            notes: form.notes,
          })
            ? plan.completed
            : form.completed,
        }
      : form;
    accept(
      plan && matchesForm(form, plan) ? plan : next,
      t("Plan built. Export a file to keep it for your next shoot."),
    );
  } catch (error) {
    status(t(error.message), true);
    $("status").focus();
  }
});
$("example").addEventListener("click", () => {
  if (
    hasDraft() &&
    !confirm(
      t(
        "Replace the current entries with an example? Export your existing plan first if needed.",
      ),
    )
  )
    return;
  const p = {
    version: 1,
    title: t("Ceramics catalogue — example"),
    products: [t("Blue mug, 250 ml"), t("Sand bowl, medium")],
    shots: ["hero", "detail", "scale"],
    setup: {
      camera: t("Your camera and lens"),
      position: t("Record measured tripod height and distance"),
      light: t("Record window direction and reflector placement"),
      background: t("Neutral backdrop; mark product centre"),
      whiteBalance: t("Record the setting used for the reference image"),
      exposure: t("Record your tested camera settings"),
      crop: t("Square listing; leave space around the item"),
    },
    notes: t("Example only. Replace these notes with your actual setup."),
    completed: [],
  };
  fill(p);
  accept(
    validate(p),
    t("Example loaded. Replace it with your own products and settings."),
  );
});
$("import").addEventListener("change", async () => {
  const sequence = ++importSequence;
  const file = $("import").files[0];
  pending = null;
  $("import-preview").hidden = true;
  if (!file) return;
  const currentRevision = revision;
  try {
    if (file.size > 32768)
      throw Error(t("Choose a shot plan file smaller than 32 KB."));
    const bytes = await file.arrayBuffer();
    if (sequence !== importSequence) return;
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw Error(t("This shot plan is not valid UTF-8."));
    }
    const candidate = parsePlan(text);
    if (revision !== currentRevision)
      throw Error(
        t(
          "The plan changed while the file was opening. Choose the file again.",
        ),
      );
    pending = { plan: candidate, revision: currentRevision };
    $("import-description").textContent = importDescription(candidate);
    $("import-preview").hidden = false;
    status(
      t(
        "Saved plan checked. Confirm below the file field to replace your entries.",
      ),
    );
  } catch (error) {
    if (sequence === importSequence) {
      status(
        `${t(error.message)} ${t("Current entries are unchanged.")}`,
        true,
      );
    }
  } finally {
    if (sequence === importSequence) $("import").value = "";
  }
});
$("apply-import").addEventListener("click", () => {
  if (!pending) return;
  const { plan: p, revision: reviewedRevision } = pending;
  pending = null;
  $("import-preview").hidden = true;
  if (reviewedRevision !== revision) {
    status(
      t("The plan changed while the file was opening. Choose the file again."),
      true,
    );
    $("import").focus();
    return;
  }
  fill(p);
  accept(p, t("Saved plan opened, including its completion marks."));
});
$("cancel-import").addEventListener("click", () => {
  pending = null;
  $("import-preview").hidden = true;
  status(t("Import cancelled. Current entries are unchanged."));
  $("import").focus();
});
$("planner").addEventListener("input", () => {
  revision++;
  if (dismissStaleImport()) {
    status(reselectFileMessage(), true);
    return;
  }
  if (plan)
    status(
      t("Entries changed. Build the plan again before exporting these edits."),
    );
});
function inputText(value) {
  return value.replace(/[\r\n]/g, "");
}
function textareaText(value) {
  return value.replace(/\r\n?/g, "\n");
}
function sameShotSelection(left, right) {
  return (
    left.length === right.length && left.every((shot) => right.includes(shot))
  );
}
function matchesForm(form, saved) {
  if (!sameShotSelection(form.shots, saved.shots)) return false;
  const visiblePlan = {
    ...saved,
    // Compare what the form can display, keeping original imported text intact.
    title: inputText(saved.title).trim(),
    setup: Object.fromEntries(
      FIELDS.map((key) => [key, inputText(saved.setup[key])]),
    ),
    notes: textareaText(saved.notes),
  };
  const visibleForm = {
    ...form,
    shots: saved.shots,
    completed: saved.completed,
  };
  return JSON.stringify(visibleForm) === JSON.stringify(visiblePlan);
}
function requireCurrent() {
  if (!plan) throw Error(t("Build a plan first."));
  if (!matchesForm(readForm(), plan))
    throw Error(
      t("Entries changed. Build the plan again before exporting these edits."),
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
      t(
        "Download prepared. Keep the JSON file with your reference image for next time.",
      ),
    );
  } catch (e) {
    status(t(e.message), true);
  }
});
$("copy").addEventListener("click", async () => {
  const attempt = ++feedbackSequence;
  const planRevision = revision;
  try {
    requireCurrent();
  } catch (error) {
    status(t(error.message), true);
    return;
  }
  try {
    await navigator.clipboard.writeText(summary(plan));
    if (attempt !== feedbackSequence || planRevision !== revision) return;
    status(t("Checklist copied. Paste it into your own notes or message."));
  } catch {
    if (attempt !== feedbackSequence || planRevision !== revision) return;
    status(t("Copy failed. Export the file or print your plan instead."), true);
  }
});
$("print").addEventListener("click", () => {
  try {
    requireCurrent();
    window.print();
  } catch (e) {
    status(t(e.message), true);
  }
});
function showBatchConfirmation(visible) {
  $("new-batch-confirmation").hidden = !visible;
  $("new-batch").setAttribute("aria-expanded", String(visible));
}
$("new-batch").addEventListener("click", () => {
  if (!plan?.completed.length) return;
  showBatchConfirmation(true);
  $("keep-batch-marks").focus();
});
$("keep-batch-marks").addEventListener("click", () => {
  showBatchConfirmation(false);
  $("new-batch").focus();
});
$("clear-batch-marks").addEventListener("click", () => {
  if ($("new-batch-confirmation").hidden || !plan?.completed.length) return;
  showBatchConfirmation(false);
  plan.completed = [];
  revision++;
  render();
  $("plan-heading").focus();
  const cleared = t(
    "Completion marks cleared. The shot list and setup are unchanged.",
  );
  status(
    dismissStaleImport() ? `${cleared} ${reselectFileMessage()}` : cleared,
  );
});
window.addEventListener("beforeprint", () => {
  let warning = "";
  try {
    requireCurrent();
  } catch (error) {
    warning = error.message;
  }
  $("print-warning").textContent = warning;
  document.body.classList.toggle("print-plan-unavailable", warning !== "");
});
window.addEventListener("beforeunload", (e) => {
  if (hasDraft()) {
    e.preventDefault();
    e.returnValue = "";
  }
});
