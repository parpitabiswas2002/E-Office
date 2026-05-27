import React, { useState } from "react";
import { Copy, Printer, Save, History, CheckCircle, Eye, Edit3, FileText, Download } from "lucide-react";

export default function RightOutputPane({
  // Margins setup
  margins,

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
    return `${letterhead ? letterhead + "\n\n" : ""}${memoNumber || "Memo No. __________"}                                   Date: ${placeAndDate || "__________"}\n\nFrom : ${fromBlock || ""}\n\nTo : ${toBlock || ""}\n\nSub: ${subject || ""}\n${reference ? "Ref: " + reference + "\n" : ""}\n${salutation || "Sir,"}\n\n${letterBody || ""}\n\n                                                       Yours faithfully,\n                                                       ${signatureBlock || ""}\n\n${enclosures ? "Encl:\n" + enclosures + "\n\n" : ""}${copyTo ? "------------------------------------------------------------\n" + (memoNumber || "Memo No. __________") + "                                   Date: " + (placeAndDate || "__________") + "\n\nCopy forwarded for information to:\n" + copyTo + "\n\n                                                       " + (signatureBlock || "") : ""}`;
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
  const exportToDoc = () => {
    // Determine dimensions and font parameters based on compact mode
    const finalFontSize = compactPrint ? "11pt" : "12pt";
    const finalLineHeight = compactPrint ? "1.25" : "1.4";
    
    // Resolve memo prefix duplicate
    const cleanMemoNo = memoNumber?.toLowerCase().startsWith("memo no") 
      ? memoNumber 
      : memoNumber ? `Memo No. ${memoNumber}` : "";

    // Convert newlines in text blocks to standard HTML br breaks
    const formatHtmlText = (text) => {
      if (!text) return "";
      return text.replace(/\n/g, "<br/>");
    };

    // Construct high-fidelity MS Word document with normal paragraph flows (no rigid Tables!)
    const html = `
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
          @page {
            size: A4;
            margin: ${margins?.top ?? 0.8}in ${margins?.right ?? 1.0}in ${margins?.bottom ?? 0.8}in ${margins?.left ?? 1.0}in;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: ${finalFontSize};
            line-height: ${finalLineHeight};
            color: #0f172a;
          }
          .letterhead-title {
            text-align: center;
            font-size: ${compactPrint ? "12.5pt" : "13.5pt"};
            font-weight: bold;
            line-height: 1.25;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div style="font-family: 'Times New Roman', Times, serif;">
          
          <!-- 1. Letterhead Title (Centered text only, no broken logo images) -->
          ${letterhead ? `<div class="letterhead-title">${formatHtmlText(letterhead)}</div>` : ""}

          <!-- 2 & 3. Memo No & Date Line (Using floating spans for a normal, editable line without tables) -->
          <div style="width: 100%; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 15px; overflow: hidden; clear: both;">
            <span style="float: left; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold;">
              ${cleanMemoNo}
            </span>
            <span style="float: right; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; text-align: right;">
              Dated, ${placeAndDate || "___________"}
            </span>
          </div>
          <div style="clear: both;"></div>

          <!-- 4. From Block (Standard editable paragraphs with left indents) -->
          ${fromBlock ? `
          <div style="margin-bottom: 12px; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; clear: both; overflow: hidden;">
            <div style="float: left; font-weight: bold; width: 60px;">From :</div>
            <div style="margin-left: 70px;">
              ${formatHtmlText(fromBlock)}
            </div>
          </div>
          <div style="clear: both;"></div>
          ` : ""}

          <!-- 5. To Block (Standard editable paragraphs with left indents) -->
          ${toBlock ? `
          <div style="margin-bottom: 15px; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; clear: both; overflow: hidden;">
            <div style="float: left; font-weight: bold; width: 60px;">To :</div>
            <div style="margin-left: 70px;">
              ${formatHtmlText(toBlock)}
            </div>
          </div>
          <div style="clear: both;"></div>
          ` : ""}

          <!-- 6 & 7. Subject & Reference Box (Using styled div blocks instead of rigid tables) -->
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; margin-top: 10px; margin-bottom: 15px; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; border-radius: 6px;">
            <div style="clear: both; overflow: hidden; margin-bottom: 6px;">
              <span style="float: left; font-weight: bold; width: 45px;">Sub:</span>
              <span style="margin-left: 55px; font-weight: bold; text-decoration: underline; display: block;">
                ${subject}
              </span>
            </div>
            <div style="clear: both;"></div>
            ${reference ? `
            <div style="clear: both; overflow: hidden; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 8px;">
              <span style="float: left; font-style: italic; width: 45px;">Ref:</span>
              <span style="margin-left: 55px; font-style: italic; display: block;">
                ${formatHtmlText(reference)}
              </span>
            </div>
            <div style="clear: both;"></div>
            ` : ""}
          </div>

          <!-- 8. Salutation -->
          <div style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; margin-bottom: 12px; clear: both;">
            ${salutation || "Sir,"}
          </div>

          <!-- 9. Letter Body paragraphs -->
          <div style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; line-height: ${finalLineHeight}; text-align: justify; margin-bottom: 20px; clear: both;">
            ${formatHtmlText(letterBody)}
          </div>

          <!-- 10. Yours faithfully & Signature Block (Floating div block, fully editable) -->
          <div style="float: right; width: 260px; text-align: right; margin-top: 15px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize};">
            <div style="font-weight: bold; margin-bottom: 45px; text-align: right; padding-right: 15px;">Yours faithfully,</div>
            <div style="font-weight: bold; line-height: 1.25; text-align: right;">
              ${formatHtmlText(signatureBlock)}
            </div>
          </div>
          <div style="clear: both;"></div>

          <!-- 11. Enclosures (Encl:) -->
          ${enclosures ? `
          <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 15px; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; clear: both;">
            <span style="font-weight: bold;">Enclosures (Encl:):</span>
            <div style="margin-left: 20px; padding-top: 6px;">
              ${formatHtmlText(enclosures)}
            </div>
          </div>
          ` : ""}

          <!-- 12. Copy Forwarding Distribution -->
          ${copyTo ? `
          <div style="margin-top: 25px; padding-top: 10px; clear: both;">
            <!-- Memo line with border -->
            <div style="width: 100%; border-top: 2px dashed #cbd5e1; padding-top: 8px; margin-bottom: 15px; overflow: hidden; clear: both;">
              <span style="float: left; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold;">
                ${cleanMemoNo}
              </span>
              <span style="float: right; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; text-align: right;">
                Dated, ${placeAndDate || "___________"}
              </span>
            </div>
            <div style="clear: both;"></div>

            <div style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; margin-bottom: 10px;">
              Copy forwarded for information and necessary action to:
            </div>
            
            <div style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; margin-left: 20px; line-height: ${finalLineHeight}; margin-bottom: 20px;">
              ${formatHtmlText(copyTo)}
            </div>

            <!-- Aligned Copy Signature -->
            <div style="float: right; width: 260px; text-align: right; margin-top: 15px; font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold; line-height: 1.25;">
              <div style="height: 45px;"></div>
              ${formatHtmlText(signatureBlock)}
            </div>
            <div style="clear: both;"></div>
          </div>
          ` : ""}

        </div>
      </body>
      </html>
    `;

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
                  {headerLogo ? (
                    <img
                      src={headerLogo}
                      alt="Letterhead Logo"
                      className="h-16 w-auto max-w-[120px] object-contain print:h-14 mb-1"
                    />
                  ) : (
                    /* Clean SVG representation of Ashoka Chakra / Indian Emblem */
                    <svg className="h-14 w-14 text-slate-900/90 print:h-12 print:w-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="50" cy="50" r="42" strokeDasharray="3 3" />
                      <circle cx="50" cy="50" r="28" />
                      <circle cx="50" cy="50" r="4" fill="currentColor" />
                      {/* Spokes representing the 24 Chakra spokes */}
                      {[...Array(24)].map((_, i) => {
                        const angle = (i * 360) / 24;
                        const rad = (angle * Math.PI) / 180;
                        return (
                          <line
                            key={i}
                            x1="50"
                            y1="50"
                            x2={50 + 28 * Math.cos(rad)}
                            y2={50 + 28 * Math.sin(rad)}
                            strokeWidth="1"
                          />
                        );
                      })}
                      <path d="M 40 85 L 60 85 M 43 89 L 57 89" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                  
                  {/* Centered editable header lines */}
                  <textarea
                    value={letterhead}
                    onChange={(e) => setLetterhead(e.target.value)}
                    rows="3"
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
                    <span className="shrink-0 text-slate-950 font-bold">Dated,</span>
                    <input
                      type="text"
                      value={placeAndDate}
                      onChange={(e) => setPlaceAndDate(e.target.value)}
                      className="border-0 p-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-slate-800 text-left"
                      style={{ width: `${Math.max(12, (placeAndDate || "").length + 1)}ch` }}
                      placeholder="e.g. Nadia, the 25th May, 2026"
                    />
                  </div>
                </div>

                {/* 4. From Block */}
                {fromBlock && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-950 block">From :</span>
                    <textarea
                      value={fromBlock}
                      onChange={(e) => setFromBlock(e.target.value)}
                      rows="2"
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1"
                      placeholder="Issuing officer details..."
                    />
                  </div>
                )}

                {/* 5. To Block */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-950 block">To :</span>
                  <textarea
                    value={toBlock}
                    onChange={(e) => setToBlock(e.target.value)}
                    rows="2"
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
                    <textarea
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      rows="2"
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-bold text-slate-950 leading-snug"
                      placeholder="Subject summary..."
                    />
                  </div>
                  {reference && (
                    <div className="flex items-start gap-1.5 border-t border-slate-100/50 pt-1.5 print:border-none">
                      <span className="font-bold italic text-[11pt] text-slate-800 shrink-0">Ref:</span>
                      <textarea
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        rows="1"
                        className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium italic text-slate-700 leading-snug"
                        style={{ fontSize: compactPrint ? "10pt" : "11pt" }}
                        placeholder="Reference memo citations..."
                      />
                    </div>
                  )}
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
                <div>
                  <textarea
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    rows={letterBody ? Math.max(3, letterBody.split("\n").length) : 4}
                    className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none text-slate-855 overflow-hidden"
                    style={{
                      fontSize: compactPrint ? "11pt" : "12pt",
                      lineHeight: compactPrint ? "1.25" : "1.4"
                    }}
                    placeholder="Write body paragraphs here..."
                  />
                </div>

                {/* 10. Yours faithfully & Signature Block (Bottom Right) */}
                <div className="flex flex-col items-end pt-2 print:pt-1">
                  <div className="text-right w-80 flex flex-col items-end space-y-1 select-text">
                    <span className="font-bold text-slate-950 pr-4">Yours faithfully,</span>
                    <textarea
                      value={signatureBlock}
                      onChange={(e) => setSignatureBlock(e.target.value)}
                      rows={signatureBlock ? Math.max(2, signatureBlock.split("\n").length) : 3}
                      className="w-full border-0 p-0 focus:ring-0 focus:outline-none text-right bg-transparent resize-none font-bold text-slate-900 leading-normal overflow-hidden"
                      placeholder="Officer Designation Block"
                    />
                  </div>
                </div>

                {/* 11. Enclosures (Encl:) */}
                {enclosures && (
                  <div className={`border-t border-slate-150 pt-1.5 print:pt-1 ${compactPrint ? "mt-1.5 print:mt-1" : "mt-2.5 print:mt-1.5"}`}>
                    <span className="font-bold text-slate-950 block mb-1">Enclosures (Encl:):</span>
                    <textarea
                      value={enclosures}
                      onChange={(e) => setEnclosures(e.target.value)}
                      rows={enclosures ? Math.max(1, enclosures.split("\n").length) : 2}
                      className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1 overflow-hidden"
                      placeholder="Attachments list..."
                    />
                  </div>
                )}

                {/* 12. Copy Forwarding Distribution (Copy forwarded for information to:) */}
                {copyTo && (
                  <div className={`border-t-2 border-dashed border-slate-200 pt-2 space-y-2 print:pt-1 ${
                    compactPrint ? "mt-2.5 print:mt-1.5" : "mt-4 print:mt-2.5"
                  }`}>
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
                        <span className="shrink-0 text-slate-950 font-bold">Dated,</span>
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
                      <textarea
                        value={copyTo}
                        onChange={(e) => setCopyTo(e.target.value)}
                        rows={copyTo ? Math.max(2, copyTo.split("\n").length) : 4}
                        className="w-full p-0 border-0 focus:ring-0 focus:outline-none bg-transparent resize-none font-medium ml-4 pl-1 leading-relaxed overflow-hidden"
                        placeholder="1. Office Copy\n2. Supervisor for audits..."
                      />
                    </div>

                    {/* Aligned Copy Footer Signature (Bottom Right) */}
                    <div className="flex flex-col items-end pt-2 print:pt-1">
                      <div className="text-right w-80 flex flex-col items-end space-y-1">
                        <textarea
                          value={signatureBlock}
                          onChange={(e) => setSignatureBlock(e.target.value)}
                          rows={signatureBlock ? Math.max(2, signatureBlock.split("\n").length) : 3}
                          className="w-full border-0 p-0 focus:ring-0 focus:outline-none text-right bg-transparent resize-none font-bold text-slate-900 leading-normal overflow-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* B. RAW PLAINTEXT CANVAS EDITOR VIEW (FALLBACK) */
              <div className="bg-white rounded-xl">
                <textarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  className="w-full min-h-[960px] p-12 lg:p-16 border-0 focus:outline-none focus:ring-0 rounded-xl resize-none print:p-8 print:h-auto"
                  style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: "12pt",
                    lineHeight: "1.6",
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
