// app.js - unchanged behavior (create/open/save/delete/search)
const KEY = "simple_notes_v1",
  notesListEl = document.getElementById("notesList"),
  newBtn = document.getElementById("newBtn"),
  searchInput = document.getElementById("searchInput"),
  emptyEl = document.getElementById("empty"),
  notePane = document.getElementById("notePane"),
  titleEl = document.getElementById("title"),
  contentEl = document.getElementById("content"),
  saveBtn = document.getElementById("saveBtn"),
  deleteBtn = document.getElementById("deleteBtn"),
  metaEl = document.getElementById("meta");
let notes = [],
  active = null;
const uid = (_) =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nowISO = (_) => new Date().toISOString();
const esc = (s) =>
  s
    ? String(s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      )
    : "";
function load() {
  try {
    notes = JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (e) {
    notes = [];
  }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(notes));
}
function renderList() {
  const q = (searchInput.value || "").toLowerCase();
  notesListEl.innerHTML = "";
  if (!notes.length) {
    notesListEl.innerHTML =
      '<div style="color:var(--muted);padding:8px">No notes</div>';
    return;
  }
  notes.forEach((n) => {
    if (q && !(n.title + n.content).toLowerCase().includes(q)) return;
    const it = document.createElement("div");
    it.className = "note-item";
    if (n.id === active) it.style.outline = "2px solid rgba(96,165,250,0.12)";
    it.innerHTML = `<div class="note-title">${esc(
      n.title
    )}</div><div class="note-preview">${esc(
      (n.content || "").split("\n")[0]
    )}</div><div class="note-meta">${new Date(
      n.updatedAt
    ).toLocaleString()}</div>`;
    it.onclick = () => openNote(n.id);
    notesListEl.appendChild(it);
  });
}
function openNote(id) {
  active = id;
  const n = notes.find((x) => x.id === id);
  if (!n) return;
  titleEl.value = n.title;
  contentEl.value = n.content;
  metaEl.textContent = "Last saved: " + new Date(n.updatedAt).toLocaleString();
  notePane.classList.remove("hidden");
  emptyEl.classList.add("hidden");
  renderList();
}
function createNote() {
  const n = { id: uid(), title: "Untitled", content: "", updatedAt: nowISO() };
  notes.unshift(n);
  save();
  openNote(n.id);
  renderList();
}
function saveCurrent() {
  if (!active) return;
  const n = notes.find((x) => x.id === active);
  if (!n) return;
  n.title = titleEl.value || "Untitled";
  n.content = contentEl.value || "";
  n.updatedAt = nowISO();
  notes = [n, ...notes.filter((x) => x.id !== n.id)];
  save();
  renderList();
  metaEl.textContent = "Last saved: " + new Date(n.updatedAt).toLocaleString();
}
function deleteCurrent() {
  if (!active) return;
  if (!confirm("Delete this note?")) return;
  notes = notes.filter((x) => x.id !== active);
  save();
  active = null;
  notePane.classList.add("hidden");
  emptyEl.classList.remove("hidden");
  renderList();
}
newBtn.addEventListener("click", createNote);
saveBtn.addEventListener("click", () => {
  saveCurrent();
  alert("Saved");
});
deleteBtn.addEventListener("click", deleteCurrent);
searchInput.addEventListener("input", renderList);
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    createNote();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveCurrent();
    alert("Saved");
  }
});
load();
if (notes.length > 0) openNote(notes[0].id);
renderList();
