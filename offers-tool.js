(function () {
  const editor = document.getElementById("jsonEditor");
  const messages = document.getElementById("messages");
  const statusBadge = document.getElementById("statusBadge");
  const summary = document.getElementById("summary");
  const fileInput = document.getElementById("fileInput");

  const btnLoadCurrent = document.getElementById("btnLoadCurrent");
  const btnValidate = document.getElementById("btnValidate");
  const btnPretty = document.getElementById("btnPretty");
  const btnDownload = document.getElementById("btnDownload");

  function setStatus(text, kind) {
    statusBadge.textContent = text;
    statusBadge.className = "text-xs font-bold px-3 py-1 rounded-full";
    if (kind === "ok") statusBadge.classList.add("bg-emerald-100", "text-emerald-700");
    else if (kind === "warn") statusBadge.classList.add("bg-amber-100", "text-amber-700");
    else if (kind === "err") statusBadge.classList.add("bg-rose-100", "text-rose-700");
    else statusBadge.classList.add("bg-slate-200", "text-slate-700");
  }

  function msg(text, kind = "info") {
    const el = document.createElement("div");
    el.className = "text-xs rounded-lg px-3 py-2 border";
    if (kind === "ok") el.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-700");
    else if (kind === "err") el.classList.add("bg-rose-50", "border-rose-200", "text-rose-700");
    else el.classList.add("bg-slate-50", "border-slate-200", "text-slate-700");
    el.textContent = text;
    messages.prepend(el);
  }

  function parseEditor() {
    return JSON.parse(editor.value);
  }

  function refreshSummary(data) {
    const nav = Array.isArray(data.navCards) ? data.navCards.length : 0;
    const sections = Array.isArray(data.sections) ? data.sections.length : 0;
    const coupons = (data.sections || []).find((s) => s.type === "serviceCoupons")?.coupons?.length || 0;

    summary.classList.remove("hidden");
    summary.innerHTML = `
      <div class="font-bold text-[#002c5f]">Quick Summary</div>
      <div class="mt-1">Nav cards: <strong>${nav}</strong> · Sections: <strong>${sections}</strong> · Service coupons: <strong>${coupons}</strong></div>
    `;
  }

  async function loadCurrent() {
    try {
      const res = await fetch("data/specials.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      editor.value = JSON.stringify(data, null, 2);
      refreshSummary(data);
      setStatus("Loaded", "ok");
      msg("Loaded current data/specials.json", "ok");
    } catch (e) {
      setStatus("Load failed", "err");
      msg(`Failed to load data/specials.json: ${e.message}`, "err");
    }
  }

  function validate() {
    try {
      const data = parseEditor();
      refreshSummary(data);
      setStatus("Valid JSON", "ok");
      msg("JSON is valid.", "ok");
    } catch (e) {
      setStatus("Invalid JSON", "err");
      msg(`Validation error: ${e.message}`, "err");
    }
  }

  function pretty() {
    try {
      const data = parseEditor();
      editor.value = JSON.stringify(data, null, 2);
      setStatus("Formatted", "ok");
      msg("JSON formatted successfully.", "ok");
    } catch (e) {
      setStatus("Format failed", "err");
      msg(`Cannot format invalid JSON: ${e.message}`, "err");
    }
  }

  function download() {
    try {
      const data = parseEditor();
      const prettyJson = JSON.stringify(data, null, 2) + "\n";
      const blob = new Blob([prettyJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "specials.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Downloaded", "ok");
      msg("Downloaded specials.json", "ok");
    } catch (e) {
      setStatus("Download failed", "err");
      msg(`Cannot download invalid JSON: ${e.message}`, "err");
    }
  }

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      editor.value = JSON.stringify(data, null, 2);
      refreshSummary(data);
      setStatus("Imported", "ok");
      msg(`Imported ${file.name}`, "ok");
    } catch (e) {
      setStatus("Import failed", "err");
      msg(`Invalid JSON file: ${e.message}`, "err");
    }
  });

  btnLoadCurrent.addEventListener("click", loadCurrent);
  btnValidate.addEventListener("click", validate);
  btnPretty.addEventListener("click", pretty);
  btnDownload.addEventListener("click", download);

  loadCurrent();
})();
