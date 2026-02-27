const $ = (id) => document.getElementById(id);

const statusEl = $("status");
const editor = $("editor");
const iframe = $("preview");

function setStatus(msg, ok = true) {
  statusEl.innerHTML = `<div class="${ok ? "text-emerald-700" : "text-red-700"}">${msg}</div>`;
}

async function loadEnv(envName) {
  const r = await fetch(`/api/specials?env=${envName}`, { cache: "no-store" });
  const t = await r.text();
  if (!r.ok) throw new Error(t);
  editor.value = formatJson(t);
  setStatus(`Loaded ${envName.toUpperCase()} successfully.`);
}

function formatJson(text) {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, 2);
  } catch {
    return text;
  }
}

async function saveDraft() {
  let obj;
  try {
    obj = JSON.parse(editor.value);
  } catch (e) {
    setStatus(`Draft JSON parse error: ${e.message}`, false);
    return;
  }

  const r = await fetch(`/api/specials?env=draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    setStatus(`Save failed: ${data.error || "unknown"}<br>${(data.errors || []).join("<br>")}`, false);
    return;
  }

  setStatus("Draft saved.");
  iframe.src = iframe.src.split("#")[0] + `#t=${Date.now()}`;
}

async function publish() {
  const r = await fetch(`/api/publish`, { method: "POST" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    setStatus(`Publish failed: ${data.error || "unknown"}`, false);
    return;
  }
  setStatus(`Published successfully. Archived: ${data.archivedVersion || "none"}`);
}

function validateLocal() {
  try {
    const obj = JSON.parse(editor.value);
    const errors = [];

    if (!obj.meta) errors.push("meta is required");
    if (!Array.isArray(obj.navCards)) errors.push("navCards must be an array");
    if (!Array.isArray(obj.sections)) errors.push("sections must be an array");
    if (!obj.footer) errors.push("footer is required");

    const allowed = new Set(["finance", "leaseGrid", "purchaseGrid", "serviceCoupons", "ctaSplit"]);
    (obj.sections || []).forEach((s, i) => {
      if (!s.id) errors.push(`sections[${i}].id is required`);
      if (!s.type) errors.push(`sections[${i}].type is required`);
      if (s.type && !allowed.has(s.type)) errors.push(`sections[${i}].type "${s.type}" not supported`);
    });

    if (errors.length) {
      setStatus(`Validation failed:<br>${errors.join("<br>")}`, false);
    } else {
      setStatus("Validation passed.");
    }
  } catch (e) {
    setStatus(`Validation error: ${e.message}`, false);
  }
}

$("btnLoadProd").onclick = () => loadEnv("prod").catch((e) => setStatus(e.message, false));
$("btnLoadDraft").onclick = () => loadEnv("draft").catch((e) => setStatus(e.message, false));
$("btnSaveDraft").onclick = () => saveDraft().catch((e) => setStatus(e.message, false));
$("btnPublish").onclick = () => publish().catch((e) => setStatus(e.message, false));
$("btnValidate").onclick = () => validateLocal();
$("btnOpenPreview").onclick = () => window.open(`/specials-preview.html?env=draft`, "_blank");

loadEnv("draft").catch(() => loadEnv("prod").catch(() => setStatus("No data found yet.", false)));
