"use client";

/**
 * ImportCsvModal — views/components/ImportCsvModal.jsx
 *
 * Two-step modal for bulk importing users from a CSV or Excel file.
 *   Step 1 — Upload : drag-and-drop or file picker
 *   Step 2 — Preview: parsed row table; single bulk POST on confirm
 *
 * After the bulk request completes the table rows are coloured:
 *   green  → successfully created
 *   red    → failed (hover the status cell for the reason)
 *   muted  → skipped due to local validation errors before upload
 *
 * Props:
 *   isOpen   {boolean}  — controls visibility
 *   onClose  {Function} — dismiss (no-op when importing)
 *   onImport {Function} — (successUsers: Array) => void  called on Done
 */

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { parseSpreadsheetToUsers } from "@/controllers/userController";

const BULK_URL = "http://localhost:8000/api/users/bulk";

// ── helpers ───────────────────────────────────────────────────────────────────

function toFrontendUser(u) {
  return {
    id: u.universityId,
    universityId: u.universityId,
    name: u.name,
    email: u.email,
    role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "",
    department: u.department,
    faculty: u.faculty,
    academicYear: u.academicYear || "",
  };
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ImportCsvModal({ isOpen, onClose, onImport }) {
  const [step, setStep] = useState("upload"); // "upload" | "preview"
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  /**
   * importRows shape:
   *   { ...parsedRow, status: "idle"|"success"|"failed"|"skipped",
   *     errorDetail: string|null, frontendUser: object|null }
   */
  const [importRows, setImportRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [hasImported, setHasImported] = useState(false);

  const fileInputRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("upload");
      setFileName("");
      setImportRows([]);
      setIsDragging(false);
      setIsImporting(false);
      setHasImported(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── file handling ─────────────────────────────────────────────────────────

  async function processFile(file) {
    if (!file || (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx"))) {
      alert("Please upload a valid .csv or .xlsx spreadsheet file.");
      return;
    }
    setFileName(file.name);
    try {
      const result = await parseSpreadsheetToUsers(file);
      const rows = (result.rows || []).map((row) => ({
        ...row,
        status: row._errors.length > 0 ? "skipped" : "idle",
        errorDetail: row._errors.length > 0 ? row._errors.join(", ") : null,
        frontendUser: null,
      }));
      setImportRows(rows);
      setStep("preview");
    } catch (err) {
      alert(err.message || "Failed to parse spreadsheet file.");
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  // ── bulk import ───────────────────────────────────────────────────────────

  /**
   * rowsToUpload — the subset of importRows to send (all idle, or only failed on retry).
   * Each row carries a _rowIndex so we can match it back to importRows.
   */
  async function startImport(rowsToUpload) {
    if (rowsToUpload.length === 0) return;
    setIsImporting(true);
    setHasImported(true);

    // Build the payload list — order matters (index in response maps back here)
    const payload = rowsToUpload.map((row) => ({
      universityId: row.universityId,
      name: row.name,
      email: row.email,
      role: row.role.toLowerCase(),
      department: row.department,
      faculty: row.faculty,
      academicYear: row.role === "Student" ? (row.academicYear || null) : null,
    }));

    try {
      const response = await fetch(BULK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: payload }),
      });

      const data = response.ok
        ? await response.json()
        : await response.json().catch(() => null);

      if (!response.ok || !data) {
        // Whole request failed — mark every row as failed
        const reason = data?.detail || "Server error";
        setImportRows((prev) =>
          prev.map((r) => {
            const wasQueued = rowsToUpload.some(
              (q) => q._rowIndex === r._rowIndex,
            );
            return wasQueued ? { ...r, status: "failed", errorDetail: reason } : r;
          }),
        );
        return;
      }

      // Build quick lookup: universityId → { status, reason, frontendUser }
      const successMap = new Map(
        (data.success || []).map((u) => [u.universityId, toFrontendUser(u)]),
      );
      const failedMap = new Map(
        (data.failed || []).map((f) => [f.index, f.reason]),
      );

      setImportRows((prev) => {
        const next = [...prev];
        rowsToUpload.forEach((row, relIdx) => {
          const absIdx = prev.findIndex((r) => r._rowIndex === row._rowIndex);
          if (absIdx === -1) return;

          if (successMap.has(row.universityId)) {
            next[absIdx] = {
              ...next[absIdx],
              status: "success",
              errorDetail: null,
              frontendUser: successMap.get(row.universityId),
            };
          } else {
            const reason = failedMap.get(relIdx) || "Upload failed";
            next[absIdx] = {
              ...next[absIdx],
              status: "failed",
              errorDetail: reason,
              frontendUser: null,
            };
          }
        });
        return next;
      });
    } catch (err) {
      // Network-level failure
      const reason = err.message || "Network error";
      setImportRows((prev) =>
        prev.map((r) => {
          const wasQueued = rowsToUpload.some(
            (q) => q._rowIndex === r._rowIndex,
          );
          return wasQueued ? { ...r, status: "failed", errorDetail: reason } : r;
        }),
      );
    } finally {
      setIsImporting(false);
    }
  }

  function handleRetry() {
    const failedRows = importRows.filter((r) => r.status === "failed");
    if (failedRows.length > 0) startImport(failedRows);
  }

  function handleClose() {
    const successfulUsers = importRows
      .filter((r) => r.status === "success" && r.frontendUser)
      .map((r) => r.frontendUser);
    onImport(successfulUsers);
  }

  // ── computed ──────────────────────────────────────────────────────────────

  const skippedCount = importRows.filter((r) => r.status === "skipped").length;
  const importableRows = importRows.filter((r) => r.status !== "skipped");
  const totalToImport = importableRows.length;
  const successCount = importRows.filter((r) => r.status === "success").length;
  const failedCount = importRows.filter((r) => r.status === "failed").length;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={isImporting ? undefined : handleClose}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 pointer-events-auto flex flex-col overflow-hidden transition-all transform duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              {step === "preview" && !hasImported && (
                <button
                  onClick={() => setStep("upload")}
                  className="text-white/70 hover:text-white transition-colors mr-1"
                  title="Back to upload"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <Upload size={18} strokeWidth={2.5} />
              {step === "upload" ? "Import Users from Spreadsheet" : "Preview Import"}
            </h2>
            <button
              id="btn-import-csv-close"
              onClick={isImporting ? undefined : handleClose}
              disabled={isImporting}
              className={`text-white/70 hover:text-white transition-colors ${
                isImporting ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* ── STEP 1: UPLOAD ───────────────────────────────────────────── */}
          {step === "upload" && (
            <div className="p-6 flex flex-col gap-5">
              {/* Drag & Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all
                  ${isDragging
                    ? "border-[#1e3b8a] bg-[#1e3b8a]/5"
                    : "border-[#e2e8f0] hover:border-[#1e3b8a]/50 hover:bg-[#f8fafc]"
                  }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragging ? "bg-[#1e3b8a]" : "bg-[#f1f5f9]"
                  }`}
                >
                  <Upload
                    size={24}
                    className={isDragging ? "text-white" : "text-[#64748b]"}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[#334155] font-semibold text-sm">
                    Drag &amp; drop your CSV or Excel file here
                  </p>
                  <p className="text-[#94a3b8] text-xs mt-1">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx"
                  className="hidden"
                  onChange={handleFileInput}
                  id="csv-file-input"
                />
              </div>

              {/* Format hint */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-col gap-2">
                <p className="text-[#334155] font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={13} />
                  Expected Spreadsheet Format
                </p>
                <code className="text-xs text-[#64748b] leading-5 break-all">
                  universityId,name,email,role,department,faculty,academicYear<br />
                  SE/2021/002,Sithumi Fernando,sithumi@uni.ac.lk,Student,Software Engineering,Computing,2nd Year<br />
                  LEC/001,Dr. Ravi,ravi@uni.ac.lk,Lecturer,Software Engineering,Computing,<br />
                </code>
                <p className="text-[#94a3b8] text-xs">
                  <strong>role</strong> must be Lecturer or Student.{" "}
                  <strong>academicYear</strong> is required for Students.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW & IMPORT ─────────────────────────────────── */}
          {step === "preview" && importRows.length > 0 && (
            <div className="flex flex-col">
              {/* Summary bar */}
              <div className="px-6 pt-5 pb-2 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wide">
                      {hasImported ? "Import Results" : "Ready to Import"}
                    </span>

                    {/* Loading spinner while request is in flight */}
                    {isImporting && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3b8a]">
                        <Loader2 size={13} className="animate-spin" />
                        Uploading {totalToImport} user{totalToImport !== 1 ? "s" : ""}…
                      </span>
                    )}
                  </div>
                  <span className="text-[#94a3b8] text-xs font-semibold">{fileName}</span>
                </div>

                {/* Result metrics — shown after import finishes */}
                {hasImported && !isImporting && (
                  <div className="flex gap-4 flex-wrap text-xs font-semibold">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {successCount} successful
                    </span>
                    {failedCount > 0 && (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertTriangle size={13} /> {failedCount} failed
                      </span>
                    )}
                    {skippedCount > 0 && (
                      <span className="text-red-400/80 flex items-center gap-1">
                        <AlertTriangle size={13} /> {skippedCount} skipped (invalid)
                      </span>
                    )}
                  </div>
                )}

                {/* Pre-import row count */}
                {!hasImported && (
                  <div className="flex gap-4 flex-wrap text-xs font-semibold">
                    <span className="text-[#1e3b8a] flex items-center gap-1">
                      <Upload size={13} /> {totalToImport} to import
                    </span>
                    {skippedCount > 0 && (
                      <span className="text-red-400/80 flex items-center gap-1">
                        <AlertTriangle size={13} /> {skippedCount} will be skipped (invalid)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Preview table */}
              <div className="mx-6 my-4 overflow-auto max-h-64 border border-[#e2e8f0] rounded-xl shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#f8fafc] z-10">
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)] whitespace-nowrap">
                        Univ. ID
                      </th>
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)]">
                        Name
                      </th>
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)]">
                        Role
                      </th>
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map((row, i) => {
                      let rowCls =
                        "border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors";
                      if (row.status === "success")
                        rowCls =
                          "border-b border-emerald-100 bg-emerald-50/60 text-emerald-800 font-medium";
                      else if (row.status === "failed")
                        rowCls =
                          "border-b border-red-100 bg-red-50/60 text-red-800 font-medium";
                      else if (row.status === "skipped")
                        rowCls =
                          "border-b border-red-50/30 opacity-70 bg-red-50/10 text-red-600/90 italic";

                      return (
                        <tr key={i} className={rowCls}>
                          <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                            {row.universityId || (
                              <span className="text-red-400 italic">missing</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.name || (
                              <span className="text-red-400 italic">missing</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.role || (
                              <span className="text-red-400 italic">invalid</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 font-semibold">
                            {row.status === "skipped" && (
                              <span
                                className="text-red-500 flex items-center gap-1 text-[10px] cursor-help"
                                title={row.errorDetail || "Validation errors"}
                              >
                                <AlertTriangle size={12} /> invalid (skip)
                              </span>
                            )}
                            {row.status === "idle" && (
                              <span className="text-[#94a3b8] text-[10px]">
                                Ready
                              </span>
                            )}
                            {row.status === "success" && (
                              <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-bold">
                                <CheckCircle2 size={12} /> ok
                              </span>
                            )}
                            {row.status === "failed" && (
                              <span
                                className="text-red-500 flex items-center gap-1 text-[10px] font-bold cursor-help"
                                title={row.errorDetail || "Upload failed"}
                              >
                                <AlertTriangle size={12} /> failed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#f1f5f9] bg-[#f8fafc] mt-2">
            {/* BEFORE import */}
            {!hasImported && (
              <>
                <button
                  id="btn-import-csv-cancel"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors bg-white shadow-sm"
                >
                  Cancel
                </button>
                {step === "preview" && (
                  <button
                    id="btn-import-csv-confirm"
                    onClick={() => totalToImport > 0 && startImport(importableRows)}
                    disabled={totalToImport === 0}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]
                      ${totalToImport > 0
                        ? "bg-[#1e3b8a] text-white hover:bg-[#162d6b] active:scale-[0.98]"
                        : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                      }`}
                  >
                    <Upload size={15} strokeWidth={2.5} />
                    Import {totalToImport} User{totalToImport !== 1 ? "s" : ""}
                  </button>
                )}
              </>
            )}

            {/* DURING import */}
            {hasImported && isImporting && (
              <>
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#94a3b8] font-semibold text-sm bg-white cursor-not-allowed opacity-50 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl bg-[#cbd5e1] text-[#94a3b8] font-semibold text-sm flex items-center gap-1.5 cursor-not-allowed"
                >
                  <Loader2 size={15} className="animate-spin" />
                  Uploading…
                </button>
              </>
            )}

            {/* AFTER import */}
            {hasImported && !isImporting && (
              <>
                <button
                  id="btn-import-csv-done"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm hover:bg-[#162d6b] transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)] active:scale-[0.98]"
                >
                  Done
                </button>
                {failedCount > 0 && (
                  <button
                    id="btn-import-csv-retry"
                    onClick={handleRetry}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all shadow-[0_4px_12px_rgba(245,158,11,0.25)] active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <AlertTriangle size={14} />
                    Retry {failedCount} Failed
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
