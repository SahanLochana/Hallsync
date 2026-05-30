"use client";

/**
 * ConfirmModal — views/components/ConfirmModal.jsx
 * Reusable confirmation dialog (used for save edits & delete).
 *
 * Props:
 *   isOpen      {boolean}  — show/hide
 *   title       {string}   — modal heading
 *   message     {string}   — body text
 *   confirmLabel{string}   — confirm button label (default "Confirm")
 *   confirmStyle{string}   — "danger" | "primary" (default "primary")
 *   onConfirm   {Function} — called when user clicks confirm
 *   onCancel    {Function} — called when user cancels
 */

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  confirmStyle = "primary",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const confirmClass =
    confirmStyle === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-[#1e3b8a] hover:bg-[#162d6b] text-white";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className="text-[#0f172a] font-bold text-lg">{title}</h3>

        {/* Message */}
        <p className="text-[#64748b] text-sm leading-6">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            id="btn-confirm-cancel"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-ok"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
