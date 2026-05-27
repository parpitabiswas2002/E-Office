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
            @page {
              size: A4;
              margin: ${margins?.top ?? 0.8}in ${margins?.right ?? 1.0}in ${margins?.bottom ?? 0.8}in ${margins?.left ?? 1.0}in;
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
          <div style="font-family: 'Times New Roman', Times, serif;">
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
            @page {
              size: A4;
              margin: ${margins?.top ?? 0.8}in ${margins?.right ?? 1.0}in ${margins?.bottom ?? 0.8}in ${margins?.left ?? 1.0}in;
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
          <div style="font-family: 'Times New Roman', Times, serif;">
            
            <!-- 1. Letterhead Title (Centered bold text) -->
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
                  <b>Dated, ${cleanPlaceAndDate}</b>
                </td>
              </tr>
            </table>

            <!-- 4. From Block (Clean borderless aligned table) -->
            ${cleanFrom ? `
            <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 10pt; width: 100%;">
              <tr valign="top">
                <td width="8%" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold;"><b>From:</b></td>
                <td width="92%" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize};">
                  ${formatHtmlText(cleanFrom)}
                </td>
              </tr>
            </table>
            ` : ""}

            <!-- 5. To Block (Clean borderless aligned table) -->
            ${cleanTo ? `
            <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 12pt; width: 100%;">
              <tr valign="top">
                <td width="8%" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; font-weight: bold;"><b>To:</b></td>
                <td width="92%" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize};">
                  ${formatHtmlText(cleanTo)}
                </td>
              </tr>
            </table>
            ` : ""}

            <!-- 6 & 7. Subject & Reference Area -->
            <p style="margin-top: 12pt; margin-bottom: 6pt;">
              <b>Sub: <u>${cleanSubject}</u></b>
            </p>
            ${cleanReference ? `
            <p style="margin-top: 6pt; margin-bottom: 12pt;">
              <i>Ref: ${formatHtmlText(cleanReference)}</i>
            </p>
            ` : ""}

            <!-- 8. Salutation -->
            <p style="font-weight: bold; margin-bottom: 10pt; margin-top: 10pt;">
              <b>${cleanSalutation}</b>
            </p>

            <!-- 9. Letter Body -->
            <p style="text-align: justify; margin-bottom: 18pt;">
              ${formatHtmlText(cleanLetterBody)}
            </p>

            <!-- 10. Yours faithfully & Signature Block (Standard right-aligned cell block) -->
            <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15pt; margin-bottom: 15pt; width: 100%;">
              <tr>
                <td width="55%"></td>
                <td width="45%" align="right" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; text-align: right;">
                  <b>Yours faithfully,</b>
                  <br/><br/><br/><br/>
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
                    <b>Dated, ${cleanPlaceAndDate}</b>
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
                  <td width="45%" align="right" style="font-family: 'Times New Roman', Times, serif; font-size: ${finalFontSize}; text-align: right;">
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
