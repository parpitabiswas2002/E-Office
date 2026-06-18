import React, { useState, useLayoutEffect, useRef } from "react";
import { Copy, Printer, Save, History, CheckCircle, Eye, Edit3, FileText, Download, Sliders } from "lucide-react";

// A custom textarea component that automatically adjusts its height to fit its content.
// This prevents truncation in the letter preview and ensures all content is visible in the exported PDF.
const AutoResizeTextarea = React.forwardRef(({ value, onChange, className, style, rows = 1, ...props }, ref) => {
  const localRef = useRef(null);
  const combinedRef = ref || localRef;

  useLayoutEffect(() => {
    const textarea = combinedRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={combinedRef}
      value={value}
      onChange={onChange}
      className={className}
      rows={rows}
      style={{
        ...style,
        resize: "none",
        overflow: "hidden",
      }}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export default function RightOutputPane({
  // Margins setup
  margins,
  handleMarginChange,
  handleMarginPreset,

  // Logo
  headerLogo,

  // The 12 Core Structured Letter Fields
  letterhead,
  setLetterhead,
  memoNumber,
  setMemoNumber,
  placeAndDate,
  setPlaceAndDate,
  fromBlock,
  setFromBlock,
  toBlock,
  setToBlock,
  subject,
  setSubject,
  reference,
  setReference,
  salutation,
  setSalutation,
  letterBody,
  setLetterBody,
  signatureBlock,
  setSignatureBlock,
  valediction,
  setValediction,
  enclosures,
  setEnclosures,
  copyTo,
  setCopyTo,

  // Textarea Letter State (Unified Fallback)
  letterContent,
  setLetterContent,

  // Actions
  isCopied,
  onCopy,
  onPrint,
  onSave,
  historyOpen,
  setHistoryOpen,
}) {
  const [editorMode, setEditorMode] = useState("structured"); // "structured" | "raw"
  const [compactPrint, setCompactPrint] = useState(false);

  // Compiles all structured fields into standard plain text layout
  const compileRawLetter = () => {
    const valedictionLine = valediction ? `                                                       ${valediction}\n` : "";
    return `${letterhead ? letterhead + "\n\n" : ""}${memoNumber || "Memo No. __________"}                                   Date: ${placeAndDate || "__________"}\n\nFrom : ${fromBlock || ""}\n\nTo : ${toBlock || ""}\n\nSub: ${subject || ""}\n${reference ? "Ref: " + reference + "\n" : ""}\n${salutation || "Sir,"}\n\n${letterBody || ""}\n\n${valedictionLine}                                                       ${signatureBlock || ""}\n\n${enclosures ? "Encl:\n" + enclosures + "\n\n" : ""}${copyTo ? "------------------------------------------------------------\n" + (memoNumber || "Memo No. __________") + "                                   Date: " + (placeAndDate || "__________") + "\n\nCopy forwarded for information to:\n" + copyTo + "\n\n                                                       " + (signatureBlock || "") : ""}`;
  };

  const handleToggleRaw = () => {
    if (editorMode === "structured") {
      setLetterContent(compileRawLetter());
      setEditorMode("raw");
    } else {
      // Prompt user that moving back will overlay their raw changes
      if (confirm("Switching back to Structured Designer will sync the preview canvas with your individual input form fields. Proceed?")) {
        setEditorMode("structured");
      }
    }
  };

  // High-Fidelity Client-side Export to Microsoft Word DOC Document
  // High-Fidelity Client-side Export to Microsoft Word DOC Document
  const exportToDoc = () => {
    // Determine dimensions and font parameters based on compact mode
    const finalFontSize = compactPrint ? "11pt" : "12pt";
    const finalLineHeight = compactPrint ? "1.25" : "1.4";

    // Helper to strip technical placeholders, bracket text, and excessive underscores
    const cleanValue = (val, fallback = "") => {
      if (!val) return fallback;
      let s = val.trim();
      // Remove standard bracket placeholders like [CENTRAL OFFICE HEADER], [Memo No. ________], etc.
      s = s.replace(/\[[^\]]*\]/g, "");
      // Remove repeating underscores or dashes used as blank spaces (3 or more)
      s = s.replace(/_{3,}/g, "");
      s = s.replace(/-{3,}/g, "");
      s = s.trim();
      return s || fallback;
    };

    // Convert newlines in text blocks to standard HTML br breaks
    const formatHtmlText = (text) => {
      if (!text) return "";
      return text.replace(/\n/g, "<br/>");
    };

    // Calculate aspect ratio dynamically for the logo to avoid huge/stretched display in MS Word
    let logoWidth = 60;
    let logoHeight = 60;
    const previewImg = document.querySelector('img[alt="Letterhead Logo"]');
    if (previewImg && previewImg.naturalHeight) {
      const ratio = previewImg.naturalWidth / previewImg.naturalHeight;
      logoWidth = Math.round(60 * ratio);
    }

    let html = "";

    if (editorMode === "raw") {
      const cleanContent = cleanValue(letterContent);
      html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>Letter - E-Office</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page WordSection1 {
              size: 8.27in 11.69in;
              margin: ${margins?.top ?? 0.8}in ${margins?.right ?? 1.0}in ${margins?.bottom ?? 0.8}in ${margins?.left ?? 1.0}in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
            }
            div.WordSection1 {
              page: WordSection1;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: ${finalFontSize};
              line-height: ${finalLineHeight};
              color: #000000;
            }
            p {
              margin: 0 0 8pt 0;
              font-family: 'Times New Roman', Times, serif;
              font-size: ${finalFontSize};
              line-height: ${finalLineHeight};
            }
          </style>
        </head>
        <body>
          <div class="WordSection1" style="font-family: 'Times New Roman', Times, serif;">
            <p>${formatHtmlText(cleanContent)}</p>
          </div>
        </body>
        </html>
      `;
    } else {
      const cleanLetterhead = cleanValue(letterhead);
      const cleanMemoNoInput = cleanValue(memoNumber);
      const cleanPlaceAndDate = cleanValue(placeAndDate);
      const cleanFrom = cleanValue(fromBlock);
      const cleanTo = cleanValue(toBlock);
      const cleanSubject = cleanValue(subject);
      const cleanReference = cleanValue(reference);
      const cleanSalutation = cleanValue(salutation, "Sir,");
      const cleanLetterBody = cleanValue(letterBody);
      const cleanSignature = cleanValue(signatureBlock);
      const cleanValediction = cleanValue(valediction);
      const cleanEnclosures = cleanValue(enclosures);
      const cleanCopyTo = cleanValue(copyTo);

      // Resolve memo prefix duplicate
      const cleanMemoNo = cleanMemoNoInput?.toLowerCase().startsWith("memo no") 
        ? cleanMemoNoInput 
        : cleanMemoNoInput ? `Memo No. ${cleanMemoNoInput}` : "";

      html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>Letter - E-Office</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page WordSection1 {
              size: 8.27in 11.69in;
              margin: ${margins?.top ?? 0.8}in ${margins?.right ?? 1.0}in ${margins?.bottom ?? 0.8}in ${margins?.left ?? 1.0}in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
            }
            div.WordSection1 {
              page: WordSection1;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: ${finalFontSize};
              line-height: ${finalLineHeight};
              color: #000000;
            }
            p {
              margin: 0 0 8pt 0;
              font-family: 'Times New Roman', Times, serif;
              font-size: ${finalFontSize};
              line-height: ${finalLineHeight};
            }
          </style>
        </head>
        <body>
          <div class="WordSection1" style="font-family: 'Times New Roman', Times, serif;">
            
            <!-- 1. Letterhead Emblem + Title (Centered) -->
            <p align="center" style="text-align: center; margin-bottom: 4pt;">
              <img src="${headerLogo || (window.location.origin + '/emblem.png')}" alt="Emblem" width="${logoWidth}" height="${logoHeight}" style="height: 60px; width: ${logoWidth}px;" />
            </p>
            ${cleanLetterhead ? `
            <p align="center" style="text-align: center; font-size: ${compactPrint ? "13pt" : "14pt"}; font-weight: bold; margin-bottom: 15pt;">
              <b>${formatHtmlText(cleanLetterhead)}</b>
            </p>
            ` : ""}

            <!-- 2 & 3. Memo No & Date Line (Using native borderless table) -->
            <table border="0" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-bottom: 1px solid #000000; padding-bottom: 6px; margin-bottom: 12pt;">
              <tr>
                <td align="left" valign="bottom" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold;">
                  <b>${cleanMemoNo}</b>
                </td>
                <td align="right" valign="bottom" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; text-align: right;">
                  <b>Date: ${cleanPlaceAndDate}</b>
                </td>
              </tr>
            </table>

            <!-- 4. From Block -->
            ${cleanFrom ? `
            <p style="margin-top: 10pt; margin-bottom: 2pt; font-weight: bold;">
              <b>From :</b>
            </p>
            <p style="margin-left: 20pt; margin-top: 0; margin-bottom: 10pt;">
              ${formatHtmlText(cleanFrom)}
            </p>
            ` : ""}

            <!-- 5. To Block -->
            ${cleanTo ? `
            <p style="margin-top: 10pt; margin-bottom: 2pt; font-weight: bold;">
              <b>To :</b>
            </p>
            <p style="margin-left: 20pt; margin-top: 0; margin-bottom: 12pt;">
              ${formatHtmlText(cleanTo)}
            </p>
            ` : ""}

            <!-- 6 & 7. Subject & Reference Area -->
            <p style="margin-top: 12pt; margin-bottom: 6pt; font-weight: bold;">
              <b>Sub: ${cleanSubject}</b>
            </p>
            ${cleanReference ? `
            <p style="margin-top: 6pt; margin-bottom: 12pt; font-style: italic;">
              <i>Ref: ${formatHtmlText(cleanReference)}</i>
            </p>
            ` : ""}

            <!-- 8. Salutation -->
            <p style="font-weight: bold; margin-bottom: 10pt; margin-top: 10pt;">
              <b>${cleanSalutation}</b>
            </p>

            <!-- 9. Letter Body -->
            <p style="margin-bottom: 18pt;">
              ${formatHtmlText(cleanLetterBody)}
            </p>

            <!-- 10. Valediction & Signature Block (Standard right-aligned cell block) -->
            <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15pt; margin-bottom: 15pt; width: 100%;">
              <tr>
                <td width="55%"></td>
                <td width="45%" align="center" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; text-align: center;">
                  ${cleanValediction ? `<b>${formatHtmlText(cleanValediction)}</b><br/><br/><br/><br/>` : `<br/><br/><br/><br/>`}
                  <b>${formatHtmlText(cleanSignature)}</b>
                </td>
              </tr>
            </table>

            <!-- 11. Enclosures -->
            ${cleanEnclosures ? `
            <p style="border-top: 1px solid #cbd5e1; padding-top: 8pt; margin-top: 15pt; font-weight: bold;">
              <b>Enclosures (Encl:):</b>
            </p>
            <p style="margin-left: 20pt; margin-bottom: 15pt;">
              ${formatHtmlText(cleanEnclosures)}
            </p>
            ` : ""}

            <!-- 12. Copy Forwarding Distribution -->
            ${cleanCopyTo ? `
            <div style="margin-top: 25pt;">
              <!-- Border divider line -->
              <p style="border-top: 1px dashed #000000; margin-top: 12pt; margin-bottom: 12pt; font-size: 1pt;">&nbsp;</p>
              
              <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 10pt; width: 100%;">
                <tr>
                  <td align="left" valign="bottom" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold;">
                    <b>${cleanMemoNo}</b>
                  </td>
                  <td align="right" valign="bottom" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; text-align: right;">
                    <b>Date: ${cleanPlaceAndDate}</b>
                  </td>
                </tr>
              </table>

              <p style="margin-top: 8pt; margin-bottom: 8pt; font-weight: bold;">
                <b>Copy forwarded for information and necessary action to:</b>
              </p>
              
              <p style="margin-left: 20pt; margin-bottom: 15pt;">
                ${formatHtmlText(cleanCopyTo)}
              </p>

              <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15pt; width: 100%;">
                <tr>
                  <td width="55%"></td>
                  <td width="45%" align="center" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; text-align: center;">
                    <br/><br/><br/>
                    <b>${formatHtmlText(cleanSignature)}</b>
                  </td>
                </tr>
              </table>
            </div>
            ` : ""}

          </div>
        </body>
        </html>
      `;
    }

    const blob = new Blob(['\ufeff' + html], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Letter_${(memoNumber || "Draft").replace(/[\/\\?%*:|"<>]/g, "-")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-indigo-50/20 via-slate-50/10 to-violet-50/20">
      
      {/* Top Action Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-indigo-50 px-5 py-3 flex flex-wrap items-center justify-between print:hidden gap-3 shadow-sm shrink-0">
        
        {/* Designer Mode Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/60">
          <button
            onClick={() => setEditorMode("structured")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              editorMode === "structured"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Structured Layout
          </button>
          <button
            onClick={handleToggleRaw}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              editorMode === "raw"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Raw Text Canvas
          </button>
        </div>

        {/* Output Controls */}
        <div className="flex items-center gap-2">
          {/* Single-Page Fit (High Density) Toggle */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 hover:border-indigo-300 select-none transition-all">
            <input
              type="checkbox"
              checked={compactPrint}
              onChange={(e) => setCompactPrint(e.target.checked)}
              className="rounded border-indigo-200 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5 accent-indigo-650"
            />
            <span className="text-[10px] font-black uppercase text-indigo-950 tracking-wider">
              Single-Page Fit
            </span>
          </label>

          {/* Copy */}
          <button
            onClick={() => {
              if (editorMode === "raw") {
                onCopy();
              } else {
                navigator.clipboard.writeText(compileRawLetter());
                onCopy();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-lg shadow-sm transition-all"
          >
            {isCopied ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 animate-scale" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-indigo-600" />
                Copy
              </>
            )}
          </button>

          {/* Export PDF */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/30 rounded-lg shadow-sm transition-all"
            title="Generate high-fidelity vector PDF using browser print system"
          >
            <Printer className="h-3.5 w-3.5 text-red-500" />
            Export PDF
          </button>

          {/* Export DOC */}
          <button
            onClick={exportToDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-lg shadow-sm transition-all"
            title="Download editable Microsoft Word DOC document"
          >
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            Export DOC
          </button>

          {/* Save to history */}
          <button
            onClick={() => {
              if (editorMode === "structured") {
                setLetterContent(compileRawLetter());
              }
              setTimeout(onSave, 100);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-sm rounded-lg hover:scale-[1.01] transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            Save History
          </button>

          {/* Divider */}
          <span className="h-5 w-[1px] bg-slate-200 mx-1"></span>

          {/* History Drawer toggle */}
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-fuchsia-300 hover:bg-fuchsia-50/30 rounded-lg shadow-sm transition-all"
          >
            <History className="h-3.5 w-3.5 text-fuchsia-600" />
            Archive
          </button>
        </div>
      </div>

      {/* Margin Adjuster Bar */}
      <div className="bg-slate-50 border-b border-slate-200/85 px-5 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700 print:hidden shadow-xs shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Margins:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Top</span>
            <input
              type="number"
              step="0.05"
              min="0.2"
              max="2.5"
              value={margins?.top ?? 0.8}
              onChange={(e) => handleMarginChange("top", parseFloat(e.target.value) || 0.8)}
              className="w-14 px-1.5 py-0.5 border border-slate-200 rounded font-bold bg-white text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-center"
            />
            <span className="text-[10px] text-slate-400">in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Bottom</span>
            <input
              type="number"
              step="0.05"
              min="0.2"
              max="2.5"
              value={margins?.bottom ?? 0.8}
              onChange={(e) => handleMarginChange("bottom", parseFloat(e.target.value) || 0.8)}
              className="w-14 px-1.5 py-0.5 border border-slate-200 rounded font-bold bg-white text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-center"
            />
            <span className="text-[10px] text-slate-400">in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Left</span>
            <input
              type="number"
              step="0.05"
              min="0.2"
              max="2.5"
              value={margins?.left ?? 1.0}
              onChange={(e) => handleMarginChange("left", parseFloat(e.target.value) || 1.0)}
              className="w-14 px-1.5 py-0.5 border border-slate-200 rounded font-bold bg-white text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-center"
            />
            <span className="text-[10px] text-slate-400">in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Right</span>
            <input
              type="number"
              step="0.05"
              min="0.2"
              max="2.5"
              value={margins?.right ?? 1.0}
              onChange={(e) => handleMarginChange("right", parseFloat(e.target.value) || 1.0)}
              className="w-14 px-1.5 py-0.5 border border-slate-200 rounded font-bold bg-white text-indigo-650 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-center"
            />
            <span className="text-[10px] text-slate-400">in</span>
          </div>
        </div>

        {/* Quick Margin Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">Presets:</span>
          <button
            type="button"
            onClick={() => handleMarginPreset(0.8, 0.8, 1.0, 1.0)}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => handleMarginPreset(0.5, 0.5, 0.5, 0.5)}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            Narrow
          </button>
          <button
            type="button"
            onClick={() => handleMarginPreset(1.2, 1.2, 1.2, 1.2)}
            className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            Wide
          </button>
        </div>
      </div>

      {/* Dynamic print stylesheet to apply the margins set in the preview panel when printing/saving to PDF */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: ${margins?.top ?? 0.8}in ${margins?.right ?? 1.0}in ${margins?.bottom ?? 0.8}in ${margins?.left ?? 1.0}in !important;
          }
          #letter-canvas {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #letter-canvas > div {
            padding: 0 !important;
            margin: 0 !important;
          }
          #letter-canvas textarea {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Main Sheet Workspace */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 print:p-0 print:overflow-visible">
        <div className="max-w-4xl mx-auto print:max-w-full">
          
          <div
            id="letter-canvas"
            className="bg-white shadow-xl rounded-2xl border border-indigo-100/60 print:shadow-none print:rounded-none print:border-none select-text"
          >
            {editorMode === "structured" ? (
              /* A. HIGH-FIDELITY CENTERED GOVERNMENT LETTERHEAD CANVAS */
              <div 
                className={`p-12 lg:p-16 text-slate-800 ${compactPrint ? "space-y-2.5 print:space-y-1.5" : "space-y-4 print:space-y-2.5"}`}
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: compactPrint ? "11pt" : "12pt",
                  lineHeight: compactPrint ? "1.25" : "1.4",
                  paddingTop: `${margins?.top ?? 0.8}in`,
                  paddingBottom: `${margins?.bottom ?? 0.8}in`,
                  paddingLeft: `${margins?.left ?? 1.0}in`,
                  paddingRight: `${margins?.right ?? 1.0}in`,
                }}
              >
                {/* 1. Indian Government Emblem and Letterhead */}
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <img
                    src={headerLogo || "/emblem.png"}
                    alt="Letterhead Logo"
                    className="h-16 w-auto max-w-[120px] object-contain print:h-14 mb-1"
                  />
                  
                  {/* Centered editable header lines */}
                  <AutoResizeTextarea
                    value={letterhead}
                    onChange={(e) => setLetterhead(e.target.value)}
                    rows={3}
                    className="w-full text-center border-0 font-bold focus:ring-0 focus:outline-none bg-transparent resize-none text-[13.5pt] leading-tight select-text"
                    placeholder="[CENTRAL OFFICE HEADER]"
                  />
                </div>

                {/* 2 & 3. Memo Number (Left) and Date (Right) Line */}
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-1.5 pt-1 print:pb-1 print:pt-0.5">
                  <div className="flex items-center gap-1 font-bold w-1/2">
                    {!memoNumber?.toLowerCase().startsWith("memo no") && (
                      <span className="shrink-0 text-slate-950 font-bold">Memo No.</span>
                    )}
                    <input
                      type="text"
                      value={memoNumber}
                      onChange={(e) => setMemoNumber(e.target.value)}
                      className="border-0 p-0 focus:ring-0 focus:outline-none w-full bg-transparent font-medium"
                      placeholder="e.g. Memo No. 452/Kali-I"
                    />
                  </div>
                  <div className="flex items-center gap-1 justify-end w-1/2">
                    <span className="shrink-0 text-slate-950 font-bold">Date:</span>
                    <input
                      type="text"
                      value={placeAndDate}
                      onChange={(e) => setPlaceAndDate(e.target.value)}
                      className="border-0 p-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-slate-800 text-left"
                      style={{ width: `${Math.max(12, (placeAndDate || "").length + 1)}ch` }}
                      placeholder="e.g. 25th May, 2026"
                    />
                  </div>
                </div>

                {/* 4. From Block */}
                {fromBlock && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-950 block">From :</span>
                    <AutoResizeTextarea
                      value={fromBlock}
                      onChange={(e) => setFromBlock(e.target.value)}
                      rows={2}
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1"
                      placeholder="Issuing officer details..."
                    />
                  </div>
                )}

                {/* 5. To Block */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-950 block">To :</span>
                  <AutoResizeTextarea
                    value={toBlock}
                    onChange={(e) => setToBlock(e.target.value)}
                    rows={2}
                    className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1"
                    placeholder="Recipient address block..."
                  />
                </div>

                {/* 6 & 7. Subject & Reference Indented Box */}
                <div className={`bg-slate-50/50 border border-slate-100/60 print:bg-transparent print:border-none print:p-0 ${
                  compactPrint ? "p-2 my-1.5 space-y-1 print:my-1" : "p-3 my-2.5 space-y-1.5 print:my-1.5"
                }`}>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0 text-slate-950">Sub:</span>
                    <AutoResizeTextarea
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      rows={2}
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-bold text-slate-950 leading-snug"
                      placeholder="Subject summary..."
                    />
                  </div>
                  <div className={`flex items-start gap-1.5 border-t border-slate-100/50 pt-1.5 print:border-none ${!reference ? "print:hidden" : ""}`}>
                    <span className="font-bold italic text-[11pt] text-slate-800 shrink-0">Ref:</span>
                    <AutoResizeTextarea
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      rows={1}
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium italic text-slate-700 leading-snug"
                      style={{ fontSize: compactPrint ? "10pt" : "11pt" }}
                      placeholder="Reference memo citations..."
                    />
                  </div>
                </div>

                {/* 8. Salutation */}
                <div>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="border-0 p-0 focus:ring-0 focus:outline-none font-bold bg-transparent"
                    placeholder="Sir,"
                  />
                </div>

                {/* 9. Letter Body paragraphs */}
                <div className="relative w-full">
                  {!letterBody && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06] z-0">
                      <span className="text-5xl lg:text-6xl font-black uppercase tracking-widest text-slate-900 border-4 lg:border-8 border-slate-900 p-4 lg:p-6 rotate-[-12deg] rounded-2xl">
                        LETTER BODY
                      </span>
                    </div>
                  )}
                  <AutoResizeTextarea
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    rows={4}
                    className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none text-slate-855 overflow-hidden relative z-10"
                    style={{
                      fontSize: compactPrint ? "11pt" : "12pt",
                      lineHeight: compactPrint ? "1.25" : "1.4"
                    }}
                    placeholder="Write body paragraphs here..."
                  />
                </div>

                {/* 10. Valediction & Signature Block (Bottom Right) */}
                <div className="flex flex-col items-end pt-2 print:pt-1">
                  <div className="text-center w-80 flex flex-col items-center space-y-1 select-text">
                    {valediction !== null && (
                      <div className="flex items-center gap-1.5 group justify-center w-full">
                        <input
                          type="text"
                          value={valediction}
                          onChange={(e) => setValediction(e.target.value)}
                          className="border-0 p-0 focus:ring-0 focus:outline-none font-bold bg-transparent text-center text-slate-950"
                          style={{ width: `${Math.max(10, (valediction || "").length + 2)}ch` }}
                          placeholder="Yours sincerely,"
                        />
                        <button
                          onClick={() => setValediction(null)}
                          className="opacity-0 group-hover:opacity-100 text-[9px] text-rose-400 hover:text-rose-600 font-bold transition-opacity print:hidden"
                          title="Remove valediction"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {valediction === null && (
                      <button
                        onClick={() => setValediction("Yours sincerely,")}
                        className="text-[10px] text-indigo-400 hover:text-indigo-600 font-bold transition-colors print:hidden"
                      >
                        + Add valediction
                      </button>
                    )}
                    <div className="h-14 print:h-14 w-full"></div>
                    <AutoResizeTextarea
                      value={signatureBlock}
                      onChange={(e) => setSignatureBlock(e.target.value)}
                      rows={3}
                      className="w-full border-0 p-0 focus:ring-0 focus:outline-none text-center bg-transparent resize-none font-bold text-slate-900 leading-normal overflow-hidden"
                      placeholder="Officer Designation Block"
                    />
                  </div>
                </div>

                {/* 11. Enclosures (Encl:) */}
                <div className={`border-t border-slate-150 pt-1.5 print:pt-1 ${compactPrint ? "mt-1.5 print:mt-1" : "mt-2.5 print:mt-1.5"} ${!enclosures ? "print:hidden" : ""}`}>
                  <span className="font-bold text-slate-950 block mb-1">Enclosures (Encl:):</span>
                  <AutoResizeTextarea
                    value={enclosures}
                    onChange={(e) => setEnclosures(e.target.value)}
                    rows={2}
                    className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1 overflow-hidden"
                    placeholder="Attachments list..."
                  />
                </div>

                {/* 12. Copy Forwarding Distribution (Copy forwarded for information to:) */}
                <div className={`border-t-2 border-dashed border-slate-200 pt-2 space-y-2 print:pt-1 ${
                  compactPrint ? "mt-2.5 print:mt-1.5" : "mt-4 print:mt-2.5"
                } ${!copyTo ? "print:hidden" : ""}`}>
                  {/* Aligned Copy Forwarding Header Memo & Date */}
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-1 font-bold w-1/2">
                      {!memoNumber?.toLowerCase().startsWith("memo no") && (
                        <span className="shrink-0 text-slate-950 font-bold">Memo No.</span>
                      )}
                      <input
                        type="text"
                        value={memoNumber}
                        onChange={(e) => setMemoNumber(e.target.value)}
                        className="border-0 p-0 focus:ring-0 focus:outline-none w-full bg-transparent font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1 justify-end w-1/2">
                      <span className="shrink-0 text-slate-950 font-bold">Date:</span>
                      <input
                        type="text"
                        value={placeAndDate}
                        onChange={(e) => setPlaceAndDate(e.target.value)}
                        className="border-0 p-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-slate-800 text-left"
                        style={{ width: `${Math.max(12, (placeAndDate || "").length + 1)}ch` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="font-bold text-slate-950 block">Copy forwarded for information and necessary action to:</span>
                    <AutoResizeTextarea
                      value={copyTo}
                      onChange={(e) => setCopyTo(e.target.value)}
                      rows={4}
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1 leading-relaxed overflow-hidden"
                      placeholder="1. Office Copy\n2. Supervisor for audits..."
                    />
                  </div>

                  {/* Aligned Copy Footer Signature (Bottom Right) */}
                  <div className="flex flex-col items-end pt-2 print:pt-1">
                    <div className="text-center w-80 flex flex-col items-center space-y-1">
                      <div className="h-12 print:h-12 w-full"></div>
                      <AutoResizeTextarea
                        value={signatureBlock}
                        onChange={(e) => setSignatureBlock(e.target.value)}
                        rows={3}
                        className="w-full border-0 p-0 focus:ring-0 focus:outline-none text-center bg-transparent resize-none font-bold text-slate-900 leading-normal overflow-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* B. RAW PLAINTEXT CANVAS EDITOR VIEW (FALLBACK) */
              <div className="bg-white rounded-xl">
                <AutoResizeTextarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  className="w-full min-h-[960px] border-0 focus:outline-none focus:ring-0 rounded-xl resize-none print:h-auto"
                  style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: "12pt",
                    lineHeight: "1.6",
                    paddingTop: `${margins?.top ?? 0.8}in`,
                    paddingBottom: `${margins?.bottom ?? 0.8}in`,
                    paddingLeft: `${margins?.left ?? 1.0}in`,
                    paddingRight: `${margins?.right ?? 1.0}in`,
                  }}
                  placeholder="Paste or write raw letter content here..."
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
