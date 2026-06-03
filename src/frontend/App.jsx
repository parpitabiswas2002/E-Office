import React, { useState, useEffect } from "react";
import { 
  FileText, 
  BarChart3, 
  Library, 
  Activity, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  UserCheck, 
  Sliders
} from "lucide-react";
import LeftInputPane from "./components/LeftInputPane.jsx";
import RightOutputPane from "./components/RightOutputPane.jsx";
import HistoryDrawer from "./components/HistoryDrawer.jsx";

export default function App() {
  // 1. Navigation & Modal Layout States
  const [activeTab, setActiveTab] = useState("drafting"); // "drafting" | "analytics" | "templates" | "diagnostics"
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("types"); // "types" | "tones"

  // 2. Letter Types & Tones States (Dynamic from LocalStorage)
  const [letterTypes, setLetterTypes] = useState([
    "Memo", "Show Cause", "Advisory", "General Requisition", "Meeting Intimation"
  ]);
  const [tones, setTones] = useState([
    "Formal", "Urgent", "Request", "Strict"
  ]);

  // Copy distribution list presets (dynamic)
  const [copyPresets, setCopyPresets] = useState([
    "1. The Sub-Divisional Officer (Chanchal) for kind information.\n2. The Officer-in-Charge, Election Section, Malda for information.\n3. The BMOH, Kaliachak-I Block for implementation.",
    "1. The District Magistrate, Malda for kind perusal.\n2. The CA to Additional District Magistrate (General) for information.",
    "1. The CDPO, Kaliachak-I Block.\n2. The BMOH, Kaliachak-I Block."
  ]);

  // Page Margins Configuration State
  const [margins, setMargins] = useState(() => {
    const saved = localStorage.getItem("e_office_page_margins");
    return saved ? JSON.parse(saved) : { top: 0.8, bottom: 0.8, left: 1.0, right: 1.0 };
  });

  const syncPreferencesToSupabase = async (updatedPrefs = {}) => {
    try {
      const payload = {
        letterTypes: updatedPrefs.letterTypes ?? letterTypes,
        tones: updatedPrefs.tones ?? tones,
        copyPresets: updatedPrefs.copyPresets ?? copyPresets,
        toAddresses: updatedPrefs.toAddresses ?? toAddresses,
        margins: updatedPrefs.margins ?? margins,
      };
      // Only include headerLogo when explicitly passed (avoids sending large base64 on every pref save)
      if (updatedPrefs.headerLogo !== undefined) {
        payload.headerLogo = updatedPrefs.headerLogo;
      }
      await fetch("/api/e-office/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Failed to sync preferences to Supabase:", e);
    }
  };

  const updateMarginPreset = (top, bottom, left, right) => {
    const updated = { top, bottom, left, right };
    setMargins(updated);
    localStorage.setItem("e_office_page_margins", JSON.stringify(updated));
    syncPreferencesToSupabase({ margins: updated });
  };

  const updateMarginField = (field, val) => {
    const updated = { ...margins, [field]: val };
    setMargins(updated);
    localStorage.setItem("e_office_page_margins", JSON.stringify(updated));
    syncPreferencesToSupabase({ margins: updated });
  };

  // To Addresses Configuration State
  const [toAddresses, setToAddresses] = useState(() => {
    const saved = localStorage.getItem("e_office_to_addresses");
    return saved ? JSON.parse(saved) : [
      "The District Magistrate,\nMalda.",
      "The Sub-Divisional Officer (Chanchal),\nMalda.",
      "The Returning Officer,\n43-54 Assembly Constituency, Malda.",
      "The Joint Secretary,\nP&RD Department, Govt of West Bengal."
    ];
  });

  const [newToInput, setNewToInput] = useState("");

  // Modal Editing Helper States
  const [newTypeInput, setNewTypeInput] = useState("");
  const [newToneInput, setNewToneInput] = useState("");
  const [newCopyPresetInput, setNewCopyPresetInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState("");

  // 3. The 12 Core Structured Letter Fields
  const [letterhead, setLetterhead] = useState(
    "Government of West Bengal\nOffice of the Block Development Officer\nKaliachak-I Dev. Block, Malda."
  );
  const [memoNumber, setMemoNumber] = useState("");
  const [placeAndDate] = useState("25th May, 2026");
  const [fromBlock, setFromBlock] = useState(
    "The Block Development Officer,\nKaliachak-I Dev. Block, Malda."
  );
  const [toBlock, setToBlock] = useState("The District Magistrate,\nMalda");
  const [subject, setSubject] = useState("");
  const [reference, setReference] = useState("");
  const [salutation, setSalutation] = useState("Sir,");
  const [letterBody, setLetterBody] = useState("");
  const [signatureBlock, setSignatureBlock] = useState(
    "The Block Development Officer,\nKaliachak-I Dev. Block, Malda."
  );
  const [valediction, setValediction] = useState("Yours sincerely,");
  const [enclosures, setEnclosures] = useState("1. ");
  const [copyTo, setCopyTo] = useState("1. ");

  // Sync fromBlock and signatureBlock in both directions
  useEffect(() => {
    if (fromBlock !== signatureBlock) {
      setSignatureBlock(fromBlock);
    }
  }, [fromBlock]);

  useEffect(() => {
    if (signatureBlock !== fromBlock) {
      setFromBlock(signatureBlock);
    }
  }, [signatureBlock]);

  // Dynamic Aligned Date States
  const [rawPlace, setRawPlace] = useState("Kaliachak");
  const [rawDate, setRawDate] = useState("2026-05-25");

  // Custom Letterhead Emblem (Base64 Data URL)
  const [headerLogo, setHeaderLogoState] = useState(() => {
    const cached = localStorage.getItem("e_office_header_logo");
    return cached || null;
  });

  // Wrapper that persists logo to both localStorage and Supabase
  const setHeaderLogo = (logo) => {
    setHeaderLogoState(logo);
    if (logo) {
      localStorage.setItem("e_office_header_logo", logo);
    } else {
      localStorage.removeItem("e_office_header_logo");
    }
    // Persist to Supabase (null means remove)
    syncPreferencesToSupabase({ headerLogo: logo });
  };

  // Compiled raw text canvas editor state
  const [letterContent, setLetterContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);

  // Input states (Mode indicators)
  const [mode, setMode] = useState("draft");
  const [letterType, setLetterType] = useState("Memo");
  const [tone, setTone] = useState("Formal");
  const [replyNotes, setReplyNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // One-click AI topic field
  const [topic, setTopic] = useState("");

  // Diagnostics States
  const [diagnosticsStatus, setDiagnosticsStatus] = useState("idle");
  const [diagnosticsInfo, setDiagnosticsInfo] = useState(null);

  // Resizable Splitter States
  const [leftWidth, setLeftWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const sidebarWidth = window.innerWidth >= 1024 ? 80 : 64;
      const minWidth = 320;
      const maxWidth = window.innerWidth - 450;
      const newWidth = Math.max(minWidth, Math.min(e.clientX - sidebarWidth, maxWidth));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);


  // Format Dynamic Aligned Place & Date when changed
  const getPlaceAndDateStr = () => {
    if (!rawDate) return "";
    try {
      const dateObj = new Date(rawDate);
      const day = dateObj.getDate();
      // Ordinal suffixes (st, nd, rd, th)
      const j = day % 10, k = day % 100;
      let suffix = "th";
      if (j === 1 && k !== 11) suffix = "st";
      else if (j === 2 && k !== 12) suffix = "nd";
      else if (j === 3 && k !== 13) suffix = "rd";

      const formattedMonth = dateObj.toLocaleDateString("en-IN", { month: "long" });
      const year = dateObj.getFullYear();
      return `${day}${suffix} ${formattedMonth}, ${year}`;
    } catch (e) {
      return `${rawDate}`;
    }
  };

  // Synchronized dynamic field helper
  const placeAndDateVal = getPlaceAndDateStr();

  // A. Load saved configurations on mount
  useEffect(() => {
    // 1. First load from LocalStorage cache for fast load time
    try {
      const storedDrafts = localStorage.getItem("e_office_assistant_drafts");
      if (storedDrafts) setSavedDrafts(JSON.parse(storedDrafts));

      const storedTypes = localStorage.getItem("e_office_letter_types");
      if (storedTypes) setLetterTypes(JSON.parse(storedTypes));

      const storedTones = localStorage.getItem("e_office_letter_tones");
      if (storedTones) setTones(JSON.parse(storedTones));

      const storedCopyPresets = localStorage.getItem("e_office_copy_presets");
      if (storedCopyPresets) setCopyPresets(JSON.parse(storedCopyPresets));

      const storedToAddresses = localStorage.getItem("e_office_to_addresses");
      if (storedToAddresses) setToAddresses(JSON.parse(storedToAddresses));

      const storedMargins = localStorage.getItem("e_office_page_margins");
      if (storedMargins) setMargins(JSON.parse(storedMargins));
    } catch (e) {
      console.error("Failed to load local settings cache:", e);
    }

    // 2. Fetch fresh data from Supabase and sync
    const loadFromSupabase = async () => {
      try {
        const prefRes = await fetch("/api/e-office/preferences");
        const prefData = await prefRes.json();
        if (prefData.success && prefData.preferences) {
          const prefs = prefData.preferences;
          if (prefs.letter_types) {
            setLetterTypes(prefs.letter_types);
            localStorage.setItem("e_office_letter_types", JSON.stringify(prefs.letter_types));
          }
          if (prefs.tones) {
            setTones(prefs.tones);
            localStorage.setItem("e_office_letter_tones", JSON.stringify(prefs.tones));
          }
          if (prefs.copy_presets) {
            setCopyPresets(prefs.copy_presets);
            localStorage.setItem("e_office_copy_presets", JSON.stringify(prefs.copy_presets));
          }
          if (prefs.to_addresses) {
            setToAddresses(prefs.to_addresses);
            localStorage.setItem("e_office_to_addresses", JSON.stringify(prefs.to_addresses));
          }
          if (prefs.margins) {
            setMargins(prefs.margins);
            localStorage.setItem("e_office_page_margins", JSON.stringify(prefs.margins));
          }
          // Load persisted header logo from Supabase
          if (prefs.header_logo) {
            setHeaderLogoState(prefs.header_logo);
            localStorage.setItem("e_office_header_logo", prefs.header_logo);
          }
        }

        const histRes = await fetch("/api/e-office/history");
        const histData = await histRes.json();
        if (histData.success && histData.drafts) {
          setSavedDrafts(histData.drafts);
          localStorage.setItem("e_office_assistant_drafts", JSON.stringify(histData.drafts));
        }
      } catch (err) {
        console.error("Failed to sync with Supabase on mount:", err);
      }
    };

    loadFromSupabase();
  }, []);

  const saveDraftsToLocal = (newDrafts) => {
    setSavedDrafts(newDrafts);
    localStorage.setItem("e_office_assistant_drafts", JSON.stringify(newDrafts));
  };

  // B. Option Manager Helpers
  const addLetterType = () => {
    if (!newTypeInput.trim()) return;
    const updated = [...letterTypes, newTypeInput.trim()];
    setLetterTypes(updated);
    localStorage.setItem("e_office_letter_types", JSON.stringify(updated));
    setNewTypeInput("");
    syncPreferencesToSupabase({ letterTypes: updated });
  };

  const deleteLetterType = (idx) => {
    const updated = letterTypes.filter((_, i) => i !== idx);
    setLetterTypes(updated);
    localStorage.setItem("e_office_letter_types", JSON.stringify(updated));
    if (letterType === letterTypes[idx]) {
      setLetterType(updated[0] || "");
    }
    syncPreferencesToSupabase({ letterTypes: updated });
  };

  const addTone = () => {
    if (!newToneInput.trim()) return;
    const updated = [...tones, newToneInput.trim()];
    setTones(updated);
    localStorage.setItem("e_office_letter_tones", JSON.stringify(updated));
    setNewToneInput("");
    syncPreferencesToSupabase({ tones: updated });
  };

  const deleteTone = (idx) => {
    const updated = tones.filter((_, i) => i !== idx);
    setTones(updated);
    localStorage.setItem("e_office_letter_tones", JSON.stringify(updated));
    if (tone === tones[idx]) {
      setTone(updated[0] || "");
    }
    syncPreferencesToSupabase({ tones: updated });
  };

  const addCopyPreset = () => {
    if (!newCopyPresetInput.trim()) return;
    const updated = [...copyPresets, newCopyPresetInput.trim()];
    setCopyPresets(updated);
    localStorage.setItem("e_office_copy_presets", JSON.stringify(updated));
    setNewCopyPresetInput("");
    syncPreferencesToSupabase({ copyPresets: updated });
  };

  const deleteCopyPreset = (idx) => {
    const updated = copyPresets.filter((_, i) => i !== idx);
    setCopyPresets(updated);
    localStorage.setItem("e_office_copy_presets", JSON.stringify(updated));
    syncPreferencesToSupabase({ copyPresets: updated });
  };

  const addToAddress = () => {
    if (!newToInput.trim()) return;
    const updated = [...toAddresses, newToInput.trim()];
    setToAddresses(updated);
    localStorage.setItem("e_office_to_addresses", JSON.stringify(updated));
    setNewToInput("");
    syncPreferencesToSupabase({ toAddresses: updated });
  };

  const deleteToAddress = (idx) => {
    const updated = toAddresses.filter((_, i) => i !== idx);
    setToAddresses(updated);
    localStorage.setItem("e_office_to_addresses", JSON.stringify(updated));
    syncPreferencesToSupabase({ toAddresses: updated });
  };

  const saveOptionEdit = (idx, kind) => {
    if (!editingValue.trim()) return;
    if (kind === "types") {
      const updated = [...letterTypes];
      updated[idx] = editingValue.trim();
      setLetterTypes(updated);
      localStorage.setItem("e_office_letter_types", JSON.stringify(updated));
      syncPreferencesToSupabase({ letterTypes: updated });
    } else if (kind === "tones") {
      const updated = [...tones];
      updated[idx] = editingValue.trim();
      setTones(updated);
      localStorage.setItem("e_office_letter_tones", JSON.stringify(updated));
      syncPreferencesToSupabase({ tones: updated });
    } else if (kind === "copy") {
      const updated = [...copyPresets];
      updated[idx] = editingValue.trim();
      setCopyPresets(updated);
      localStorage.setItem("e_office_copy_presets", JSON.stringify(updated));
      syncPreferencesToSupabase({ copyPresets: updated });
    } else if (kind === "to") {
      const updated = [...toAddresses];
      updated[idx] = editingValue.trim();
      setToAddresses(updated);
      localStorage.setItem("e_office_to_addresses", JSON.stringify(updated));
      syncPreferencesToSupabase({ toAddresses: updated });
    }
    setEditingIndex(-1);
    setEditingValue("");
  };

  // C. API Handlers
  const handleGenerate = async () => {
    if (mode === "draft" && !topic.trim()) {
      alert("Please describe the Topic / Context so AI can draft the letter.");
      return;
    }
    if (mode === "reply" && !replyNotes.trim()) {
      alert("Please enter Response Guidelines to compile a reply.");
      return;
    }

    setIsGenerating(true);
    try {
      if (mode === "draft") {
        const response = await fetch("/api/letters/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context: topic,
            tone,
            letterType,
          }),
        });

        const data = await response.json();
        if (data.success && data.draft) {
          const letter = data.draft;
          // Dynamically map Gemini's structured fields
          if (letter.letterhead) setLetterhead(letter.letterhead);
          if (letter.memoNumber) setMemoNumber(letter.memoNumber);
          if (letter.placeAndDate) {
            // Split or place directly
            const parts = letter.placeAndDate.split(",");
            if (parts.length > 0) setRawPlace(parts[0].trim());
          }
          if (letter.toBlock) setToBlock(letter.toBlock);
          if (letter.subject) setSubject(letter.subject);
          if (letter.reference) setReference(letter.reference);
          if (letter.salutation) setSalutation(letter.salutation);
          if (letter.body) setLetterBody(letter.body);
          if (letter.signatureBlock || letter.fromBlock) {
            const combined = letter.signatureBlock || letter.fromBlock;
            setFromBlock(combined);
            setSignatureBlock(combined);
          }
          if (letter.enclosures) setEnclosures(letter.enclosures);
          if (letter.copyTo) setCopyTo(letter.copyTo);
        } else {
          throw new Error(data.error || "Generation returned invalid schema.");
        }
      } else {
        const formData = new FormData();
        formData.append("responsePoints", replyNotes);
        formData.append("tone", tone);

        if (uploadedFile) {
          formData.append("incomingLetterFile", uploadedFile);
        } else {
          formData.append("incomingLetterText", "Reference points to reply.");
        }

        const response = await fetch("/api/letters/reply", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.success && data.reply) {
          const letter = data.reply;
          if (letter.letterhead) setLetterhead(letter.letterhead);
          if (letter.memoNumber) setMemoNumber(letter.memoNumber);
          if (letter.placeAndDate) {
            const parts = letter.placeAndDate.split(",");
            if (parts.length > 0) setRawPlace(parts[0].trim());
          }
          if (letter.toBlock) setToBlock(letter.toBlock);
          if (letter.subject) setSubject(letter.subject);
          if (letter.reference) setReference(letter.reference);
          if (letter.salutation) setSalutation(letter.salutation);
          if (letter.body) setLetterBody(letter.body);
          if (letter.signatureBlock || letter.fromBlock) {
            const combined = letter.signatureBlock || letter.fromBlock;
            setFromBlock(combined);
            setSignatureBlock(combined);
          }
          if (letter.enclosures) setEnclosures(letter.enclosures);
          if (letter.copyTo) setCopyTo(letter.copyTo);
        } else {
          throw new Error(data.error || "Generation returned invalid reply schema.");
        }
      }
    } catch (error) {
      console.error("Draft generation failed:", error);
      alert(`API Error: ${error.message || "Failed to communicate with service."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    alert("Canvas successfully copied to system clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDraft = async () => {
    const newDraft = {
      id: Date.now().toString(),
      subject: mode === "draft" ? subject : "Reply: " + (uploadedFile?.name || "Uploaded Letter"),
      documentType: letterType || "Memo",
      tone,
      content: letterContent,
      date: new Date().toISOString(),
      mode,
    };

    const updated = [newDraft, ...savedDrafts];
    saveDraftsToLocal(updated);

    try {
      const res = await fetch("/api/e-office/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDraft)
      });
      const data = await res.json();
      if (data.success) {
        alert("Draft successfully archived to Supabase database!");
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error("Failed to sync draft to Supabase:", e);
      alert("Draft archived locally, but Supabase sync failed. Verify network.");
    }
  };

  const handleLoadDraft = (draft) => {
    // Attempt parsing in case content is raw text
    setLetterContent(draft.content);
    setSubject(draft.subject);
    setLetterType(draft.documentType || "Memo");
    setTone(draft.tone || "Formal");
    setMode(draft.mode || "draft");
    setActiveTab("drafting");
    setHistoryOpen(false);
  };

  const handleDeleteDraft = async (id) => {
    if (confirm("Are you sure you want to delete this draft from history?")) {
      const updated = savedDrafts.filter((d) => d.id !== id);
      saveDraftsToLocal(updated);

      try {
        const res = await fetch(`/api/e-office/history/${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          console.log("Draft deleted from Supabase.");
        } else {
          console.warn("Failed to delete from Supabase:", data.error);
        }
      } catch (e) {
        console.error("Failed to delete draft from Supabase:", e);
      }
    }
  };


  const runApiDiagnostics = async () => {
    setDiagnosticsStatus("testing");
    try {
      const response = await fetch("/api/status");
      const data = await response.json();
      if (data.status === "healthy" && data.geminiKeyConfigured) {
        setDiagnosticsStatus("success");
        setDiagnosticsInfo(data);
      } else {
        setDiagnosticsStatus("error");
        setDiagnosticsInfo(data);
      }
    } catch (e) {
      setDiagnosticsStatus("error");
      setDiagnosticsInfo({ message: "Diagnostics connection failed." });
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. OUTTERMOST PRIMARY SIDEBAR */}
      <div className="w-16 lg:w-20 bg-slate-950 text-slate-400 flex flex-col items-center py-6 shrink-0 h-full border-r border-slate-900 justify-between select-none print:hidden">
        
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          {/* Navigation Item Stack */}
          <nav className="flex flex-col items-center gap-4 w-full px-2 mt-4">
            <button
              onClick={() => setActiveTab("drafting")}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeTab === "drafting"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                  : "hover:bg-slate-900 hover:text-indigo-400"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="text-[8px] font-bold mt-0.5 uppercase">Draft</span>
            </button>
          </nav>
        </div>

        {/* BOTTOM USER PANEL (PDO CIRCLE BUTTON) */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 via-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black ring-2 ring-slate-800 tracking-wider shadow-md hover:scale-105 hover:ring-indigo-400 transition-all cursor-pointer"
            title="User Customization Panel (PDO)"
          >
            PDO
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE PANEL */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        
        {activeTab === "drafting" && (
          <>
            <LeftInputPane
              width={leftWidth}
              letterTypes={letterTypes}
              tones={tones}
              copyPresets={copyPresets}
              toAddresses={toAddresses}
              mode={mode}
              setMode={setMode}
              letterType={letterType}
              setLetterType={setLetterType}
              tone={tone}
              setTone={setTone}
              replyNotes={replyNotes}
              setReplyNotes={setReplyNotes}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}

              // One-click AI topic
              topic={topic}
              setTopic={setTopic}
              
              // Custom logo
              headerLogo={headerLogo}
              setHeaderLogo={setHeaderLogo}
              
              // 12 properties mapping
              letterhead={letterhead}
              setLetterhead={setLetterhead}
              memoNumber={memoNumber}
              setMemoNumber={setMemoNumber}
              placeAndDate={placeAndDateVal}
              setPlaceAndDate={() => {}} // calculated dynamically
              fromBlock={fromBlock}
              setFromBlock={setFromBlock}
              toBlock={toBlock}
              setToBlock={setToBlock}
              subject={subject}
              setSubject={setSubject}
              reference={reference}
              setReference={setReference}
              salutation={salutation}
              setSalutation={setSalutation}
              letterBody={letterBody}
              setLetterBody={setLetterBody}
              signatureBlock={signatureBlock}
              setSignatureBlock={setSignatureBlock}
              enclosures={enclosures}
              setEnclosures={setEnclosures}
              copyTo={copyTo}
              setCopyTo={setCopyTo}

              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />

            {/* Horizontal Resize Grab-Handle Divider */}
            <div
              onMouseDown={startResizing}
              className={`hidden lg:flex w-1 bg-slate-200/80 hover:bg-indigo-500 cursor-col-resize select-none h-full transition-all shrink-0 relative items-center justify-center group ${
                isResizing ? "bg-indigo-600 w-1.5" : ""
              }`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-50 group-hover:opacity-100">
                <div className="w-[2.5px] h-3.5 bg-slate-400 group-hover:bg-indigo-200 rounded-full"></div>
                <div className="w-[2.5px] h-3.5 bg-slate-400 group-hover:bg-indigo-200 rounded-full"></div>
              </div>
            </div>

            <RightOutputPane
              margins={margins}
              handleMarginChange={updateMarginField}
              handleMarginPreset={updateMarginPreset}
              headerLogo={headerLogo}
              letterhead={letterhead}
              setLetterhead={setLetterhead}
              memoNumber={memoNumber}
              setMemoNumber={setMemoNumber}
              placeAndDate={placeAndDateVal}
              setPlaceAndDate={() => {}}
              fromBlock={fromBlock}
              setFromBlock={setFromBlock}
              toBlock={toBlock}
              setToBlock={setToBlock}
              subject={subject}
              setSubject={setSubject}
              reference={reference}
              setReference={setReference}
              salutation={salutation}
              setSalutation={setSalutation}
              letterBody={letterBody}
              setLetterBody={setLetterBody}
              signatureBlock={signatureBlock}
              setSignatureBlock={setSignatureBlock}
              valediction={valediction}
              setValediction={setValediction}
              enclosures={enclosures}
              setEnclosures={setEnclosures}
              copyTo={copyTo}
              setCopyTo={setCopyTo}

              letterContent={letterContent}
              setLetterContent={setLetterContent}
              isCopied={isCopied}
              onCopy={handleCopy}
              onPrint={handlePrint}
              onSave={handleSaveDraft}
              historyOpen={historyOpen}
              setHistoryOpen={setHistoryOpen}
            />
          </>
        )}

        {/* Alternate tabs rendered in main area */}
        {activeTab === "analytics" && (
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/50">
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Performance Metrics</h2>
                <p className="text-slate-500 text-xs">Real-time indicators of artificial intelligence letter drafts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saved Archives</span>
                    <span className="text-2xl font-black text-slate-800">{savedDrafts.length}</span>
                  </div>
                  <FileText className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Health</span>
                    <span className="text-2xl font-black text-emerald-600">Online</span>
                  </div>
                  <Clock className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latency Rate</span>
                    <span className="text-2xl font-black text-slate-800">1.75s</span>
                  </div>
                  <TrendingUp className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Binding</span>
                    <span className="text-xs font-bold text-indigo-600 block uppercase">gemini-1.5-flash</span>
                  </div>
                  <Cpu className="h-6 w-6 text-violet-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/50">
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Layout Blueprints</h2>
                <p className="text-slate-500 text-xs">Standard approved correspondence formats for BDO networks.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3 shadow-sm">
                  <span className="text-xs font-extrabold text-indigo-600">01</span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Office Memorandum</h3>
                  <p className="text-[11px] text-slate-500">Internal Circular formats containing Department routing indices.</p>
                  <button onClick={() => { setLetterType("Memo"); setActiveTab("drafting"); }} className="text-xs font-bold text-indigo-600 pt-2 block hover:underline">Apply Blueprints →</button>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3 shadow-sm">
                  <span className="text-xs font-extrabold text-red-600">02</span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Show Cause Notice</h3>
                  <p className="text-[11px] text-slate-500">Official warnings outlining compliance frameworks.</p>
                  <button onClick={() => { setLetterType("Show Cause"); setActiveTab("drafting"); }} className="text-xs font-bold text-indigo-600 pt-2 block hover:underline">Apply Blueprints →</button>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-3 shadow-sm">
                  <span className="text-xs font-extrabold text-violet-600">03</span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">General Requisition</h3>
                  <p className="text-[11px] text-slate-500">Procurement requisition petitions and asset request records.</p>
                  <button onClick={() => { setLetterType("General Requisition"); setActiveTab("drafting"); }} className="text-xs font-bold text-indigo-600 pt-2 block hover:underline">Apply Blueprints →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "diagnostics" && (
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/50">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">API Diagnostics</h2>
                <p className="text-slate-500 text-xs">Verify local active environments connections.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs font-bold text-slate-700">Google Gemini-1.5-Flash Core Diagnostics</span>
                  <button onClick={runApiDiagnostics} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm">Test Binds</button>
                </div>
                {diagnosticsStatus === "success" ? (
                  <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl text-xs">Service connection fully verified! GEMINI_API_KEY is active.</div>
                ) : diagnosticsStatus === "testing" ? (
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-xs animate-pulse">Running health check queries...</div>
                ) : (
                  <div className="p-3 bg-rose-50 text-rose-950 rounded-xl text-xs">Server connection requires active env bindings. Verify key.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. PDO CUSTOMIZATION MODAL (POP-UP CONSOLE) */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-indigo-50 animate-scale">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/30 to-violet-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow">
                  PDO
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">PDO Customization Panel</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure dynamic composer dropdown selectors</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setProfileModalOpen(false);
                }}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex border-b border-slate-100 bg-slate-50/40 p-1 m-3 rounded-xl border">
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setActiveSettingsTab("types");
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSettingsTab === "types"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Letter Types
              </button>
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setActiveSettingsTab("tones");
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSettingsTab === "tones"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tones
              </button>
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setActiveSettingsTab("copy");
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSettingsTab === "copy"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Copy Forward To
              </button>

              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setActiveSettingsTab("to");
                }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSettingsTab === "to"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                To Addresses
              </button>
            </div>

            {/* Modal Content Scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {activeSettingsTab === "types" ? (
                /* TAB A: LETTER TYPES OPTIONS MANAGEMENT */
                <div className="space-y-4">
                  {/* Add Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTypeInput}
                      onChange={(e) => setNewTypeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addLetterType()}
                      placeholder="Add custom letter type (e.g. Circular, Order)..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={addLetterType}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>

                  {/* List items */}
                  <div className="space-y-2">
                    {letterTypes.map((type, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50/10 group"
                      >
                        {editingIndex === idx ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="flex-1 px-2 py-1 border border-indigo-400 rounded-lg text-xs bg-white focus:outline-none"
                            />
                            <button
                              onClick={() => saveOptionEdit(idx, "types")}
                              className="p-1 text-emerald-600 bg-emerald-50 rounded"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-700">{type}</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditingValue(type);
                            }}
                            className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-indigo-300 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteLetterType(idx)}
                            className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-rose-300 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSettingsTab === "tones" ? (
                /* TAB B: TONES OPTIONS MANAGEMENT */
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newToneInput}
                      onChange={(e) => setNewToneInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTone()}
                      placeholder="Add custom tone (e.g. Cordial, Advisory)..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={addTone}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tones.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50/10 group"
                      >
                        {editingIndex === idx ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="flex-1 px-2 py-1 border border-indigo-400 rounded-lg text-xs bg-white focus:outline-none"
                            />
                            <button
                              onClick={() => saveOptionEdit(idx, "tones")}
                              className="p-1 text-emerald-600 bg-emerald-50 rounded"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-700">{t}</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditingValue(t);
                            }}
                            className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-indigo-300 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteTone(idx)}
                            className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-rose-300 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSettingsTab === "copy" ? (
                /* TAB C: COPY FORWARD PRESETS MANAGEMENT */
                <div className="space-y-4">
                  {/* Add Input */}
                  <div className="flex flex-col gap-2 bg-indigo-50/15 p-3 rounded-xl border border-indigo-50/60">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">New Copy Distribution Set (Separate recipients with Newlines)</label>
                    <textarea
                      value={newCopyPresetInput}
                      onChange={(e) => setNewCopyPresetInput(e.target.value)}
                      rows="3"
                      placeholder="e.g.&#10;1. The Sub-Divisional Officer for information.&#10;2. The Officer-in-Charge, Election Section."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700 leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={addCopyPreset}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Preset
                      </button>
                    </div>
                  </div>

                  {/* List items */}
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {(copyPresets || []).map((preset, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50/10 group space-y-2 relative"
                      >
                        {editingIndex === idx ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              rows="3"
                              className="w-full px-2 py-1.5 border border-indigo-400 rounded-lg text-xs bg-white focus:outline-none font-medium leading-relaxed"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingIndex(-1)}
                                className="px-2 py-1 text-slate-500 bg-slate-100 rounded text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveOptionEdit(idx, "copy")}
                                className="px-2.5 py-1 text-emerald-600 bg-emerald-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Check className="h-3 w-3" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-medium text-slate-700 whitespace-pre-line leading-relaxed pr-16">
                              {preset}
                            </div>
                            <div className="absolute right-3 top-3 flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingIndex(idx);
                                  setEditingValue(preset);
                                }}
                                className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-indigo-300 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit Preset"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteCopyPreset(idx)}
                                className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-rose-300 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Preset"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* TAB E: TO ADDRESSES MANAGEMENT */
                <div className="space-y-4">
                  {/* Add Input */}
                  <div className="flex flex-col gap-2 bg-indigo-50/15 p-3 rounded-xl border border-indigo-50/60">
                    <label className="text-[10px] font-bold text-slate-550 uppercase">New Recipient "To" Address (Separate lines with Newlines)</label>
                    <textarea
                      value={newToInput}
                      onChange={(e) => setNewToInput(e.target.value)}
                      rows="3"
                      placeholder="e.g.&#10;The District Magistrate,&#10;Malda."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700 leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={addToAddress}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add "To" Address
                      </button>
                    </div>
                  </div>

                  {/* List items */}
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {(toAddresses || []).map((addr, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50/10 group space-y-2 relative"
                      >
                        {editingIndex === idx ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              rows="3"
                              className="w-full px-2 py-1.5 border border-indigo-400 rounded-lg text-xs bg-white focus:outline-none font-medium leading-relaxed"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingIndex(-1)}
                                className="px-2 py-1 text-slate-500 bg-slate-100 rounded text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveOptionEdit(idx, "to")}
                                className="px-2.5 py-1 text-emerald-600 bg-emerald-50 rounded text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Check className="h-3 w-3" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs font-medium text-slate-700 whitespace-pre-line leading-relaxed pr-16">
                              {addr}
                            </div>
                            <div className="absolute right-3 top-3 flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingIndex(idx);
                                  setEditingValue(addr);
                                }}
                                className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-indigo-300 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit Recipient"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteToAddress(idx)}
                                className="p-1 bg-white border border-slate-200/80 rounded-lg hover:border-rose-300 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Recipient"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/60">
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setProfileModalOpen(false);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow"
              >
                Save & Apply Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Slide-out Archive Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        drafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
}
