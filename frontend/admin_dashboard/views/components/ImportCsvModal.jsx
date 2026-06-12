"use client";

/**
 * ImportCsvModal — views/components/ImportCsvModal.jsx
 *
 * Two-step modal for bulk importing users from a CSV or Excel file.
 *   Step 1 — Upload: drag-and-drop or file picker
 *   Step 2 — Preview & Upload: parsed row table with real-time progress indicators
 *           and retry option for failed entries.
 *
 * Props:
 *   isOpen      {boolean}  — controls visibility
 *   onClose     {Function} — dismiss
 *   onImport    {Function} — (successUsers: Array) => void   called on close/finish with successfully created users
 */

import { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, AlertTriangle, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { parseSpreadsheetToUsers } from "@/controllers/userController";



export default function ImportCsvModal({ isOpen, onClose, onImport }) {
  const [step, setStep]               = useState("upload"); // "upload" | "preview"
  const [isDragging, setIsDragging]   = useState(false);
  const [fileName, setFileName]       = useState("");
  const [importRows, setImportRows]   = useState([]); // { ...row, status: "idle" | "uploading" | "success" | "failed" | "skipped", errorDetail }
  const [isImporting, setIsImporting] = useState(false);
  const [hasStartedImport, setHasStartedImport] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep("upload");
      setFileName("");
      setImportRows([]);
      setIsDragging(false);
      setIsImporting(false);
      setHasStartedImport(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── File handling ──────────────────────────────────────────────────────────

  async function processFile(file) {
    const isCsv = file.name.endsWith(".csv");
    const isXlsx = file.name.endsWith(".xlsx");
    if (!file || (!isCsv && !isXlsx)) {
      alert("Please upload a valid .csv or .xlsx spreadsheet file.");
      return;
    }
    setFileName(file.name);
    try {
      const result = await parseSpreadsheetToUsers(file);
      const rows = (result.rows || []).map((row) => ({
        ...row,
        status: row._errors.length > 0 ? "skipped" : "idle",
        errorDetail: null,
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
    e.target.value = ""; // reset so same file can be re-uploaded
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  // ── Import Upload loop ──────────────────────────────────────────────────────

  const updateRowStatus = (index, status, frontendUser = null, errorDetail = null) => {
    setImportRows((prev) => {
      const next = prev.map((r, i) => {
        if (i === index) {
          return { ...r, status, errorDetail, frontendUser };
        }
        return r;
      });
      return next;
    });
  };

  async function startImport(rowsToUpload) {
    setIsImporting(true);
    setHasStartedImport(true);

    const uploadPromises = rowsToUpload.map(async (row) => {
      const rowIndex = importRows.findIndex((r) => r._rowIndex === row._rowIndex);
      if (rowIndex === -1) return;

      updateRowStatus(rowIndex, "uploading");

      const newUser = {
        universityId: row.universityId,
        name: row.name,
        email: row.email,
        role: row.role.toLowerCase(),
        department: row.department,
        faculty: row.faculty,
        academicYear: row.role === "Student" ? row.academicYear : null,
      };

      try {
        const response = await fetch("http://localhost:8000/api/users/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        if (response.ok) {
          const created = await response.json();
          const frontendUser = {
            id: created.universityId,
            universityId: created.universityId,
            name: created.name,
            email: created.email,
            role: created.role.charAt(0).toUpperCase() + created.role.slice(1),
            department: created.department,
            faculty: created.faculty,
            academicYear: created.academicYear || "",
          };
          updateRowStatus(rowIndex, "success", frontendUser);
        } else {
          const errData = await response.json().catch(() => ({}));
          updateRowStatus(rowIndex, "failed", null, errData.detail || response.statusText);
        }
      } catch (err) {
        updateRowStatus(rowIndex, "failed", null, err.message || "Network error");
      }
    });

    await Promise.all(uploadPromises);
    setIsImporting(false);
  }

  function handleRetry() {
    const failedRows = importRows.filter((r) => r.status === "failed");
    if (failedRows.length > 0) {
      startImport(failedRows);
    }
  }

  function handleClose() {
    const successfulUsers = importRows
      .filter((r) => r.status === "success" && r.frontendUser)
      .map((r) => r.frontendUser);
    onImport(successfulUsers);
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const totalRows        = importRows.length;
  const skippedCount     = importRows.filter((r) => r.status === "skipped").length;
  const importableRows   = importRows.filter((r) => r.status !== "skipped");
  const totalToImport    = importableRows.length;
  
  const successCount     = importRows.filter((r) => r.status === "success").length;
  const failedCount      = importRows.filter((r) => r.status === "failed").length;
  const completedCount   = successCount + failedCount;
  
  const progressPercent  = totalToImport > 0 ? (completedCount / totalToImport) * 100 : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
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
          {/* Header */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              {step === "preview" && !hasStartedImport && (
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
              className={`text-white/70 hover:text-white transition-colors ${isImporting ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* ── STEP 1: UPLOAD ────────────────────────────────────────────── */}
          {step === "upload" && (
            <div className="p-6 flex flex-col gap-5">
              {/* Drag & Drop Zone */}
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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#1e3b8a]" : "bg-[#f1f5f9]"}`}>
                  <Upload size={24} className={isDragging ? "text-white" : "text-[#64748b]"} />
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
                  <strong>role</strong> must be Lecturer or Student. <strong>academicYear</strong> is required for Student.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW & IMPORT ───────────────────────────────────── */}
          {step === "preview" && importRows.length > 0 && (
            <div className="flex flex-col">
              {/* Summary & Progress Bar */}
              <div className="px-6 pt-5 pb-2 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wide">Import Progress</span>
                    {hasStartedImport && (
                      <span className="text-xs font-bold text-[#1e3b8a]">
                        {completedCount} / {totalToImport} ({Math.round(progressPercent)}%)
                      </span>
                    )}
                  </div>
                  <span className="text-[#94a3b8] text-xs font-semibold">{fileName}</span>
                </div>

                {/* Progress bar */}
                {hasStartedImport && (
                  <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full transition-all duration-300 rounded-full bg-[#1e3b8a]`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Status metrics */}
                <div className="flex gap-4 flex-wrap mt-1 text-xs font-semibold">
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
              </div>

              {/* Preview table */}
              <div className="mx-6 my-4 overflow-auto max-h-64 border border-[#e2e8f0] rounded-xl shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#f8fafc] z-10">
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)] whitespace-nowrap">Univ. ID</th>
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)]">Name</th>
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)]">Role</th>
                      <th className="px-3 py-2.5 font-bold text-[rgba(0,0,0,0.6)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map((row, i) => {
                      let rowColorCls = "border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors";
                      if (row.status === "uploading") {
                        rowColorCls = "border-b border-blue-100 bg-blue-50/40 text-blue-700 font-medium animate-pulse";
                      } else if (row.status === "success") {
                        rowColorCls = "border-b border-emerald-100 bg-emerald-50/60 text-emerald-800 font-medium";
                      } else if (row.status === "failed") {
                        rowColorCls = "border-b border-red-100 bg-red-50/60 text-red-800 font-medium";
                      } else if (row.status === "skipped") {
                        rowColorCls = "border-b border-red-50/30 opacity-70 bg-red-50/10 text-red-600/90 italic";
                      }

                      return (
                        <tr key={i} className={rowColorCls}>
                          <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                            {row.universityId || <span className="text-red-400 italic">missing</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.name || <span className="text-red-400 italic">missing</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.role || <span className="text-red-400 italic">invalid</span>}
                          </td>
                          <td className="px-3 py-2.5 font-semibold">
                            {row.status === "skipped" && (
                              <span className="text-red-500 flex items-center gap-1 text-[10px]">
                                <AlertTriangle size={12} /> invalid (skip)
                              </span>
                            )}
                            {row.status === "idle" && (
                              <span className="text-[#94a3b8] flex items-center gap-1 text-[10px]">
                                Ready
                              </span>
                            )}
                            {row.status === "uploading" && (
                              <span className="text-blue-500 flex items-center gap-1 text-[10px] font-bold">
                                <Loader2 size={12} className="animate-spin" /> uploading
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

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#f1f5f9] bg-[#f8fafc] mt-2">
            {!hasStartedImport ? (
              /* BEFORE IMPORT */
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
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5
                      transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]
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
            ) : isImporting ? (
              /* DURING IMPORT */
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
                  Importing ({completedCount}/{totalToImport})
                </button>
              </>
            ) : (
              /* AFTER IMPORT */
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
                    <Loader2 size={14} className={isImporting ? "animate-spin" : ""} />
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
