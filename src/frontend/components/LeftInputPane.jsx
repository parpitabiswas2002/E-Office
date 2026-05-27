import React, { useState } from "react";
import { 
  FileText, 
  Send, 
  Upload, 
  Settings, 
  Loader2, 
  Building, 
  Calendar, 
  User, 
  Users, 
  Bookmark, 
  Link, 
  MessageSquare, 
  AlignLeft, 
  PenTool, 
  Paperclip, 
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";

export default function LeftInputPane({
  width,
  // Dynamic Settings Options from Parent (from LocalStorage)
  letterTypes,
  tones,
  copyPresets,
  toAddresses,
  
  // Drafting Core States
  mode,
  setMode,
  letterType,
  setLetterType,
  tone,
  setTone,
  replyNotes,
  setReplyNotes,
  uploadedFile,
  setUploadedFile,
  
  // Custom logo
  headerLogo,
  setHeaderLogo,
  
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
  
  // Submit Trigger
  isGenerating,
  onGenerate,
}) {
  // Accordion Toggles
  const [activeSection, setActiveSection] = useState("header"); // "header" | "recipient" | "content" | "closing"

  // Specialized letter body generation states
  const [bodyStyle, setBodyStyle] = useState("professional");
  const [isGeneratingBody, setIsGeneratingBody] = useState(false);

  const handleGenerateBody = async () => {
    if (!subject || !subject.trim()) {
      alert("Please ensure the Subject (Section 5) is filled out first, as it is used as the context for generating the body paragraphs.");
      return;
    }
    
    setIsGeneratingBody(true);
    try {
      const response = await fetch("/api/letters/generate-body", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: subject,
          style: bodyStyle,
          letterType: letterType,
          tone: tone
        })
      });
      const data = await response.json();
      if (data.success && data.body) {
        setLetterBody(data.body);
      } else {
        throw new Error(data.error || "Failed to generate body paragraphs.");
      }
    } catch (err) {
      console.error(err);
      alert(`Error generating body paragraphs: ${err.message}`);
    } finally {
      setIsGeneratingBody(false);
    }
  };

  // Dropdown Presets
  const letterheadPresets = [
    "Government of West Bengal\nOffice of the Block Development Officer\nKaliachak-I Dev. Block, Malda.",
    "Government of West Bengal\nOffice of the District Magistrate\nNadia Development Section.",
    "Government of India\nMinistry of Rural Development\nNew Delhi."
  ];

  const fromPresets = [
    "The Block Development Officer,\nKaliachak-I Dev. Block, Malda.",
    "The Assistant Returning Officer,\n43-54 Assembly Constituency.",
    "The Joint Block Development Officer,\nKaliachak-I Block, Malda."
  ];

  const toPresets = [
    "The District Magistrate,\nMalda.",
    "The Sub-Divisional Officer (Chanchal),\nMalda.",
    "The Returning Officer,\n43-54 Assembly Constituency, Malda.",
    "The Joint Secretary,\nP&RD Department, Govt of West Bengal."
  ];

  const salutationPresets = ["Sir,", "Madam,", "Sir / Madam,", "Dear Sir/Madam,"];

  const signaturePresets = [
    "Assistant Returning Officer\n&\nBlock Development Officer\nKaliachak-I Dev. Block, Malda.",
    "Block Development Officer\nKaliachak-I Dev. Block, Malda.",
    "Joint Block Development Officer\nKaliachak-I Dev. Block, Malda."
  ];

  const enclosurePresets = [
    "1. Staff list report (2 pages)\n2. Duty assignment sheet",
    "1. Utilisation Certificate in prescribed format\n2. Progress photographs (4 sheets)",
    "1. Copy of administrative approval\n2. Detailed project report"
  ];


  const handleFileDrop = (e, setFile) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div
      style={window.innerWidth >= 1024 && width ? { width: `${width}px` } : undefined}
      className="w-full bg-white/95 backdrop-blur-md border-r border-indigo-100 flex flex-col shadow-lg shrink-0 h-full"
    >
      {/* Header Info */}
      <div className="p-5 border-b border-indigo-50/80 bg-gradient-to-r from-indigo-50/20 to-violet-50/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-black tracking-tight">
              E-Office Assistant
            </h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Official Document Composer</p>
          </div>
        </div>

        {/* Dynamic Mode Switcher */}
        <div className="flex p-1 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
          <button
            onClick={() => setMode("draft")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "draft"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                : "text-indigo-600/80 hover:text-indigo-600 hover:bg-white/40"
            }`}
          >
            Draft Letter
          </button>
          <button
            onClick={() => setMode("reply")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "reply"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                : "text-indigo-600/80 hover:text-indigo-600 hover:bg-white/40"
            }`}
          >
            Reply to Letter
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* Recipient "To" Preset Selector Dropdown */}
        <div className="space-y-1.5 p-3.5 bg-indigo-50/15 rounded-2xl border border-indigo-50/40">
          <label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block">Select Recipient (To)</label>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setToBlock(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-indigo-100 rounded-xl bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- Choose Preset Recipient Address --</option>
            {(toAddresses || []).map((addr, idx) => (
              <option key={idx} value={addr}>
                {addr.split("\n")[0]} {addr.split("\n")[1] ? `— ${addr.split("\n")[1]}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Letter Type & Tone Configurations */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/20 rounded-2xl border border-indigo-50">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Letter Type</label>
            <select
              value={letterType}
              onChange={(e) => setLetterType(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-indigo-100 rounded-lg bg-white text-xs font-semibold text-slate-700"
            >
              {letterTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-indigo-100 rounded-lg bg-white text-xs font-semibold text-slate-700"
            >
              {tones.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {mode === "reply" && (
          /* MULTIMODAL INCOMING LETTER UPLOAD IN REPLY MODE */
          <div className="space-y-2 p-3.5 bg-violet-50/30 rounded-2xl border border-violet-100/50">
            <label className="text-[10px] font-bold text-violet-950 uppercase tracking-wider block">
              Upload Scanned Letter (Multimodal OCR)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, setUploadedFile)}
              onClick={() => document.getElementById("incoming-file").click()}
              className="border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-xl p-3.5 text-center cursor-pointer bg-white/40 hover:bg-white/80 transition-all group"
            >
              <input
                id="incoming-file"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
              />
              <Upload className="h-4 w-4 text-violet-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-violet-900 font-bold block">Click or Drop Scanned File</span>
              <span className="text-[9px] text-slate-400">PDF, JPEG, or PNG</span>
            </div>
            {uploadedFile && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-violet-100">
                <FileText className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                <span className="text-xs text-slate-700 font-bold truncate flex-1">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="text-xs text-rose-500 font-extrabold px-1">×</button>
              </div>
            )}
            <div className="space-y-1 pt-1.5">
              <label className="text-[10px] font-bold text-violet-950 uppercase tracking-wider">Reply Guidelines</label>
              <textarea
                value={replyNotes}
                onChange={(e) => setReplyNotes(e.target.value)}
                rows="2"
                className="w-full px-2.5 py-1.5 border border-violet-100 rounded-xl bg-white text-xs text-slate-700 focus:outline-none"
                placeholder="Mention specific directives or decision parameters for AI to incorporate..."
              />
            </div>
          </div>
        )}

        {/* 12 CORE COMPONENTS EDITING CONSOLE (COLLAPSIBLE SECTIONS) */}
        <div className="space-y-2.5">
          
          {/* SECTION 1: HEADER & ROUTING METADATA */}
          <div className="border border-indigo-50 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("header")}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-indigo-50/20 text-left flex items-center justify-between border-b border-indigo-50"
            >
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-indigo-500" />
                1. Header & Metadata
              </span>
              {activeSection === "header" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "header" && (
              <div className="p-3 bg-white space-y-3">
                {/* Logo Uploader */}
                <div className="space-y-1.5 p-2.5 bg-indigo-50/20 rounded-xl border border-indigo-50/50">
                  <label className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block">
                    Letterhead Emblem / Logo
                  </label>
                  
                  {headerLogo ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-indigo-100">
                      <img src={headerLogo} alt="Logo preview" className="h-8 w-8 object-contain rounded bg-slate-50 border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-800 block truncate">Custom Logo Active</span>
                        <span className="text-[9px] text-indigo-500 font-medium">Replaces Ashok Chakra</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeaderLogo(null)}
                        className="text-xs text-rose-500 font-extrabold hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById("header-logo-picker").click()}
                        className="flex-1 py-2 px-3 border border-dashed border-indigo-200 hover:border-indigo-400 rounded-lg text-center bg-white cursor-pointer transition-colors text-[10px] font-bold text-indigo-700 flex items-center justify-center gap-1.5"
                      >
                        <Upload className="h-3 w-3 text-indigo-600" />
                        Upload Custom Logo Image
                      </button>
                      <input
                        id="header-logo-picker"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setHeaderLogo(event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* 1. Letterhead */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Office Letterhead</label>
                    <select
                      onChange={(e) => setLetterhead(e.target.value)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border-0 rounded px-1.5 py-0.5"
                    >
                      <option value="">-- Apply Preset --</option>
                      {letterheadPresets.map((p, idx) => (
                        <option key={idx} value={p}>Preset {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={letterhead}
                    onChange={(e) => setLetterhead(e.target.value)}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="Enter official centered header lines..."
                  />
                </div>

                {/* 2. Memo No & 3. Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">2. Memo Number</label>
                    <input
                      type="text"
                      value={memoNumber}
                      onChange={(e) => setMemoNumber(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                      placeholder="e.g. Memo No. 452"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">3. Place & Date</label>
                    <input
                      type="text"
                      value={placeAndDate}
                      onChange={(e) => setPlaceAndDate(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                      placeholder="Place, the Date"
                    />
                  </div>
                </div>

                {/* 4. From Block */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">4. From Addressee</label>
                    <select
                      onChange={(e) => setFromBlock(e.target.value)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border-0 rounded px-1.5 py-0.5"
                    >
                      <option value="">-- Apply Preset --</option>
                      {fromPresets.map((p, idx) => (
                        <option key={idx} value={p}>From Preset {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={fromBlock}
                    onChange={(e) => setFromBlock(e.target.value)}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="Enter sending authority details..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: RECIPIENT & SUBJECT DETAILS */}
          <div className="border border-indigo-50 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("recipient")}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-indigo-50/20 text-left flex items-center justify-between border-b border-indigo-50"
            >
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                2. Recipient & Subject
              </span>
              {activeSection === "recipient" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "recipient" && (
              <div className="p-3 bg-white space-y-3">
                {/* 5. To Block */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">5. To Recipient</label>
                    <select
                      onChange={(e) => setToBlock(e.target.value)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border-0 rounded px-1.5 py-0.5"
                    >
                      <option value="">-- Add Addressee --</option>
                      {toPresets.map((p, idx) => (
                        <option key={idx} value={p}>{p.split(",")[0]}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={toBlock}
                    onChange={(e) => setToBlock(e.target.value)}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="To,\nDesignation and Address..."
                  />
                </div>

                {/* 6. Subject Line */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">6. Subject Line (Sub:)</label>
                  <textarea
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="Briefly state the letter subject..."
                  />
                </div>

                {/* 7. Reference Line */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">7. Reference Line (Ref:)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="Citations of previous correspondence..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SALUTATION & LETTER BODY */}
          <div className="border border-indigo-50 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("content")}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-indigo-50/20 text-left flex items-center justify-between border-b border-indigo-50"
            >
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                3. Letter Content
              </span>
              {activeSection === "content" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "content" && (
              <div className="p-3 bg-white space-y-3">
                {/* 8. Salutation */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">8. Salutation</label>
                    <div className="flex gap-1">
                      {salutationPresets.slice(0, 3).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setSalutation(preset)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
                            salutation === preset ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>

                {/* 9. Letter Body */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1.5 border-b border-indigo-50/50 pb-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">9. Letter Body paragraphs</label>
                      <button
                        type="button"
                        onClick={handleGenerateBody}
                        disabled={isGeneratingBody}
                        className={`px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] flex items-center gap-1 shadow transition-all ${
                          isGeneratingBody ? "opacity-50 cursor-not-allowed animate-pulse" : ""
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        {letterBody ? "Regenerate Body" : "Generate Body"}
                      </button>
                    </div>
                    
                    {/* Paragraph Style Tabs */}
                    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/40 w-full mt-1">
                      {["concise", "urgent", "professional", "legal"].map((styleOpt) => (
                        <button
                          key={styleOpt}
                          type="button"
                          onClick={() => setBodyStyle(styleOpt)}
                          className={`flex-1 text-center py-1 text-[9px] font-black rounded capitalize transition-all ${
                            bodyStyle === styleOpt
                              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {styleOpt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    rows="8"
                    className="w-full px-2.5 py-2 border border-slate-100 rounded-xl text-xs font-medium text-slate-750 leading-relaxed focus:ring-1 focus:ring-indigo-400"
                    placeholder="Compose letter paragraphs here or select style variant above and click 'Generate Body' to compile automatically using Gemini AI."
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: CLOSING & COPY FORWARDING */}
          <div className="border border-indigo-50 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("closing")}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-indigo-50/20 text-left flex items-center justify-between border-b border-indigo-50"
            >
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <PenTool className="h-3.5 w-3.5 text-indigo-500" />
                4. Signatures & Copy To
              </span>
              {activeSection === "closing" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "closing" && (
              <div className="p-3 bg-white space-y-3">
                {/* 10. Subscription / Signature */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">10. Signature Block</label>
                    <select
                      onChange={(e) => setSignatureBlock(e.target.value)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border-0 rounded px-1.5 py-0.5"
                    >
                      <option value="">-- Apply Preset --</option>
                      {signaturePresets.map((p, idx) => (
                        <option key={idx} value={p}>Officer Preset {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={signatureBlock}
                    onChange={(e) => setSignatureBlock(e.target.value)}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="Officer designation, name..."
                  />
                </div>

                {/* 11. Enclosures */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">11. Enclosures (Encl:)</label>
                    <select
                      onChange={(e) => setEnclosures(e.target.value)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border-0 rounded px-1.5 py-0.5"
                    >
                      <option value="">-- Apply Preset --</option>
                      {enclosurePresets.map((p, idx) => (
                        <option key={idx} value={p}>Encl Preset {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={enclosures}
                    onChange={(e) => setEnclosures(e.target.value)}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="Enter numbered attachments list..."
                  />
                </div>

                {/* 12. Copy To Footers */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">12. Copy Forwarded Recipients</label>
                    <select
                      onChange={(e) => setCopyTo(e.target.value)}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border-0 rounded px-1.5 py-0.5 max-w-[180px]"
                    >
                      <option value="">-- Apply Distribution --</option>
                      {(copyPresets || []).map((p, idx) => {
                        const firstLine = p.split('\n')[0] || `Preset ${idx + 1}`;
                        const displayLabel = firstLine.length > 25 ? firstLine.substring(0, 23) + "..." : firstLine;
                        return (
                          <option key={idx} value={p}>
                            {displayLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <textarea
                    value={copyTo}
                    onChange={(e) => setCopyTo(e.target.value)}
                    rows="3"
                    className="w-full px-2 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                    placeholder="1. SDO for information\n2. OC Section..."
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full h-11 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-700 hover:via-violet-700 hover:to-fuchsia-700 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-85 disabled:pointer-events-none"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Draft Letters...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Compose Letter via Gemini AI
            </>
          )}
        </button>

      </div>
    </div>
  );
}
