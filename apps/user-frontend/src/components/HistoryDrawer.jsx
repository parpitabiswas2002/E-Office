import React from "react";
import { X, Calendar, FileText, Trash2, ArrowRight } from "lucide-react";

export default function HistoryDrawer({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-indigo-50/80 bg-gradient-to-r from-indigo-50/20 to-violet-50/20 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-indigo-900 tracking-wide uppercase">
                Draft Archive History
              </h2>
              <p className="text-xs text-indigo-500 font-medium">
                {drafts.length} item{drafts.length !== 1 ? "s" : ""} saved locally
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 transition-colors"
            >
              <X className="h-4 w-4 text-indigo-600" />
            </button>
          </div>

          {/* Drawer List Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {drafts.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-12">
                <div className="p-4 bg-indigo-50 rounded-full mb-3">
                  <FileText className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-indigo-950">No saved drafts yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Draft an official letter and click "Save to History" to archive it here.
                </p>
              </div>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-white hover:bg-indigo-50/5 hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Draft Header details */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {draft.documentType || draft.mode}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      <Calendar className="h-3 w-3" />
                      {new Date(draft.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Subject Context summary */}
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-3">
                    {draft.subject || "[No Subject Provided]"}
                  </h4>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="p-1.5 rounded-lg border border-red-100 hover:border-red-300 hover:bg-red-50 text-red-500 transition-colors"
                      title="Delete draft from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => onLoadDraft(draft)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg group-hover:translate-x-0.5 transition-all"
                    >
                      Load into Canvas
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
