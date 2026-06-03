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
  Sparkles,
  Wand2
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

  // One-click AI topic
  topic,
  setTopic,
  
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
      style={{
        ...(window.innerWidth >= 1024 && width ? { width: `${width}px` } : {}),
        fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
      }}
      className="w-full bg-white border-r border-slate-200 flex flex-col shrink-0 h-full shadow-sm"
    >
      {/* Header Info */}
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-md">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base text-slate-900 font-bold tracking-tight">
              E-Office Assistant
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Official Document Composer</p>
          </div>
        </div>

        {/* Dynamic Mode Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-md border border-slate-200">
          <button
            onClick={() => setMode("draft")}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${
              mode === "draft"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-850 hover:bg-white/60"
            }`}
          >
            Draft Letter
          </button>
          <button
            onClick={() => setMode("reply")}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${
              mode === "reply"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-855 hover:bg-white/60"
            }`}
          >
            Reply to Letter
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* ── ONE-CLICK AI TOPIC FIELD (Draft mode only) ── */}
        {mode === "draft" && (
          <div className="space-y-3 p-4 rounded-md border border-slate-200 bg-slate-50 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-slate-700 rounded-md">
                <Wand2 className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Topic / Context</label>
                <p className="text-[9px] text-slate-500 font-medium">Describe the letter topic — AI fills all fields automatically</p>
              </div>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows="3"
              className="w-full px-3 py-2.5 border border-slate-300 focus:border-slate-500 rounded-md bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder-slate-400 transition-all resize-none"
              placeholder="e.g. Request to submit staff list for election duty at Movement Ground from 21-04-2026 to 23-04-2026, addressed to the District Magistrate, Malda..."
            />
            <button
              onClick={onGenerate}
              disabled={isGenerating || !topic.trim()}
              className={`w-full h-10 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-md transition-all font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isGenerating || !topic.trim() ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Draft Letter
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Recipient "To" Preset Selector Dropdown */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-md border border-slate-200">
          <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">Select Recipient (To)</label>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setToBlock(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-semibold text-slate-750 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md border border-slate-200">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Letter Type</label>
            <select
              value={letterType}
              onChange={(e) => setLetterType(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-750 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {letterTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-750 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {tones.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {mode === "reply" && (
          /* MULTIMODAL INCOMING LETTER UPLOAD IN REPLY MODE */
          <div className="space-y-3 p-4 bg-slate-50 rounded-md border border-slate-200">
            <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
              Upload Scanned Letter (Multimodal OCR)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, setUploadedFile)}
              onClick={() => document.getElementById("incoming-file").click()}
              className="border border-dashed border-slate-300 hover:border-slate-400 rounded-md p-3.5 text-center cursor-pointer bg-white hover:bg-slate-100/50 transition-all group"
            >
              <input
                id="incoming-file"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
              />
              <Upload className="h-4 w-4 text-slate-500 mx-auto mb-1" />
              <span className="text-[10px] text-slate-700 font-semibold block">Click or Drop Scanned File</span>
              <span className="text-[9px] text-slate-500">PDF, JPEG, or PNG</span>
            </div>
            {uploadedFile && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-md border border-slate-200">
                <FileText className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                <span className="text-xs text-slate-700 font-semibold truncate flex-1">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="text-xs text-rose-600 font-bold hover:text-rose-800 px-1.5 py-0.5 rounded hover:bg-rose-50">×</button>
              </div>
            )}
            <div className="space-y-1 pt-1.5">
              <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Reply Guidelines</label>
              <textarea
                value={replyNotes}
                onChange={(e) => setReplyNotes(e.target.value)}
                rows="2"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-xs text-slate-750 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Mention specific directives or decision parameters for AI to incorporate..."
              />
            </div>
          </div>
        )}

        {/* 12 CORE COMPONENTS EDITING CONSOLE (COLLAPSIBLE SECTIONS) */}
        <div className="space-y-5">
          
          {/* SECTION 1: HEADER & ROUTING METADATA */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm border-b-2 border-b-slate-300/80">
            <button
              onClick={() => toggleSection("header")}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 text-left flex items-center justify-between border-b border-slate-200"
            >
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-slate-600" />
                1. Header & Metadata
              </span>
              {activeSection === "header" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "header" && (
              <div className="p-3 bg-white space-y-3">
                {/* Logo Uploader */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                  <label className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Letterhead Emblem / Logo
                  </label>
                  
                  {headerLogo ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md border border-slate-200">
                      <img src={headerLogo} alt="Logo preview" className="h-8 w-8 object-contain rounded bg-slate-50 border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-800 block truncate">Custom Logo Active</span>
                        <span className="text-[9px] text-slate-500 font-medium">Replaces Default Emblem</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeaderLogo(null)}
                        className="text-xs text-rose-600 font-bold hover:text-rose-800 bg-rose-50 border border-rose-200 px-2 py-1 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById("header-logo-picker").click()}
                        className="flex-1 py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-md text-center bg-white cursor-pointer transition-colors text-[10px] font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                      >
                        <Upload className="h-3 w-3 text-slate-500" />
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
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Office Letterhead</label>
                    <select
                      onChange={(e) => setLetterhead(e.target.value)}
                      className="text-[10px] font-semibold text-slate-755 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Enter official centered header lines..."
                  />
                </div>

                {/* 2. Memo No & 3. Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">2. Memo Number</label>
                    <input
                      type="text"
                      value={memoNumber}
                      onChange={(e) => setMemoNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                      placeholder="e.g. Memo No. 452"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">3. Date</label>
                    <input
                      type="text"
                      value={placeAndDate}
                      onChange={(e) => setPlaceAndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                      placeholder="e.g. 25th May, 2026"
                    />
                  </div>
                </div>

                {/* 4. From Block */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">4. From Addressee</label>
                    <select
                      onChange={(e) => setFromBlock(e.target.value)}
                      className="text-[10px] font-semibold text-slate-755 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Enter sending authority details..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: RECIPIENT & SUBJECT DETAILS */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm border-b-2 border-b-slate-300/80">
            <button
              onClick={() => toggleSection("recipient")}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 text-left flex items-center justify-between border-b border-slate-200"
            >
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-slate-600" />
                2. Recipient & Subject
              </span>
              {activeSection === "recipient" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "recipient" && (
              <div className="p-3 bg-white space-y-3">
                {/* 5. To Block */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">5. To Recipient</label>
                    <select
                      onChange={(e) => setToBlock(e.target.value)}
                      className="text-[10px] font-semibold text-slate-755 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="To,\nDesignation and Address..."
                  />
                </div>

                {/* 6. Subject Line */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">6. Subject Line (Sub:)</label>
                  <textarea
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Briefly state the letter subject..."
                  />
                </div>

                {/* 7. Reference Line */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">7. Reference Line (Ref:)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Citations of previous correspondence..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SALUTATION & LETTER BODY */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm border-b-2 border-b-slate-300/80">
            <button
              onClick={() => toggleSection("content")}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 text-left flex items-center justify-between border-b border-slate-200"
            >
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-slate-600" />
                3. Letter Content
              </span>
              {activeSection === "content" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "content" && (
              <div className="p-3 bg-white space-y-3">
                {/* 8. Salutation */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">8. Salutation</label>
                    <div className="flex gap-1">
                      {salutationPresets.slice(0, 3).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setSalutation(preset)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
                            salutation === preset ? "bg-slate-700 text-white border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                  />
                </div>

                {/* 9. Letter Body */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">9. Letter Body paragraphs</label>
                      <button
                        type="button"
                        onClick={handleGenerateBody}
                        disabled={isGeneratingBody}
                        className={`px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-md font-semibold text-[10px] flex items-center gap-1 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-slate-500 ${
                          isGeneratingBody ? "opacity-50 cursor-not-allowed animate-pulse" : ""
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        {letterBody ? "Regenerate Body" : "Generate Body"}
                      </button>
                    </div>
                    
                    {/* Paragraph Style Tabs */}
                    <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-250 w-full mt-1.5">
                      {["concise", "urgent", "professional", "legal"].map((styleOpt) => (
                        <button
                          key={styleOpt}
                          type="button"
                          onClick={() => setBodyStyle(styleOpt)}
                          className={`flex-1 text-center py-1 text-[9px] font-black rounded capitalize transition-all ${
                            bodyStyle === styleOpt
                              ? "bg-white text-slate-850 shadow-sm border border-slate-300"
                              : "text-slate-500 hover:text-slate-900"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Compose letter paragraphs here or select style variant above and click 'Generate Body' to compile automatically using Gemini AI."
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: CLOSING & COPY FORWARDING */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm border-b-2 border-b-slate-300/80">
            <button
              onClick={() => toggleSection("closing")}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 text-left flex items-center justify-between border-b border-slate-200"
            >
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <PenTool className="h-3.5 w-3.5 text-slate-600" />
                4. Signatures & Copy To
              </span>
              {activeSection === "closing" ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {activeSection === "closing" && (
              <div className="p-3 bg-white space-y-3">
                {/* 10. Subscription / Signature */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">10. Signature Block</label>
                    <select
                      onChange={(e) => setSignatureBlock(e.target.value)}
                      className="text-[10px] font-semibold text-slate-755 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Officer designation, name..."
                  />
                </div>

                {/* 11. Enclosures */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">11. Enclosures (Encl:)</label>
                    <select
                      onChange={(e) => setEnclosures(e.target.value)}
                      className="text-[10px] font-semibold text-slate-755 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="Enter numbered attachments list..."
                  />
                </div>

                {/* 12. Copy To Footers */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">12. Copy Forwarded Recipients</label>
                    <select
                      onChange={(e) => setCopyTo(e.target.value)}
                      className="text-[10px] font-semibold text-slate-755 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-400 max-w-[180px]"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    placeholder="1. SDO for information\n2. OC Section..."
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* GENERATE BUTTON (Reply mode only – in draft mode the button is inside the Topic card) */}
        {mode === "reply" && (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full h-11 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-md transition-all font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-80 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Reply...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Draft Reply via Gemini AI
              </>
            )}
          </button>
        )}

      </div>
    </div>
  );
}
