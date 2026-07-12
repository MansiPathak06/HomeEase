"use client";
/**
 * /app/(pages)/book-service/page.jsx
 *
 * NEW Rapido-style booking page.
 * User selects service → fills form → system finds vendor automatically.
 * Existing /userdashboard/book page (direct vendor booking) is UNTOUCHED.
 */
import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ChevronRight, MapPin, IndianRupee,
  Clock, FileText, CheckCircle, Search, Loader2,
  Bell, X, Phone, AlertCircle, RefreshCw
} from "lucide-react";
import { io as socketIO } from "socket.io-client";

// ── Constants ────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL;
const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "")
  .replace("/api", "")
  .replace("https://", "wss://")
  .replace("http://", "ws://");

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "")
  .replace("/api", "");

const TIME_SLOTS = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00",
];

const SERVICE_CATEGORIES = [
  "Electrician","Plumber","AC Repair","Carpenter",
  "Painter","Cleaning","Pest Control","CCTV Installation",
  "Appliance Repair","Gardening","Home Shifting","Water Purifier",
];

const today = new Date().toISOString().split("T")[0];

// ── Styles (matching existing app theme) ─────────────────────
const S = {
  wrap:    { minHeight:"100vh", paddingTop:80, background:"#111111", fontFamily:"system-ui,sans-serif" },
  inner:   { maxWidth:580, margin:"0 auto", padding:"32px 20px 80px" },
  section: { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:16, padding:24, marginBottom:16 },
  label:   { display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#666", marginBottom:8 },
  input:   { width:"100%", padding:"12px 14px", background:"#111", border:"1px solid #2a2a2a", borderRadius:10, color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  textarea:{ width:"100%", padding:"12px 14px", background:"#111", border:"1px solid #2a2a2a", borderRadius:10, color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", resize:"none", boxSizing:"border-box" },
  btnPrimary:{ width:"100%", padding:"14px 0", background:"#8B0000", border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  btnGhost: { flex:1, padding:"12px 0", background:"transparent", border:"1px solid #2a2a2a", borderRadius:10, color:"#888", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  pill:    { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:700 },
};

// ── Step indicator ────────────────────────────────────────────
function StepDots({ step, total }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height:6, borderRadius:3,
          width: step === i+1 ? 20 : 6,
          background: step > i ? "#8B0000" : step === i+1 ? "#CC0000" : "#2a2a2a",
          transition:"all 0.2s",
        }}/>
      ))}
      <span style={{ fontSize:12, color:"#555", marginLeft:4 }}>Step {step} of {total}</span>
    </div>
  );
}

// ── Service chip ──────────────────────────────────────────────
function ServiceChip({ name, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 14px", borderRadius:10, fontSize:13, fontWeight:600,
      border:`1.5px solid ${selected ? "#8B0000" : "#2a2a2a"}`,
      background: selected ? "#2a0000" : "#111",
      color: selected ? "#CC0000" : "#888",
      cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
    }}>
      {name}
    </button>
  );
}

// ── "Finding vendor" waiting screen ──────────────────────────
function FindingVendorScreen({ bookingId, expiresAt, onConfirmed, onExpired, onSlotSuggested }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!expiresAt) return 600;
    return Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  });

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2,"0");
  const secs = String(secondsLeft % 60).padStart(2,"0");
  const pct  = expiresAt
    ? (secondsLeft / Math.floor((new Date(expiresAt) - Date.now() + secondsLeft*1000) / 1000)) * 100
    : (secondsLeft / 600) * 100;

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => {
      if (s <= 1) { clearInterval(t); onExpired(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ textAlign:"center", padding:"40px 0" }}>
      {/* Pulsing circle */}
      <div style={{ position:"relative", width:120, height:120, margin:"0 auto 28px" }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:"2px solid #8B0000", opacity:0.3,
          animation:"ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
        }}/>
        <div style={{
          position:"absolute", inset:8, borderRadius:"50%",
          border:"2px solid #8B0000", opacity:0.5,
          animation:"ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
          animationDelay:"0.5s",
        }}/>
        <div style={{
          position:"absolute", inset:16, borderRadius:"50%",
          background:"#2a0000", border:"1px solid #8B0000",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Search style={{ width:28, height:28, color:"#CC0000" }}/>
        </div>
      </div>

      <h2 style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:8 }}>
        Finding you a vendor…
      </h2>
      <p style={{ fontSize:13, color:"#666", marginBottom:24, lineHeight:1.6 }}>
        We're notifying all available vendors nearby.<br/>
        First one to accept gets assigned to you.
      </p>

      {/* Countdown */}
      <div style={{
        background:"#1a1a1a", border:"1px solid #2a2a2a",
        borderRadius:12, padding:"16px 24px", marginBottom:24,
        display:"inline-block",
      }}>
        <div style={{ fontSize:32, fontWeight:800, color:"#CC0000", fontVariantNumeric:"tabular-nums" }}>
          {mins}:{secs}
        </div>
        <div style={{ fontSize:11, color:"#555", marginTop:4 }}>time remaining</div>
      </div>

      {/* Progress bar */}
      <div style={{ height:4, background:"#2a2a2a", borderRadius:4, marginBottom:24, overflow:"hidden" }}>
        <div style={{
          height:"100%", background:"#8B0000", borderRadius:4,
          width:`${Math.min(100, pct)}%`, transition:"width 1s linear",
        }}/>
      </div>

      {/* Status dots */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
        {[
          { label:"Request broadcasted to vendors", done:true },
          { label:"Waiting for vendor acceptance",  done:false, active:true },
          { label:"Vendor confirmed & assigned",    done:false },
        ].map(({ label, done, active }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:16, height:16, borderRadius:"50%", flexShrink:0,
              background: done ? "#8B0000" : active ? "#2a0000" : "#1a1a1a",
              border: done ? "none" : `1.5px solid ${active ? "#8B0000" : "#2a2a2a"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {done && <CheckCircle style={{ width:10, height:10, color:"#fff" }}/>}
              {active && <div style={{ width:6, height:6, borderRadius:"50%", background:"#CC0000", animation:"pulse 1s infinite" }}/>}
            </div>
            <span style={{ fontSize:13, color: done ? "#fff" : active ? "#CC0000" : "#444" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ping { 75%,100% { transform:scale(1.5); opacity:0 } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

// ── Vendor confirmed screen ───────────────────────────────────
function VendorConfirmedScreen({ vendor, booking, onDashboard }) {
  return (
    <div style={{ textAlign:"center", padding:"32px 0" }}>
      <div style={{
        width:72, height:72, borderRadius:"50%", background:"#052E16",
        border:"2px solid #059669", margin:"0 auto 20px",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <CheckCircle style={{ width:36, height:36, color:"#4ADE80" }}/>
      </div>

      <h2 style={{ fontSize:22, fontWeight:700, color:"#fff", marginBottom:6 }}>
        Vendor Found!
      </h2>
      <p style={{ fontSize:13, color:"#666", marginBottom:24 }}>
        A vendor has accepted your request
      </p>

      {vendor && (
        <div style={{
          background:"#1a1a1a", border:"1px solid #2a2a2a",
          borderRadius:14, padding:20, textAlign:"left", marginBottom:20,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{
              width:44, height:44, borderRadius:10, background:"#2a0000",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, fontWeight:700, color:"#CC0000",
            }}>
              {(vendor.vendorName || "V").slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{vendor.vendorName}</div>
              <div style={{ fontSize:12, color:"#666" }}>{vendor.serviceCategory}</div>
            </div>
          </div>

          {[
            ["📅 Date",    booking?.date],
            ["🕐 Time",    booking?.time],
            ["📍 City",    vendor.vendorCity],
            ["💰 Advance", "₹99 (visitation charge)"],
          ].filter(([,v]) => v).map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
              <span style={{ color:"#666" }}>{k}</span>
              <span style={{ color:"#fff", fontWeight:600 }}>{v}</span>
            </div>
          ))}

          {vendor.vendorPhone && (
            <a href={`tel:${vendor.vendorPhone}`} style={{
              display:"flex", alignItems:"center", gap:6, marginTop:12,
              padding:"8px 14px", background:"#8B0000", borderRadius:8,
              color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700,
              justifyContent:"center",
            }}>
              <Phone style={{ width:14, height:14 }}/> Call Vendor
            </a>
          )}
        </div>
      )}

      <div style={{ fontSize:12, color:"#666", marginBottom:20, background:"#1a1a1a", borderRadius:10, padding:12 }}>
        ℹ️ Existing flow continues: Vendor will visit, charge ₹99, assess the work, then send you a quote.
      </div>

      <button onClick={onDashboard} style={{ ...S.btnPrimary, background:"#059669" }}>
        Go to My Bookings
      </button>
    </div>
  );
}

// ── Slot negotiation screen ───────────────────────────────────
function SlotSuggestionScreen({ suggestion, bookingId, token, onAccepted, onRejected }) {
  const [loading, setLoading] = useState(false);

  const respond = async (accept) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/user/booking/${bookingId}/respond-slot`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ accept }),
      });
      const data = await res.json();
      if (data.success) { accept ? onAccepted(data) : onRejected(data); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{
        background:"#1A1400", border:"1px solid #3A2800",
        borderRadius:14, padding:20, marginBottom:20,
      }}>
        <div style={{ fontSize:12, color:"#FCD34D", fontWeight:700, marginBottom:12 }}>
          ⏰ Vendor Suggested a Different Time
        </div>
        <div style={{ fontSize:14, color:"#fff", marginBottom:16 }}>
          <strong>{suggestion.vendorName}</strong> can't make it at your requested time, but is available at:
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <div style={{ background:"#111", borderRadius:8, padding:12 }}>
            <div style={{ fontSize:10, color:"#666", marginBottom:4 }}>REQUESTED</div>
            <div style={{ fontSize:14, color:"#888", textDecoration:"line-through" }}>
              {suggestion.originalDate} {suggestion.originalTime}
            </div>
          </div>
          <div style={{ background:"#0D2410", border:"1px solid #1A4020", borderRadius:8, padding:12 }}>
            <div style={{ fontSize:10, color:"#4ADE80", marginBottom:4 }}>SUGGESTED</div>
            <div style={{ fontSize:14, color:"#fff", fontWeight:700 }}>
              {suggestion.suggestedDate} {suggestion.suggestedTime}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={() => respond(false)} disabled={loading} style={{
          ...S.btnGhost, flex:1,
        }}>
          ✗ Decline
        </button>
        <button onClick={() => respond(true)} disabled={loading} style={{
          flex:2, padding:"12px 0", background:"#059669", border:"none",
          borderRadius:10, color:"#fff", fontSize:14, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit", display:"flex",
          alignItems:"center", justifyContent:"center", gap:6,
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? <Loader2 style={{ width:16, height:16, animation:"spin 1s linear infinite" }}/> : null}
          ✓ Accept New Time
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════
function BookServicePageContent() {
  const router      = useRouter();
  const searchParams = useSearchParams ? useSearchParams() : null;

  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState({
    serviceName     : searchParams?.get("service") || "",
    serviceCategory : searchParams?.get("service") || "",
    issueDescription: "",
    date            : "",
    time            : "",
    budget          : "",
    address         : "",
    notes           : "",
  });

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Post-submit states
  const [phase, setPhase]           = useState("form");  // form | finding | confirmed | expired | slot_suggestion
  const [bookingId, setBookingId]   = useState(null);
  const [expiresAt, setExpiresAt]   = useState(null);
  const [confirmedVendor, setConfirmedVendor] = useState(null);
  const [slotSuggestion, setSlotSuggestion]   = useState(null);

  const socketRef = useRef(null);
  const token     = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId    = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) { router.push("/login"); }
  }, []);

  // ── Socket.io connection — only after booking is submitted ──
  useEffect(() => {
    if (!bookingId || !userId) return;

    const socket = socketIO(SOCKET_URL, {
      path        : "/socket.io",
      auth        : { token },
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user:join", { userId });
      console.log("🔌 Socket connected, joined user:", userId);
    });

    // Vendor accepted — booking confirmed
    socket.on("booking:confirmed", (data) => {
      if (data.bookingId !== bookingId) return;
      setConfirmedVendor(data);
      setPhase("confirmed");
      socket.disconnect();
    });

    // Vendor suggested a different time
    socket.on("slot:suggested", (data) => {
      if (data.bookingId !== bookingId) return;
      setSlotSuggestion(data);
      setPhase("slot_suggestion");
    });

    // Booking expired — no vendor accepted in time
    socket.on("booking:expired", (data) => {
      if (data.bookingId !== bookingId) return;
      setPhase("expired");
      socket.disconnect();
    });

    return () => { socket.disconnect(); };
  }, [bookingId, userId]);

  // ── Form helpers ────────────────────────────────────────────
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const formatTime = (t) => {
    const [h, m] = t.split(":");
    const hour   = parseInt(h);
    const ampm   = hour >= 12 ? "PM" : "AM";
    const h12    = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${h12}:${m} ${ampm}`;
  };

  // ── Submit request ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.serviceName || !form.date || !form.time || !form.budget) {
      setError("Please fill all required fields."); return;
    }
    if (isNaN(form.budget) || Number(form.budget) <= 0) {
      setError("Please enter a valid budget."); return;
    }

    setLoading(true); setError("");

    try {
      const res = await fetch(`${API}/user/booking/broadcast-request`, {
        method : "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body   : JSON.stringify({
          service_name     : form.serviceName,
          service_category : form.serviceCategory || form.serviceName,
          issue_description: form.issueDescription,
          date             : form.date,
          time             : form.time,
          budget           : Number(form.budget),
          address          : form.address,
          notes            : form.notes,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to submit request."); return;
      }

      setBookingId(data.bookingId);
      setExpiresAt(data.expiresAt);

      if (data.noVendors) {
        setError("No vendors available right now. Please try a different time slot.");
        return;
      }

      setPhase("finding");

    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render phases ───────────────────────────────────────────

  if (phase === "finding") {
    return (
      <div style={S.wrap}>
        <div style={S.inner}>
          <div style={S.section}>
            <FindingVendorScreen
              bookingId={bookingId}
              expiresAt={expiresAt}
              onConfirmed={(v) => { setConfirmedVendor(v); setPhase("confirmed"); }}
              onExpired={() => setPhase("expired")}
              onSlotSuggested={(s) => { setSlotSuggestion(s); setPhase("slot_suggestion"); }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "confirmed") {
    return (
      <div style={S.wrap}>
        <div style={S.inner}>
          <div style={S.section}>
            <VendorConfirmedScreen
              vendor={confirmedVendor}
              booking={{ date: form.date, time: form.time }}
              onDashboard={() => router.push("/userdashboard")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div style={S.wrap}>
        <div style={S.inner}>
          <div style={S.section}>
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <Clock style={{ width:48, height:48, color:"#666", margin:"0 auto 16px" }}/>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:8 }}>
                Request Expired
              </h2>
              <p style={{ fontSize:13, color:"#666", marginBottom:24 }}>
                No vendor accepted in time. This can happen during busy hours.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setPhase("form")} style={{ ...S.btnGhost, flex:1 }}>
                  Try Again
                </button>
                <button onClick={() => router.push("/userdashboard")} style={{ ...S.btnPrimary, flex:1 }}>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "slot_suggestion") {
    return (
      <div style={S.wrap}>
        <div style={S.inner}>
          <div style={{ ...S.section, marginBottom:0 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>
              Time Slot Suggestion
            </h2>
            <p style={{ fontSize:13, color:"#666", marginBottom:20 }}>
              A vendor responded to your request with a different time
            </p>
            <SlotSuggestionScreen
              suggestion={slotSuggestion}
              bookingId={bookingId}
              token={token}
              onAccepted={() => setPhase("confirmed")}
              onRejected={() => setPhase("finding")}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────
  return (
    <div style={S.wrap}>
      <style>{`
        input:focus, textarea:focus, select:focus { border-color:#8B0000 !important; outline:none; }
        input::placeholder, textarea::placeholder { color:#444; }
        .service-chip:hover { border-color:#8B0000 !important; color:#CC0000 !important; }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={S.inner}>
        {/* Back button */}
        <button onClick={() => router.back()} style={{
          display:"inline-flex", alignItems:"center", gap:6,
          background:"none", border:"none", cursor:"pointer",
          color:"#666", fontSize:13, marginBottom:24, padding:0,
        }}>
          <ArrowLeft style={{ width:14, height:14 }}/> Back
        </button>

        <h1 style={{ fontSize:24, fontWeight:700, color:"#fff", marginBottom:4 }}>
          Book a Service
        </h1>
        <p style={{ fontSize:13, color:"#555", marginBottom:24 }}>
          Tell us what you need — we'll find the right vendor for you automatically.
        </p>

        <StepDots step={step} total={3}/>

        {/* ── STEP 1: Service + Issue ── */}
        {step === 1 && (
          <div>
            <div style={S.section}>
              <label style={S.label}>Which service do you need? *</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
                {SERVICE_CATEGORIES.map(cat => (
                  <ServiceChip
                    key={cat} name={cat}
                    selected={form.serviceCategory === cat}
                    onClick={() => { set("serviceCategory", cat); set("serviceName", cat); }}
                  />
                ))}
              </div>
              <label style={S.label}>Or type a custom service</label>
              <input
                style={S.input}
                placeholder="e.g. Solar panel installation, swimming pool cleaning..."
                value={form.serviceName === form.serviceCategory ? "" : form.serviceName}
                onChange={e => { set("serviceName", e.target.value); set("serviceCategory", e.target.value); }}
              />
            </div>

            <div style={S.section}>
              <label style={S.label}>Describe your issue / requirement *</label>
              <textarea
                rows={4} style={S.textarea}
                placeholder="e.g. AC is not cooling, making noise. 1.5 ton split AC, 3 years old..."
                value={form.issueDescription}
                onChange={e => set("issueDescription", e.target.value)}
              />
              <div style={{ fontSize:11, color:"#444", marginTop:6 }}>
                💡 More detail = better vendor match
              </div>
            </div>

            {error && (
              <div style={{ background:"#2a0000", border:"1px solid #8B0000", borderRadius:10, padding:12, fontSize:13, color:"#FF6B6B", marginBottom:16 }}>
                {error}
              </div>
            )}

            <button
              onClick={() => { if (!form.serviceName) { setError("Please select or type a service."); return; } setError(""); setStep(2); }}
              style={S.btnPrimary}
            >
              Continue <ChevronRight style={{ width:16, height:16 }}/>
            </button>
          </div>
        )}

        {/* ── STEP 2: Date, Time, Budget ── */}
        {step === 2 && (
          <div>
            <div style={S.section}>
              <label style={S.label}>Preferred Date *</label>
              <input type="date" style={{ ...S.input, marginBottom:16 }}
                min={today} value={form.date}
                onChange={e => set("date", e.target.value)}/>

              <label style={S.label}>Preferred Time *</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => set("time", t)} style={{
                    padding:"8px 4px", borderRadius:8, fontSize:12, fontWeight:600,
                    border:`1.5px solid ${form.time === t ? "#8B0000" : "#2a2a2a"}`,
                    background: form.time === t ? "#2a0000" : "#111",
                    color: form.time === t ? "#CC0000" : "#888",
                    cursor:"pointer", fontFamily:"inherit",
                  }}>
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.section}>
              <label style={S.label}>Your Budget (₹) *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#666", fontSize:16 }}>₹</span>
                <input type="number" style={{ ...S.input, paddingLeft:32 }}
                  placeholder="e.g. 500"
                  min="1" value={form.budget}
                  onChange={e => set("budget", e.target.value)}/>
              </div>
              <div style={{ fontSize:11, color:"#444", marginTop:6 }}>
                This helps vendors know if the job fits their pricing. ₹99 visitation charge applies separately.
              </div>
            </div>

            {error && (
              <div style={{ background:"#2a0000", border:"1px solid #8B0000", borderRadius:10, padding:12, fontSize:13, color:"#FF6B6B", marginBottom:16 }}>
                {error}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep(1)} style={{ ...S.btnGhost, flex:1 }}>Back</button>
              <button onClick={() => {
                if (!form.date || !form.time || !form.budget) { setError("Please fill date, time, and budget."); return; }
                setError(""); setStep(3);
              }} style={{ ...S.btnPrimary, flex:2 }}>
                Continue <ChevronRight style={{ width:16, height:16 }}/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Address + Notes + Submit ── */}
        {step === 3 && (
          <div>
            <div style={S.section}>
              <label style={S.label}>Your Address *</label>
              <textarea rows={2} style={{ ...S.textarea, marginBottom:16 }}
                placeholder="House/flat no., street, area, city..."
                value={form.address}
                onChange={e => set("address", e.target.value)}/>

              <label style={S.label}>Additional Notes (optional)</label>
              <textarea rows={2} style={S.textarea}
                placeholder="Any access instructions, preferred brands, or other details..."
                value={form.notes}
                onChange={e => set("notes", e.target.value)}/>
            </div>

            {/* Summary */}
            <div style={{ ...S.section, background:"#0D0D0D" }}>
              <div style={{ fontSize:11, color:"#555", fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>
                Request Summary
              </div>
              {[
                ["Service",  form.serviceName],
                ["Date",     form.date],
                ["Time",     form.time ? formatTime(form.time) : ""],
                ["Budget",   form.budget ? `₹${Number(form.budget).toLocaleString("en-IN")}` : ""],
              ].map(([k,v]) => v ? (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8 }}>
                  <span style={{ color:"#555" }}>{k}</span>
                  <span style={{ color:"#fff", fontWeight:600 }}>{v}</span>
                </div>
              ) : null)}
              <div style={{ borderTop:"1px solid #2a2a2a", marginTop:10, paddingTop:10, fontSize:12, color:"#555" }}>
                + ₹99 visitation charge (existing flow, unchanged)
              </div>
            </div>

            {error && (
              <div style={{ background:"#2a0000", border:"1px solid #8B0000", borderRadius:10, padding:12, fontSize:13, color:"#FF6B6B", marginBottom:16 }}>
                {error}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep(2)} style={{ ...S.btnGhost, flex:1 }}>Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...S.btnPrimary, flex:2, opacity: loading ? 0.6 : 1 }}>
                {loading
                  ? <><Loader2 style={{ width:16, height:16, animation:"spin 1s linear infinite" }}/> Submitting…</>
                  : <><Search style={{ width:16, height:16 }}/> Find Vendor</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={null}>
      <BookServicePageContent />
    </Suspense>
  );
}
