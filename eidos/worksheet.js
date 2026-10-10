export const FIELDS = [
  {
    key: "title",
    label: "Title",
    hint: "A short name you will recognise.",
    placeholder: "A clearer handover guide",
  },
  {
    key: "situation",
    label: "Situation or task",
    hint: "What needed to be done?",
    placeholder: "New colleagues needed a simpler way to find the right steps.",
  },
  {
    key: "contribution",
    label: "My contribution",
    hint: "Describe your own part, including work shared with others.",
    placeholder: "I interviewed two teammates and wrote the first draft.",
  },
  {
    key: "outcome",
    label: "Outcome",
    hint: "What happened? Uncertainty and unfinished work are fine.",
    placeholder:
      "The team tried the guide. We have not measured its effect yet.",
  },
  {
    key: "source",
    label: "Source link",
    hint: "Optional. Use a public HTTPS link you are comfortable including.",
    placeholder: "https://example.com/my-work",
  },
  {
    key: "note",
    label: "Private working note",
    hint: "Keep context for yourself. Include it only if you mean to disclose it.",
    placeholder: "A reminder for me, not the recipient.",
  },
];

/** Explicit allowlist. Neither draft text nor HTML is interpolated into markup. */
export function buildSummary(state) {
  const sections = [];
  for (const [index, example] of (state.examples ?? []).slice(0, 2).entries()) {
    if (example.selected !== true) continue;
    const lines = [];
    for (const field of FIELDS) {
      const value = String(example.values?.[field.key] ?? "").trim();
      if (example.include?.[field.key] === true && value)
        lines.push(`${field.label}: ${value}`);
    }
    if (lines.length)
      sections.push(`Example ${index + 1}\n${lines.join("\n\n")}`);
  }
  if (!sections.length) return "";
  const purpose =
    state.includePurpose === true ? String(state.purpose ?? "").trim() : "";
  return [
    "Work examples",
    "Self-authored examples; not independently verified credentials.",
    ...(purpose ? [`Purpose: ${purpose}`] : []),
    ...sections,
  ].join("\n\n");
}

/** A late clipboard response must not certify an edited or cleared worksheet. */
export function createCopyController({ write, getText, onState }) {
  let revision = 0;
  let busy = false;
  let status = "";
  const publish = () => onState({ busy, status });
  return {
    invalidate(message = "") {
      revision += 1;
      status = message;
      publish();
    },
    async copy() {
      const text = getText();
      if (busy || !text) return;
      const started = revision;
      busy = true;
      status = "Copying…";
      publish();
      try {
        await write(text);
        if (started === revision)
          status = "Copied. Only the preview text was copied.";
      } catch {
        if (started === revision)
          status =
            "Automatic copy was unavailable. Choose Select text, then copy it yourself.";
      } finally {
        busy = false;
        publish();
      }
    },
  };
}

function mountWorksheet(document) {
  const form = document.querySelector("#worksheet");
  if (!form) return;
  const examples = document.querySelector("#examples");
  const preview = document.querySelector("#preview");
  const copyButton = document.querySelector("#copy");
  const selectButton = document.querySelector("#select-preview");
  const status = document.querySelector("#copy-status");
  const fieldCount = document.querySelector("#preview-state");
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  for (let index = 0; index < 2; index += 1) {
    const card = element("fieldset", "", "example");
    card.id = `example-card-${index}`;
    card.tabIndex = -1;
    card.append(element("legend", `Example ${index + 1}`));
    const choice = element("label", "", "check example-choice");
    const selected = element("input");
    selected.type = "checkbox";
    selected.id = `example-${index}`;
    choice.append(
      selected,
      document.createTextNode(` Use example ${index + 1} in my summary`),
    );
    card.append(choice);
    for (const field of FIELDS) {
      const block = element("div", "", "field");
      const label = element("label", field.label, "field-label");
      label.htmlFor = `${field.key}-${index}`;
      const hint = element("p", field.hint, "hint");
      hint.id = `${field.key}-${index}-hint`;
      const input = element(
        field.key === "title" || field.key === "source" ? "input" : "textarea",
      );
      input.id = label.htmlFor;
      input.placeholder = field.placeholder;
      input.autocomplete = "off";
      input.setAttribute("aria-describedby", hint.id);
      if (input.tagName === "TEXTAREA") input.rows = 3;
      else input.type = "text";
      if (field.key === "source") {
        input.inputMode = "url";
        input.spellcheck = false;
      }
      const include = element("label", "", "check include");
      const checkbox = element("input");
      checkbox.type = "checkbox";
      checkbox.id = `include-${field.key}-${index}`;
      include.append(
        checkbox,
        document.createTextNode(` Include ${field.label.toLowerCase()}`),
      );
      block.append(label, hint, input, include);
      card.append(block);
    }
    const core = element("button", "Use core details", "secondary");
    core.type = "button";
    core.setAttribute(
      "aria-label",
      `Use title, situation, contribution and outcome from example ${index + 1}`,
    );
    core.addEventListener("click", () => {
      selected.checked = true;
      for (const key of ["title", "situation", "contribution", "outcome"])
        document.querySelector(`#include-${key}-${index}`).checked = true;
      update();
    });
    card.append(
      core,
      element(
        "p",
        "Selects the title, situation, contribution and outcome. Your source link and private note keep their current choices.",
        "hint",
      ),
    );
    const previewLink = element("a", "Preview summary");
    previewLink.href = "#preview-heading";
    card.append(previewLink);
    examples.append(card);
  }
  const read = () => ({
    purpose: document.querySelector("#purpose").value,
    includePurpose: document.querySelector("#include-purpose").checked,
    examples: [0, 1].map((index) => ({
      selected: document.querySelector(`#example-${index}`).checked,
      values: Object.fromEntries(
        FIELDS.map(({ key }) => [
          key,
          document.querySelector(`#${key}-${index}`).value,
        ]),
      ),
      include: Object.fromEntries(
        FIELDS.map(({ key }) => [
          key,
          document.querySelector(`#include-${key}-${index}`).checked,
        ]),
      ),
    })),
  });
  const copying = createCopyController({
    getText: () => preview.value,
    write: (text) => {
      if (!globalThis.navigator?.clipboard?.writeText)
        throw new Error("clipboard unavailable");
      return globalThis.navigator.clipboard.writeText(text);
    },
    onState: ({ busy, status: message }) => {
      copyButton.disabled = busy || !preview.value;
      copyButton.setAttribute("aria-busy", String(busy));
      status.textContent = message;
    },
  });
  function update(message = "") {
    preview.value = buildSummary(read());
    fieldCount.textContent = preview.value
      ? "This is the complete text that will be copied."
      : "Choose an example and at least one filled field to make a summary.";
    selectButton.disabled = !preview.value;
    copying.invalidate(message);
  }
  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("input", () => update());
  form.addEventListener("change", () => update());
  copyButton.addEventListener("click", () => void copying.copy());
  selectButton.addEventListener("click", () => {
    preview.focus();
    preview.select();
  });
  document.querySelector("#clear").addEventListener("click", () => {
    form.reset();
    update(
      "Worksheet cleared. Anything already copied outside this page is unchanged.",
    );
  });
  update();
  form.hidden = false;
}
if (typeof document !== "undefined") mountWorksheet(document);
