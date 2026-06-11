"use client";

/**
 * ImportCsvModal — views/components/ImportCsvModal.jsx
 *
 * Two-step modal for bulk importing users from a CSV file.
 *   Step 1 — Upload: drag-and-drop or file picker
 *   Step 2 — Preview: parsed row table with error highlighting, confirm to import
 *
 * Props:
 *   isOpen      {boolean}  — controls visibility
 *   onClose     {Function} — dismiss
 *   onImport    {Function} — (parsedRows: Array) => void   called on confirm
 */

import { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import { parseCsvToUsers } from "@/controllers/userController";

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function ImportCsvModal({ isOpen, onClose, onImport }) {
  const [step, setStep]           = useState("upload"); // "upload" | "preview"
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName]   = useState("");
  const [parseResult, setParseResult] = useState(null); // { rows, errors }
  const fileInputRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("upload");
      setFileName("");
      setParseResult(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── File handling ──────────────────────────────────────────────────────────

  function processFile(file) {
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please upload a valid .csv file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCsvToUsers(e.target.result);
      setParseResult(result);
      setStep("preview");
    };
    reader.readAsText(file);
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-uploaded
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const validCount   = parseResult ? parseResult.rows.filter((r) => r._errors.length === 0).length : 0;
  const invalidCount = parseResult ? parseResult.rows.filter((r) => r._errors.length > 0).length : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 pointer-events-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              {step === "preview" && (
                <button
                  onClick={() => setStep("upload")}
                  className="text-white/70 hover:text-white transition-colors mr-1"
                  title="Back to upload"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <Upload size={18} strokeWidth={2.5} />
              {step === "upload" ? "Import Users from CSV" : "Preview Import"}
            </h2>
            <button
              id="btn-import-csv-close"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
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
                    Drag &amp; drop your CSV file here
                  </p>
                  <p className="text-[#94a3b8] text-xs mt-1">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                  id="csv-file-input"
                />
              </div>

              {/* Format hint */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-col gap-2">
                <p className="text-[#334155] font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={13} />
                  Expected CSV Format
                </p>
                <code className="text-xs text-[#64748b] leading-5 break-all">
                  universityId,name,email,role,department,faculty,academicYear,isActive<br />
                  SE/2021/002,Sithumi Fernando,sithumi@uni.ac.lk,Student,Software Engineering,Computing,2nd Year,true<br />
                  LEC/001,Dr. Ravi,ravi@uni.ac.lk,Lecturer,Software Engineering,Computing,,true
                </code>
                <p className="text-[#94a3b8] text-xs">
                  <strong>role</strong> must be Lecturer or Student. <strong>academicYear</strong> is required for Student. <strong>isActive</strong> is optional (defaults to true).
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: PREVIEW ───────────────────────────────────────────── */}
          {step === "preview" && parseResult && (
            <div className="flex flex-col">
              {/* Summary bar */}
              <div className="px-6 pt-5 pb-3 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 size={15} />
                  {validCount} valid
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                    <AlertTriangle size={15} />
                    {invalidCount} with errors (will be skipped)
                  </div>
                )}
                <span className="text-[#94a3b8] text-xs ml-auto">{fileName}</span>
              </div>

              {/* Global parse errors */}
              {parseResult.errors.length > 0 && parseResult.rows.length === 0 && (
                <div className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
                  {parseResult.errors.map((err, i) => (
                    <p key={i} className="text-red-600 text-xs">{err}</p>
                  ))}
                </div>
              )}

              {/* Preview table */}
              {parseResult.rows.length > 0 && (
                <div className="mx-6 mb-4 overflow-auto max-h-64 border border-[#e2e8f0] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                        <th className="px-3 py-2 font-semibold text-[rgba(0,0,0,0.5)] whitespace-nowrap">Univ. ID</th>
                        <th className="px-3 py-2 font-semibold text-[rgba(0,0,0,0.5)]">Name</th>
                        <th className="px-3 py-2 font-semibold text-[rgba(0,0,0,0.5)]">Role</th>
                        <th className="px-3 py-2 font-semibold text-[rgba(0,0,0,0.5)]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.rows.map((row, i) => {
                        const hasError = row._errors.length > 0;
                        return (
                          <tr
                            key={i}
                            className={`border-b border-[#e2e8f0] last:border-0 ${hasError ? "bg-red-50" : ""}`}
                          >
                            <td className={`px-3 py-2 font-medium whitespace-nowrap ${hasError ? "text-red-600" : "text-[#0f172a]"}`}>
                              {row.universityId || <span className="text-red-400 italic">missing</span>}
                            </td>
                            <td className={`px-3 py-2 ${hasError ? "text-red-600" : "text-[#334155]"}`}>
                              {row.name || <span className="text-red-400 italic">missing</span>}
                            </td>
                            <td className="px-3 py-2 text-[#64748b]">
                              {row.role || <span className="text-red-400 italic">invalid</span>}
                            </td>
                            <td className="px-3 py-2">
                              {hasError ? (
                                <span className="text-red-500 flex items-center gap-1">
                                  <AlertTriangle size={12} /> skip
                                </span>
                              ) : (
                                <span className="text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 size={12} /> ok
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
            <button
              id="btn-import-csv-cancel"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            {step === "preview" && (
              <button
                id="btn-import-csv-confirm"
                onClick={() => validCount > 0 && onImport(parseResult.rows)}
                disabled={validCount === 0}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5
                  transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]
                  ${validCount > 0
                    ? "bg-[#1e3b8a] text-white hover:bg-[#162d6b] active:scale-[0.98]"
                    : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                  }`}
              >
                <Upload size={15} strokeWidth={2.5} />
                Import {validCount} User{validCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
