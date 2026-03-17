import { useState, useRef, useEffect, useCallback } from "react";
import { Home, Trophy, Zap, ChevronRight, Star, Award, Target, TrendingUp, X, CheckCircle, Clock, Lock, Calendar } from "lucide-react";

// ─── TIME UTILITIES ───────────────────────────────────────────────────────────
function parseMatchDateTime(dateStr, timeStr) {
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const clean = dateStr.replace(",","").split(" ");
  const [mon, day, year] = clean;
  const t = timeStr.replace(" IST","").replace(" GMT","");
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  // IST = UTC+5:30; GMT matches: subtract 0
  const isGMT = timeStr.includes("GMT");
  const offsetMin = isGMT ? 0 : -(5*60+30);
  const utcMs = Date.UTC(Number(year), months[mon], Number(day), h, m) + offsetMin * 60000;
  return new Date(utcMs);
}

function getMatchPhase(match) {
  if (match.status === "completed") return "completed";
  if (!match.home || match.home === "TBD" || !match.away || match.away === "TBD") return "tbd";
  const now = new Date();
  const start = parseMatchDateTime(match.date, match.time);
  const durH = match.type === "TEST" ? 5*24 : match.type === "ODI" ? 8 : 4;
  const end = new Date(start.getTime() + durH * 3600000);
  if (now < start) return "upcoming";
  if (now >= start && now < end) return "live";
  return "ended";
}

// ─── IPL TEAM LOGOS (SVG-based official colors + initials) ───────────────────
// Real SVG logos with official primary colours
const IPL_LOGO = {
  MI: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#004BA0"/>
      <text x="30" y="37" textAnchor="middle" fill="#D1AB3E" fontSize="18" fontWeight="900" fontFamily="Arial Black,sans-serif">MI</text>
    </svg>
  ),
  CSK: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#F9CD05"/>
      <text x="30" y="37" textAnchor="middle" fill="#0C3B7C" fontSize="16" fontWeight="900" fontFamily="Arial Black,sans-serif">CSK</text>
    </svg>
  ),
  RCB: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#EC1C24"/>
      <text x="30" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="Arial Black,sans-serif">RCB</text>
    </svg>
  ),
  KKR: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#3A225D"/>
      <text x="30" y="37" textAnchor="middle" fill="#D4A942" fontSize="16" fontWeight="900" fontFamily="Arial Black,sans-serif">KKR</text>
    </svg>
  ),
  SRH: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#F26522"/>
      <text x="30" y="37" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="900" fontFamily="Arial Black,sans-serif">SRH</text>
    </svg>
  ),
  DC: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#17479E"/>
      <text x="30" y="37" textAnchor="middle" fill="#EF1C25" fontSize="18" fontWeight="900" fontFamily="Arial Black,sans-serif">DC</text>
    </svg>
  ),
  PBKS: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#ED1B24"/>
      <text x="30" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="Arial Black,sans-serif">PBKS</text>
    </svg>
  ),
  GT: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#1C4585"/>
      <text x="30" y="37" textAnchor="middle" fill="#CBA135" fontSize="18" fontWeight="900" fontFamily="Arial Black,sans-serif">GT</text>
    </svg>
  ),
  RR: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#EA1A85"/>
      <text x="30" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="Arial Black,sans-serif">RR</text>
    </svg>
  ),
  LSG: (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="28" fill="#00A3E0"/>
      <text x="30" y="37" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="Arial Black,sans-serif">LSG</text>
    </svg>
  ),
};

// Country flag emoji map
const FLAG = {
  IND:"🇮🇳", AUS:"🇦🇺", ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", PAK:"🇵🇰", SA:"🇿🇦",  NZ:"🇳🇿",
  WI:"🏝️",  SL:"🇱🇰", AFG:"🇦🇫", IRE:"🇮🇪", SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", NAM:"🇳🇦",
  ZIM:"🇿🇼", NEP:"🇳🇵", OMA:"🇴🇲", UAE:"🇦🇪", CAN:"🇨🇦", NED:"🇳🇱",
  ITA:"🇮🇹", USA:"🇺🇸",
};

// ─── ALL TEAMS ────────────────────────────────────────────────────────────────
const TEAMS = {
  // IPL 2026
  RCB:  { name:"Royal Challengers Bengaluru", short:"RCB",  cat:"IPL", captain:"Rajat Patidar",   colors:{primary:"#EC1C24",secondary:"#D4AF37",bg:"#140000",glow:"#EC1C24"}, tagline:"Play Bold · Defending Champions 2025" },
  PBKS: { name:"Punjab Kings",                short:"PBKS", cat:"IPL", captain:"Shreyas Iyer",    colors:{primary:"#ED1B24",secondary:"#A0A0A0",bg:"#140000",glow:"#ED1B24"}, tagline:"Sher Punjab Da · 2025 Runners-Up" },
  MI:   { name:"Mumbai Indians",              short:"MI",   cat:"IPL", captain:"Hardik Pandya",   colors:{primary:"#005ECB",secondary:"#D1AB3E",bg:"#001020",glow:"#005ECB"}, tagline:"Duniya Hila Denge" },
  CSK:  { name:"Chennai Super Kings",         short:"CSK",  cat:"IPL", captain:"Ruturaj Gaikwad", colors:{primary:"#F9CD05",secondary:"#0081E9",bg:"#1A1000",glow:"#F9CD05"}, tagline:"Whistle Podu · Sanju Samson signed" },
  KKR:  { name:"Kolkata Knight Riders",       short:"KKR",  cat:"IPL", captain:"Ajinkya Rahane",  colors:{primary:"#7B3FBE",secondary:"#D4A942",bg:"#0D0018",glow:"#7B3FBE"}, tagline:"Korbo Lorbo Jeetbo" },
  SRH:  { name:"Sunrisers Hyderabad",         short:"SRH",  cat:"IPL", captain:"Pat Cummins",     colors:{primary:"#F26522",secondary:"#000000",bg:"#1A0800",glow:"#F26522"}, tagline:"Orange Army" },
  DC:   { name:"Delhi Capitals",              short:"DC",   cat:"IPL", captain:"Axar Patel",      colors:{primary:"#17479E",secondary:"#EF1C25",bg:"#000A1A",glow:"#17479E"}, tagline:"Roar Macha" },
  GT:   { name:"Gujarat Titans",              short:"GT",   cat:"IPL", captain:"Shubman Gill",    colors:{primary:"#1C4585",secondary:"#CBA135",bg:"#000B1A",glow:"#1C4585"}, tagline:"Aava De" },
  RR:   { name:"Rajasthan Royals",            short:"RR",   cat:"IPL", captain:"Riyan Parag",     colors:{primary:"#EA1A85",secondary:"#254AA5",bg:"#15000D",glow:"#EA1A85"}, tagline:"Halla Bol · Jadeja traded to CSK" },
  LSG:  { name:"Lucknow Super Giants",        short:"LSG",  cat:"IPL", captain:"Rishabh Pant",    colors:{primary:"#00A3E0",secondary:"#A72B2A",bg:"#00101A",glow:"#00A3E0"}, tagline:"Super Giants" },
  // International (T20WC 2026 teams)
  IND:  { name:"India",         short:"IND", cat:"INT", colors:{primary:"#1A56DB",secondary:"#FF9933",bg:"#00020F",glow:"#1A56DB"}, tagline:"🏆 T20 WC 2026 Champions · Men in Blue" },
  AUS:  { name:"Australia",     short:"AUS", cat:"INT", colors:{primary:"#FFD700",secondary:"#006400",bg:"#141000",glow:"#FFD700"}, tagline:"The Aussies · Knocked out by Zimbabwe!" },
  ENG:  { name:"England",       short:"ENG", cat:"INT", colors:{primary:"#C8102E",secondary:"#FFFFFF",bg:"#0A0006",glow:"#C8102E"}, tagline:"Three Lions · WC Semi-finalists" },
  PAK:  { name:"Pakistan",      short:"PAK", cat:"INT", colors:{primary:"#00A550",secondary:"#FFFFFF",bg:"#001508",glow:"#00A550"}, tagline:"Passion for Cricket · WC Super 8" },
  SA:   { name:"South Africa",  short:"SA",  cat:"INT", colors:{primary:"#007A4D",secondary:"#FFB81C",bg:"#001508",glow:"#007A4D"}, tagline:"Proteas · WC Semi-finalists" },
  NZ:   { name:"New Zealand",   short:"NZ",  cat:"INT", colors:{primary:"#999999",secondary:"#FFFFFF",bg:"#050505",glow:"#AAAAAA"}, tagline:"Black Caps · WC 2026 Finalists" },
  WI:   { name:"West Indies",   short:"WI",  cat:"INT", colors:{primary:"#CC1133",secondary:"#FFC72C",bg:"#0F0005",glow:"#CC1133"}, tagline:"Windies Pride · WC Super 8" },
  SL:   { name:"Sri Lanka",     short:"SL",  cat:"INT", colors:{primary:"#003087",secondary:"#FFD700",bg:"#000A1A",glow:"#003087"}, tagline:"Lion Hearts · WC Co-host 2026" },
  AFG:  { name:"Afghanistan",   short:"AFG", cat:"INT", colors:{primary:"#0033A0",secondary:"#009A44",bg:"#00061A",glow:"#0033A0"}, tagline:"Shaheen" },
  IRE:  { name:"Ireland",       short:"IRE", cat:"INT", colors:{primary:"#169B62",secondary:"#FFFFFF",bg:"#001508",glow:"#169B62"}, tagline:"Boys in Green" },
  SCO:  { name:"Scotland",      short:"SCO", cat:"INT", colors:{primary:"#003F8A",secondary:"#FFD700",bg:"#00061A",glow:"#003F8A"}, tagline:"Saltires · replaced Bangladesh" },
  NAM:  { name:"Namibia",       short:"NAM", cat:"INT", colors:{primary:"#009A44",secondary:"#003087",bg:"#001508",glow:"#009A44"}, tagline:"Eagles" },
  ZIM:  { name:"Zimbabwe",      short:"ZIM", cat:"INT", colors:{primary:"#EF3340",secondary:"#009A44",bg:"#140000",glow:"#EF3340"}, tagline:"Chevrons · Beat Australia at WC! 😲" },
  NEP:  { name:"Nepal",         short:"NEP", cat:"INT", colors:{primary:"#DC143C",secondary:"#003087",bg:"#100003",glow:"#DC143C"}, tagline:"Himalayan Heroes" },
  OMA:  { name:"Oman",          short:"OMA", cat:"INT", colors:{primary:"#DB4437",secondary:"#FFFFFF",bg:"#120000",glow:"#DB4437"}, tagline:"Tigers of the Gulf" },
  UAE:  { name:"UAE",           short:"UAE", cat:"INT", colors:{primary:"#00732F",secondary:"#FF0000",bg:"#001508",glow:"#00732F"}, tagline:"Desert Warriors" },
  CAN:  { name:"Canada",        short:"CAN", cat:"INT", colors:{primary:"#FF0000",secondary:"#FFFFFF",bg:"#140000",glow:"#FF0000"}, tagline:"Maple Leafs" },
  NED:  { name:"Netherlands",   short:"NED", cat:"INT", colors:{primary:"#FF6600",secondary:"#FFFFFF",bg:"#141000",glow:"#FF6600"}, tagline:"Dutch Lions" },
  ITA:  { name:"Italy",         short:"ITA", cat:"INT", colors:{primary:"#009246",secondary:"#CE2B37",bg:"#001508",glow:"#009246"}, tagline:"Azzurri · 1st ever WC!" },
  USA:  { name:"United States", short:"USA", cat:"INT", colors:{primary:"#3355AA",secondary:"#BF0A30",bg:"#00040F",glow:"#3355AA"}, tagline:"Stars & Stripes" },
};

// Team logo/flag renderer
function TeamBadge({ code, size = 44 }) {
  if (IPL_LOGO[code]) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        {IPL_LOGO[code]}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.6, flexShrink: 0 }}>
      {FLAG[code] || "🏏"}
    </div>
  );
}

// ─── MATCHES ──────────────────────────────────────────────────────────────────
const ALL_MATCHES = [
  // ══ IPL 2026 ══ (Mar 28 – May 31)
  { id:"ipl01", home:"RCB",  away:"PBKS", date:"Mar 28, 2026", time:"7:30 PM IST", venue:"M. Chinnaswamy, Bengaluru",    type:"IPL", series:"TATA IPL 2026", result:null, note:"Season opener 🎆" },
  { id:"ipl02", home:"MI",   away:"GT",   date:"Mar 29, 2026", time:"7:30 PM IST", venue:"Wankhede Stadium, Mumbai",     type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl03", home:"KKR",  away:"SRH",  date:"Mar 30, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata",        type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl04", home:"DC",   away:"LSG",  date:"Apr 1, 2026",  time:"7:30 PM IST", venue:"Arun Jaitley Stadium, Delhi",  type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl05", home:"CSK",  away:"RR",   date:"Apr 3, 2026",  time:"7:30 PM IST", venue:"MA Chidambaram, Chennai",      type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl06", home:"SRH",  away:"MI",   date:"Apr 5, 2026",  time:"3:30 PM IST", venue:"Rajiv Gandhi Stadium, Hyd",    type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl07", home:"GT",   away:"PBKS", date:"Apr 6, 2026",  time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad",     type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl08", home:"RR",   away:"KKR",  date:"Apr 8, 2026",  time:"7:30 PM IST", venue:"Sawai Mansingh, Jaipur",       type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl09", home:"RCB",  away:"DC",   date:"Apr 10, 2026", time:"7:30 PM IST", venue:"M. Chinnaswamy, Bengaluru",    type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl10", home:"LSG",  away:"CSK",  date:"Apr 12, 2026", time:"3:30 PM IST", venue:"BRSABV Ekana, Lucknow",        type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl11", home:"MI",   away:"KKR",  date:"Apr 14, 2026", time:"7:30 PM IST", venue:"Wankhede Stadium, Mumbai",     type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl12", home:"PBKS", away:"SRH",  date:"Apr 16, 2026", time:"7:30 PM IST", venue:"Mullanpur Stadium, Chandigarh",type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl13", home:"CSK",  away:"RCB",  date:"Apr 18, 2026", time:"7:30 PM IST", venue:"MA Chidambaram, Chennai",      type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl14", home:"GT",   away:"LSG",  date:"Apr 20, 2026", time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad",     type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl15", home:"DC",   away:"RR",   date:"Apr 22, 2026", time:"7:30 PM IST", venue:"Arun Jaitley Stadium, Delhi",  type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl16", home:"SRH",  away:"CSK",  date:"Apr 25, 2026", time:"3:30 PM IST", venue:"Rajiv Gandhi Stadium, Hyd",    type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl17", home:"RCB",  away:"MI",   date:"Apr 28, 2026", time:"7:30 PM IST", venue:"M. Chinnaswamy, Bengaluru",    type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl18", home:"KKR",  away:"GT",   date:"May 1, 2026",  time:"7:30 PM IST", venue:"Eden Gardens, Kolkata",        type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl19", home:"RR",   away:"MI",   date:"May 4, 2026",  time:"7:30 PM IST", venue:"Sawai Mansingh, Jaipur",       type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl20", home:"PBKS", away:"RCB",  date:"May 7, 2026",  time:"7:30 PM IST", venue:"Mullanpur Stadium, Chandigarh",type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl21", home:"CSK",  away:"KKR",  date:"May 10, 2026", time:"3:30 PM IST", venue:"MA Chidambaram, Chennai",      type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl22", home:"MI",   away:"DC",   date:"May 13, 2026", time:"7:30 PM IST", venue:"Wankhede Stadium, Mumbai",     type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl23", home:"LSG",  away:"RCB",  date:"May 15, 2026", time:"7:30 PM IST", venue:"BRSABV Ekana, Lucknow",        type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl24", home:"GT",   away:"SRH",  date:"May 17, 2026", time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad",     type:"IPL", series:"TATA IPL 2026", result:null },
  { id:"ipl25", home:"TBD",  away:"TBD",  date:"May 26, 2026", time:"7:30 PM IST", venue:"M. Chinnaswamy, Bengaluru",    type:"IPL", series:"TATA IPL 2026", result:null, label:"⚡ Qualifier 1" },
  { id:"ipl26", home:"TBD",  away:"TBD",  date:"May 27, 2026", time:"7:30 PM IST", venue:"TBD",                          type:"IPL", series:"TATA IPL 2026", result:null, label:"⚡ Eliminator" },
  { id:"ipl27", home:"TBD",  away:"TBD",  date:"May 29, 2026", time:"7:30 PM IST", venue:"TBD",                          type:"IPL", series:"TATA IPL 2026", result:null, label:"⚡ Qualifier 2" },
  { id:"ipl28", home:"TBD",  away:"TBD",  date:"May 31, 2026", time:"7:30 PM IST", venue:"M. Chinnaswamy, Bengaluru",    type:"IPL", series:"TATA IPL 2026", result:null, label:"🏆 IPL 2026 Final" },

  // ══ T20 WC 2026 — ALL REAL RESULTS with SCORECARDS ══
  // scorecard: { inn1:{team,score,overs,top:[{n,r,b}],topBowl:[{n,w,r}]}, inn2:{...} }
  // ── Group A ──
  { id:"wc01", home:"NED", away:"PAK", date:"Feb 7, 2026", time:"2:00 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"PAK won by 3 wkts",
    scorecard:{ inn1:{team:"NED",score:"147/10",overs:"19.4",top:[{n:"Vikramjit Singh",r:51,b:38},{n:"Max O'Dowd",r:27,b:21}],topBowl:[{n:"Shaheen Afridi",w:3,r:21},{n:"Haris Rauf",w:2,r:28}]}, inn2:{team:"PAK",score:"148/7",overs:"19.3",top:[{n:"Sahibzada Farhan",r:53,b:32},{n:"Faheem Ashraf",r:24,b:11}],topBowl:[{n:"Paul van Meekeren",w:2,r:30},{n:"Fred Klaassen",w:2,r:26}]} }},
  { id:"wc02", home:"IND", away:"USA", date:"Feb 7, 2026", time:"6:00 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"IND won by 29 runs",
    scorecard:{ inn1:{team:"IND",score:"161/9",overs:"20",top:[{n:"Sanju Samson",r:47,b:31},{n:"Shivam Dube",r:34,b:22}],topBowl:[{n:"Saurabh Netravalkar",w:3,r:26},{n:"Ali Khan",w:2,r:31}]}, inn2:{team:"USA",score:"132/8",overs:"20",top:[{n:"Aaron Jones",r:40,b:28},{n:"Steven Taylor",r:29,b:24}],topBowl:[{n:"Jasprit Bumrah",w:2,r:14},{n:"Arshdeep Singh",w:2,r:22}]} }},
  { id:"wc03", home:"NAM", away:"NED", date:"Feb 10, 2026", time:"2:00 PM IST", venue:"Arun Jaitley, Delhi", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"NED won by 7 wkts",
    scorecard:{ inn1:{team:"NAM",score:"103/10",overs:"18.2",top:[{n:"Jan Nicol Loftie-Eaton",r:31,b:27},{n:"Gerhard Erasmus",r:22,b:19}],topBowl:[{n:"Bas de Leede",w:3,r:18},{n:"Logan van Beek",w:2,r:17}]}, inn2:{team:"NED",score:"104/3",overs:"14.3",top:[{n:"Vikramjit Singh",r:48,b:33},{n:"Max O'Dowd",r:34,b:30}],topBowl:[{n:"Ben Shikongo",w:2,r:28},{n:"JJ Smit",w:1,r:18}]} }},
  { id:"wc04", home:"PAK", away:"USA", date:"Feb 10, 2026", time:"7:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"PAK won by 32 runs",
    scorecard:{ inn1:{team:"PAK",score:"168/6",overs:"20",top:[{n:"Sahibzada Farhan",r:57,b:36},{n:"Babar Azam",r:43,b:35}],topBowl:[{n:"Saurabh Netravalkar",w:2,r:28},{n:"Nosthush Kenjige",w:1,r:34}]}, inn2:{team:"USA",score:"136/8",overs:"20",top:[{n:"Aaron Jones",r:36,b:26},{n:"Monank Patel",r:29,b:22}],topBowl:[{n:"Shaheen Afridi",w:3,r:19},{n:"Mohammad Wasim",w:2,r:24}]} }},
  { id:"wc05", home:"IND", away:"NAM", date:"Feb 12, 2026", time:"7:30 PM IST", venue:"Arun Jaitley, Delhi", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"IND won by 93 runs",
    scorecard:{ inn1:{team:"IND",score:"219/4",overs:"20",top:[{n:"Abhishek Sharma",r:79,b:41},{n:"Sanju Samson",r:68,b:42}],topBowl:[{n:"Ruben Trumpelmann",w:2,r:38},{n:"Jan Nicol Loftie-Eaton",w:1,r:41}]}, inn2:{team:"NAM",score:"126/10",overs:"17.2",top:[{n:"Gerhard Erasmus",r:38,b:31},{n:"Nicol Loftie-Eaton",r:27,b:22}],topBowl:[{n:"Jasprit Bumrah",w:3,r:16},{n:"Axar Patel",w:3,r:19}]} }},
  { id:"wc06", home:"NED", away:"USA", date:"Feb 13, 2026", time:"1:30 PM IST", venue:"MA Chidambaram, Chennai", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"USA won by 93 runs",
    scorecard:{ inn1:{team:"NED",score:"113/10",overs:"18.1",top:[{n:"Max O'Dowd",r:33,b:28},{n:"Ryan ten Doeschate",r:21,b:18}],topBowl:[{n:"Saurabh Netravalkar",w:3,r:15},{n:"Ali Khan",w:3,r:21}]}, inn2:{team:"USA",score:"114/1",overs:"11.5",top:[{n:"Steven Taylor",r:58,b:34},{n:"Aaron Jones",r:43,b:29}],topBowl:[{n:"Bas de Leede",w:1,r:28},{n:"Logan van Beek",w:0,r:22}]} }},
  { id:"wc07", home:"IND", away:"PAK", date:"Feb 14, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"IND won by 61 runs 🔥",
    scorecard:{ inn1:{team:"IND",score:"209/5",overs:"20",top:[{n:"Virat Kohli",r:76,b:48},{n:"Abhishek Sharma",r:55,b:30}],topBowl:[{n:"Haris Rauf",w:2,r:38},{n:"Shaheen Afridi",w:1,r:41}]}, inn2:{team:"PAK",score:"148/10",overs:"18.4",top:[{n:"Sahibzada Farhan",r:44,b:30},{n:"Babar Azam",r:32,b:28}],topBowl:[{n:"Jasprit Bumrah",w:3,r:18},{n:"Hardik Pandya",w:2,r:22}]} }},
  { id:"wc08", home:"PAK", away:"NAM", date:"Feb 17, 2026", time:"1:30 PM IST", venue:"Pallekele, Kandy", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"PAK won by 140 runs",
    scorecard:{ inn1:{team:"PAK",score:"238/4",overs:"20",top:[{n:"Sahibzada Farhan",r:90,b:46},{n:"Babar Azam",r:64,b:43}],topBowl:[{n:"Ruben Trumpelmann",w:1,r:46},{n:"Ben Shikongo",w:1,r:52}]}, inn2:{team:"NAM",score:"98/10",overs:"14.3",top:[{n:"Gerhard Erasmus",r:29,b:24},{n:"Michael van Lingen",r:18,b:16}],topBowl:[{n:"Shaheen Afridi",w:3,r:12},{n:"Naseem Shah",w:3,r:16}]} }},
  { id:"wc09", home:"IND", away:"NED", date:"Feb 18, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group A", status:"completed", result:"IND won by 144 runs",
    scorecard:{ inn1:{team:"IND",score:"244/4",overs:"20",top:[{n:"Sanju Samson",r:82,b:44},{n:"Abhishek Sharma",r:67,b:35}],topBowl:[{n:"Bas de Leede",w:2,r:41},{n:"Logan van Beek",w:1,r:43}]}, inn2:{team:"NED",score:"100/10",overs:"13.4",top:[{n:"Vikramjit Singh",r:31,b:25},{n:"Max O'Dowd",r:22,b:20}],topBowl:[{n:"Jasprit Bumrah",w:3,r:8},{n:"Axar Patel",w:3,r:15}]} }},
  // ── Group B ──
  { id:"wc10", home:"OMA", away:"ZIM", date:"Feb 9, 2026", time:"1:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"ZIM won by 8 wkts",
    scorecard:{ inn1:{team:"OMA",score:"102/10",overs:"17.5",top:[{n:"Aqib Ilyas",r:34,b:29},{n:"Kashyap Prajapati",r:22,b:20}],topBowl:[{n:"Sean Williams",w:3,r:14},{n:"Sikandar Raza",w:3,r:18}]}, inn2:{team:"ZIM",score:"103/2",overs:"11.4",top:[{n:"Sikandar Raza",r:45,b:28},{n:"Craig Ervine",r:39,b:29}],topBowl:[{n:"Bilal Khan",w:1,r:21},{n:"Khawar Ali",w:1,r:22}]} }},
  { id:"wc11", home:"SL", away:"IRE", date:"Feb 8, 2026", time:"7:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"SL won by 20 runs",
    scorecard:{ inn1:{team:"SL",score:"163/6",overs:"20",top:[{n:"Pathum Nissanka",r:52,b:38},{n:"Kusal Mendis",r:44,b:31}],topBowl:[{n:"Mark Adair",w:2,r:31},{n:"Barry McCarthy",w:2,r:28}]}, inn2:{team:"IRE",score:"143/10",overs:"19.5",top:[{n:"Paul Stirling",r:49,b:35},{n:"Lorcan Tucker",r:38,b:29}],topBowl:[{n:"Wanindu Hasaranga",w:3,r:22},{n:"Nuwan Thushara",w:2,r:24}]} }},
  { id:"wc12", home:"AUS", away:"IRE", date:"Feb 11, 2026", time:"3:30 PM IST", venue:"DY Patil, Navi Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"AUS won by 67 runs",
    scorecard:{ inn1:{team:"AUS",score:"219/4",overs:"20",top:[{n:"Travis Head",r:79,b:41},{n:"David Warner",r:55,b:36}],topBowl:[{n:"Mark Adair",w:2,r:37},{n:"Barry McCarthy",w:1,r:41}]}, inn2:{team:"IRE",score:"152/10",overs:"18.2",top:[{n:"Paul Stirling",r:46,b:33},{n:"Gareth Delany",r:34,b:28}],topBowl:[{n:"Josh Hazlewood",w:3,r:22},{n:"Adam Zampa",w:3,r:26}]} }},
  { id:"wc13", home:"ZIM", away:"AUS", date:"Feb 13, 2026", time:"1:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"ZIM won by 23 runs 😲",
    scorecard:{ inn1:{team:"ZIM",score:"185/5",overs:"20",top:[{n:"Sikandar Raza",r:82,b:48},{n:"Sean Williams",r:44,b:31}],topBowl:[{n:"Adam Zampa",w:2,r:32},{n:"Mitchell Starc",w:2,r:36}]}, inn2:{team:"AUS",score:"162/9",overs:"20",top:[{n:"Travis Head",r:51,b:34},{n:"Josh Inglis",r:38,b:29}],topBowl:[{n:"Blessing Muzarabani",w:3,r:26},{n:"Tendai Chatara",w:3,r:28}]} }},
  { id:"wc14", home:"SL", away:"OMA", date:"Feb 12, 2026", time:"1:30 PM IST", venue:"Pallekele, Kandy", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"SL won by 105 runs",
    scorecard:{ inn1:{team:"SL",score:"206/5",overs:"20",top:[{n:"Pathum Nissanka",r:77,b:46},{n:"Kusal Perera",r:61,b:38}],topBowl:[{n:"Bilal Khan",w:2,r:35},{n:"Khawar Ali",w:1,r:42}]}, inn2:{team:"OMA",score:"101/10",overs:"14.1",top:[{n:"Aqib Ilyas",r:27,b:21},{n:"Kashyap Prajapati",r:22,b:19}],topBowl:[{n:"Wanindu Hasaranga",w:4,r:16},{n:"Dushmantha Chameera",w:3,r:14}]} }},
  { id:"wc15", home:"IRE", away:"OMA", date:"Feb 14, 2026", time:"1:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"IRE won by 96 runs",
    scorecard:{ inn1:{team:"IRE",score:"228/4",overs:"20",top:[{n:"Paul Stirling",r:84,b:46},{n:"Lorcan Tucker",r:65,b:38}],topBowl:[{n:"Khawar Ali",w:2,r:38},{n:"Bilal Khan",w:1,r:44}]}, inn2:{team:"OMA",score:"132/10",overs:"17.3",top:[{n:"Aqib Ilyas",r:38,b:28},{n:"Naseem Khushi",r:29,b:24}],topBowl:[{n:"Mark Adair",w:3,r:18},{n:"Barry McCarthy",w:3,r:22}]} }},
  { id:"wc16", home:"IRE", away:"ZIM", date:"Feb 17, 2026", time:"1:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"No result (rain) · ZIM qualify",
    scorecard:{ inn1:{team:"ZIM",score:"47/1",overs:"5.2",top:[{n:"Sikandar Raza",r:22,b:14},{n:"Craig Ervine",r:18,b:13}],topBowl:[{n:"Mark Adair",w:1,r:12}]}, inn2:{team:"IRE",score:"N/A",overs:"0",top:[],topBowl:[]} }},
  { id:"wc17", home:"AUS", away:"OMA", date:"Feb 18, 2026", time:"1:30 PM IST", venue:"DY Patil, Navi Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"AUS won by 127 runs",
    scorecard:{ inn1:{team:"AUS",score:"219/4",overs:"20",top:[{n:"Travis Head",r:71,b:42},{n:"Steve Smith",r:58,b:41}],topBowl:[{n:"Bilal Khan",w:2,r:38},{n:"Mehran Khan",w:1,r:42}]}, inn2:{team:"OMA",score:"92/10",overs:"13.2",top:[{n:"Aqib Ilyas",r:24,b:20},{n:"Kashyap Prajapati",r:16,b:15}],topBowl:[{n:"Josh Hazlewood",w:4,r:12},{n:"Pat Cummins",w:3,r:14}]} }},
  { id:"wc18", home:"SL", away:"ZIM", date:"Feb 18, 2026", time:"7:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Group B", status:"completed", result:"ZIM won by 14 runs",
    scorecard:{ inn1:{team:"ZIM",score:"197/5",overs:"20",top:[{n:"Sikandar Raza",r:71,b:43},{n:"Sean Williams",r:52,b:34}],topBowl:[{n:"Wanindu Hasaranga",w:2,r:32},{n:"Dushmantha Chameera",w:1,r:38}]}, inn2:{team:"SL",score:"183/9",overs:"20",top:[{n:"Pathum Nissanka",r:56,b:38},{n:"Kusal Mendis",r:44,b:32}],topBowl:[{n:"Blessing Muzarabani",w:3,r:28},{n:"Tendai Chatara",w:3,r:31}]} }},
  // ── Group C ──
  { id:"wc19", home:"WI", away:"SCO", date:"Feb 7, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"WI won by 35 runs",
    scorecard:{ inn1:{team:"WI",score:"182/5",overs:"20",top:[{n:"Brandon King",r:62,b:41},{n:"Nicholas Pooran",r:57,b:30}],topBowl:[{n:"Safyaan Sharif",w:2,r:32},{n:"Michael Leask",w:1,r:38}]}, inn2:{team:"SCO",score:"147/10",overs:"18.5",top:[{n:"George Munsey",r:48,b:35},{n:"Matthew Cross",r:32,b:28}],topBowl:[{n:"Andre Russell",w:3,r:22},{n:"Alzarri Joseph",w:3,r:26}]} }},
  { id:"wc20", home:"ENG", away:"NEP", date:"Feb 8, 2026", time:"7:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"ENG won by 4 runs",
    scorecard:{ inn1:{team:"ENG",score:"184/7",overs:"20",top:[{n:"Jos Buttler",r:59,b:38},{n:"Phil Salt",r:44,b:29}],topBowl:[{n:"Sandeep Lamichhane",w:3,r:30},{n:"Kushal Malla",w:2,r:32}]}, inn2:{team:"NEP",score:"180/6",overs:"20",top:[{n:"Kushal Bhurtel",r:58,b:37},{n:"Rohit Paudel",r:52,b:34}],topBowl:[{n:"Adil Rashid",w:2,r:28},{n:"Sam Curran",w:2,r:32}]} }},
  { id:"wc21", home:"SCO", away:"ITA", date:"Feb 9, 2026", time:"1:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"SCO won by 73 runs",
    scorecard:{ inn1:{team:"SCO",score:"207/4",overs:"20",top:[{n:"George Munsey",r:84,b:46},{n:"Kyle Coetzer",r:51,b:35}],topBowl:[{n:"Gareth Berg",w:2,r:36},{n:"Timm van der Gugten",w:1,r:39}]}, inn2:{team:"ITA",score:"134/10",overs:"16.4",top:[{n:"Michael Forde",r:38,b:30},{n:"Alessandro Ferrari",r:27,b:23}],topBowl:[{n:"Safyaan Sharif",w:3,r:19},{n:"Mark Watt",w:3,r:23}]} }},
  { id:"wc22", home:"NEP", away:"ITA", date:"Feb 12, 2026", time:"3:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"ITA won by 10 wkts 🎉",
    scorecard:{ inn1:{team:"NEP",score:"95/10",overs:"16.3",top:[{n:"Rohit Paudel",r:28,b:24},{n:"Kushal Bhurtel",r:22,b:20}],topBowl:[{n:"Gareth Berg",w:3,r:13},{n:"Timm van der Gugten",w:3,r:18}]}, inn2:{team:"ITA",score:"96/0",overs:"9.3",top:[{n:"Michael Forde",r:54,b:31},{n:"Alessandro Ferrari",r:41,b:27}],topBowl:[{n:"Sandeep Lamichhane",w:0,r:28},{n:"Sompal Kami",w:0,r:24}]} }},
  { id:"wc23", home:"ENG", away:"WI", date:"Feb 11, 2026", time:"7:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"WI won by 30 runs",
    scorecard:{ inn1:{team:"WI",score:"221/5",overs:"20",top:[{n:"Nicholas Pooran",r:76,b:42},{n:"Andre Russell",r:59,b:26}],topBowl:[{n:"Sam Curran",w:2,r:38},{n:"Jofra Archer",w:2,r:42}]}, inn2:{team:"ENG",score:"191/9",overs:"20",top:[{n:"Phil Salt",r:62,b:38},{n:"Jos Buttler",r:44,b:32}],topBowl:[{n:"Alzarri Joseph",w:3,r:28},{n:"Romario Shepherd",w:3,r:31}]} }},
  { id:"wc24", home:"ENG", away:"SCO", date:"Feb 14, 2026", time:"3:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"ENG won by 5 wkts",
    scorecard:{ inn1:{team:"SCO",score:"161/7",overs:"20",top:[{n:"George Munsey",r:55,b:38},{n:"Richie Berrington",r:41,b:31}],topBowl:[{n:"Jofra Archer",w:3,r:24},{n:"Adil Rashid",w:2,r:26}]}, inn2:{team:"ENG",score:"162/5",overs:"18.3",top:[{n:"Jos Buttler",r:61,b:40},{n:"Will Jacks",r:44,b:28}],topBowl:[{n:"Safyaan Sharif",w:2,r:29},{n:"Michael Leask",w:1,r:32}]} }},
  { id:"wc25", home:"WI", away:"ITA", date:"Feb 17, 2026", time:"3:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"WI won by 123 runs",
    scorecard:{ inn1:{team:"WI",score:"237/4",overs:"20",top:[{n:"Andre Russell",r:88,b:34},{n:"Nicholas Pooran",r:71,b:39}],topBowl:[{n:"Michael Forde",w:2,r:44},{n:"Alessandro Ferrari",w:1,r:46}]}, inn2:{team:"ITA",score:"114/10",overs:"16.1",top:[{n:"Michael Forde",r:34,b:27},{n:"Emilio Gay",r:28,b:24}],topBowl:[{n:"Alzarri Joseph",w:4,r:16},{n:"Romario Shepherd",w:3,r:18}]} }},
  { id:"wc26", home:"SCO", away:"NEP", date:"Feb 17, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"SCO won by 46 runs",
    scorecard:{ inn1:{team:"SCO",score:"186/5",overs:"20",top:[{n:"George Munsey",r:62,b:38},{n:"Richie Berrington",r:48,b:32}],topBowl:[{n:"Kushal Malla",w:2,r:31},{n:"Sandeep Lamichhane",w:2,r:35}]}, inn2:{team:"NEP",score:"140/10",overs:"18.4",top:[{n:"Rohit Paudel",r:41,b:32},{n:"Kushal Bhurtel",r:34,b:28}],topBowl:[{n:"Safyaan Sharif",w:3,r:22},{n:"Mark Watt",w:3,r:25}]} }},
  { id:"wc27", home:"ENG", away:"ITA", date:"Feb 18, 2026", time:"3:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Group C", status:"completed", result:"ENG won by 24 runs",
    scorecard:{ inn1:{team:"ENG",score:"188/5",overs:"20",top:[{n:"Will Jacks",r:67,b:38},{n:"Phil Salt",r:52,b:33}],topBowl:[{n:"Gareth Berg",w:2,r:33},{n:"Timm van der Gugten",w:1,r:36}]}, inn2:{team:"ITA",score:"164/9",overs:"20",top:[{n:"Michael Forde",r:52,b:36},{n:"Emilio Gay",r:41,b:31}],topBowl:[{n:"Jofra Archer",w:3,r:24},{n:"Adil Rashid",w:3,r:27}]} }},
  // ── Group D ──
  { id:"wc28", home:"AFG", away:"NZ", date:"Feb 8, 2026", time:"1:30 PM IST", venue:"MA Chidambaram, Chennai", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"NZ won by 5 wkts",
    scorecard:{ inn1:{team:"AFG",score:"182/6",overs:"20",top:[{n:"Ibrahim Zadran",r:61,b:40},{n:"Rahmanullah Gurbaz",r:48,b:31}],topBowl:[{n:"Trent Boult",w:3,r:28},{n:"Tim Southee",w:2,r:31}]}, inn2:{team:"NZ",score:"183/5",overs:"17.5",top:[{n:"Finn Allen",r:72,b:40},{n:"Devon Conway",r:51,b:36}],topBowl:[{n:"Rashid Khan",w:2,r:29},{n:"Mujeeb ur Rahman",w:2,r:31}]} }},
  { id:"wc29", home:"SA", away:"CAN", date:"Feb 9, 2026", time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"SA won by 57 runs",
    scorecard:{ inn1:{team:"SA",score:"196/5",overs:"20",top:[{n:"Reeza Hendricks",r:66,b:42},{n:"Aiden Markram",r:54,b:36}],topBowl:[{n:"Navneet Dhaliwal",w:2,r:34},{n:"Dilon Heyliger",w:1,r:38}]}, inn2:{team:"CAN",score:"139/10",overs:"18.4",top:[{n:"Aaron Johnson",r:41,b:32},{n:"Navneet Dhaliwal",r:34,b:27}],topBowl:[{n:"Kagiso Rabada",w:3,r:18},{n:"Lungi Ngidi",w:3,r:21}]} }},
  { id:"wc30", home:"NZ", away:"UAE", date:"Feb 10, 2026", time:"3:30 PM IST", venue:"MA Chidambaram, Chennai", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"NZ won by 10 wkts",
    scorecard:{ inn1:{team:"UAE",score:"101/10",overs:"17.2",top:[{n:"Muhammad Waseem",r:34,b:27},{n:"CP Rizwaan",r:22,b:20}],topBowl:[{n:"Trent Boult",w:4,r:11},{n:"Tim Southee",w:3,r:14}]}, inn2:{team:"NZ",score:"102/0",overs:"8.5",top:[{n:"Finn Allen",r:59,b:28},{n:"Devon Conway",r:42,b:28}],topBowl:[{n:"Zahoor Khan",w:0,r:28},{n:"Junaid Siddiqui",w:0,r:24}]} }},
  { id:"wc31", home:"SA", away:"AFG", date:"Feb 11, 2026", time:"1:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"SA won via 2nd Super Over 😱",
    scorecard:{ inn1:{team:"SA",score:"163/7",overs:"20",top:[{n:"Aiden Markram",r:47,b:33},{n:"Reeza Hendricks",r:38,b:30}],topBowl:[{n:"Rashid Khan",w:3,r:21},{n:"Mujeeb ur Rahman",w:2,r:26}]}, inn2:{team:"AFG",score:"163/7",overs:"20",top:[{n:"Ibrahim Zadran",r:54,b:37},{n:"Gulbadin Naib",r:38,b:28}],topBowl:[{n:"Kagiso Rabada",w:3,r:24},{n:"Lungi Ngidi",w:2,r:29}]} }},
  { id:"wc32", home:"CAN", away:"UAE", date:"Feb 13, 2026", time:"3:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"UAE won by 5 wkts",
    scorecard:{ inn1:{team:"CAN",score:"141/9",overs:"20",top:[{n:"Navneet Dhaliwal",r:44,b:34},{n:"Shreyas Movva",r:31,b:26}],topBowl:[{n:"Zahoor Khan",w:3,r:22},{n:"Junaid Siddiqui",w:2,r:24}]}, inn2:{team:"UAE",score:"142/5",overs:"18.2",top:[{n:"Muhammad Waseem",r:52,b:38},{n:"Vriitya Aravind",r:41,b:32}],topBowl:[{n:"Dilon Heyliger",w:2,r:28},{n:"Navneet Dhaliwal",w:1,r:31}]} }},
  { id:"wc33", home:"NZ", away:"CAN", date:"Feb 16, 2026", time:"7:30 PM IST", venue:"MA Chidambaram, Chennai", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"NZ won by 69 runs (Yuvraj Samra 100 🇨🇦)",
    scorecard:{ inn1:{team:"NZ",score:"221/4",overs:"20",top:[{n:"Finn Allen",r:78,b:44},{n:"Tim Seifert",r:64,b:38}],topBowl:[{n:"Yuvraj Samra",w:2,r:39},{n:"Dilon Heyliger",w:1,r:43}]}, inn2:{team:"CAN",score:"152/10",overs:"18.3",top:[{n:"Yuvraj Samra",r:100,b:52},{n:"Navneet Dhaliwal",r:21,b:19}],topBowl:[{n:"Trent Boult",w:4,r:18},{n:"Tim Southee",w:3,r:21}]} }},
  { id:"wc34", home:"SA", away:"UAE", date:"Feb 17, 2026", time:"3:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"SA won by 104 runs",
    scorecard:{ inn1:{team:"SA",score:"232/4",overs:"20",top:[{n:"Aiden Markram",r:81,b:46},{n:"Heinrich Klaasen",r:66,b:36}],topBowl:[{n:"Zahoor Khan",w:2,r:42},{n:"Junaid Siddiqui",w:1,r:46}]}, inn2:{team:"UAE",score:"128/10",overs:"16.4",top:[{n:"Muhammad Waseem",r:38,b:29},{n:"Vriitya Aravind",r:27,b:22}],topBowl:[{n:"Kagiso Rabada",w:4,r:14},{n:"Lungi Ngidi",w:3,r:17}]} }},
  { id:"wc35", home:"AFG", away:"CAN", date:"Feb 18, 2026", time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Group D", status:"completed", result:"AFG won by 134 runs",
    scorecard:{ inn1:{team:"AFG",score:"244/5",overs:"20",top:[{n:"Rahmanullah Gurbaz",r:92,b:50},{n:"Ibrahim Zadran",r:71,b:43}],topBowl:[{n:"Navneet Dhaliwal",w:2,r:44},{n:"Dilon Heyliger",w:1,r:48}]}, inn2:{team:"CAN",score:"110/10",overs:"14.2",top:[{n:"Aaron Johnson",r:29,b:24},{n:"Navneet Dhaliwal",r:22,b:18}],topBowl:[{n:"Rashid Khan",w:4,r:12},{n:"Mujeeb ur Rahman",w:3,r:14}]} }},
  // ── Super 8 Group 1 ──
  { id:"wc36", home:"SA", away:"IND", date:"Feb 22, 2026", time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 1", status:"completed", result:"SA won by 76 runs 😱",
    scorecard:{ inn1:{team:"SA",score:"229/4",overs:"20",top:[{n:"Aiden Markram",r:86,b:46},{n:"Heinrich Klaasen",r:73,b:38}],topBowl:[{n:"Jasprit Bumrah",w:2,r:28},{n:"Axar Patel",w:1,r:38}]}, inn2:{team:"IND",score:"153/10",overs:"19.1",top:[{n:"Virat Kohli",r:44,b:36},{n:"Sanju Samson",r:39,b:28}],topBowl:[{n:"Kagiso Rabada",w:4,r:22},{n:"Lungi Ngidi",w:3,r:26},{n:"Shadley van Schalkwyk",w:3,r:18}]} }},
  { id:"wc37", home:"WI", away:"ZIM", date:"Feb 23, 2026", time:"3:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 1", status:"completed", result:"WI won by 107 runs",
    scorecard:{ inn1:{team:"WI",score:"254/3",overs:"20",top:[{n:"Andre Russell",r:98,b:40},{n:"Nicholas Pooran",r:82,b:42}],topBowl:[{n:"Sikandar Raza",w:1,r:48},{n:"Blessing Muzarabani",w:1,r:52}]}, inn2:{team:"ZIM",score:"147/10",overs:"17.4",top:[{n:"Sikandar Raza",r:44,b:30},{n:"Sean Williams",r:38,b:28}],topBowl:[{n:"Alzarri Joseph",w:3,r:22},{n:"Romario Shepherd",w:3,r:24}]} }},
  { id:"wc38", home:"ZIM", away:"SA", date:"Feb 26, 2026", time:"3:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 1", status:"completed", result:"SA won by 5 wkts",
    scorecard:{ inn1:{team:"ZIM",score:"171/7",overs:"20",top:[{n:"Sikandar Raza",r:63,b:40},{n:"Sean Williams",r:47,b:33}],topBowl:[{n:"Kagiso Rabada",w:3,r:28},{n:"Shadley van Schalkwyk",w:2,r:26}]}, inn2:{team:"SA",score:"172/5",overs:"18.4",top:[{n:"Aiden Markram",r:58,b:38},{n:"Reeza Hendricks",r:47,b:34}],topBowl:[{n:"Blessing Muzarabani",w:2,r:28},{n:"Tendai Chatara",w:2,r:31}]} }},
  { id:"wc39", home:"IND", away:"ZIM", date:"Feb 27, 2026", time:"7:30 PM IST", venue:"MA Chidambaram, Chennai", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 1", status:"completed", result:"IND won by 72 runs",
    scorecard:{ inn1:{team:"IND",score:"218/5",overs:"20",top:[{n:"Abhishek Sharma",r:75,b:42},{n:"Shivam Dube",r:58,b:31}],topBowl:[{n:"Blessing Muzarabani",w:2,r:34},{n:"Sikandar Raza",w:2,r:38}]}, inn2:{team:"ZIM",score:"146/10",overs:"18.2",top:[{n:"Sikandar Raza",r:44,b:32},{n:"Sean Williams",r:38,b:30}],topBowl:[{n:"Jasprit Bumrah",w:3,r:16},{n:"Hardik Pandya",w:3,r:20}]} }},
  { id:"wc40", home:"SA", away:"WI", date:"Mar 1, 2026", time:"3:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 1", status:"completed", result:"SA won by 9 wkts",
    scorecard:{ inn1:{team:"WI",score:"118/10",overs:"17.3",top:[{n:"Nicholas Pooran",r:38,b:28},{n:"Brandon King",r:29,b:24}],topBowl:[{n:"Kagiso Rabada",w:4,r:16},{n:"Lungi Ngidi",w:3,r:18}]}, inn2:{team:"SA",score:"119/1",overs:"11.2",top:[{n:"Reeza Hendricks",r:61,b:36},{n:"Aiden Markram",r:53,b:34}],topBowl:[{n:"Alzarri Joseph",w:1,r:24},{n:"Romario Shepherd",w:0,r:22}]} }},
  { id:"wc41", home:"IND", away:"WI", date:"Mar 2, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 1", status:"completed", result:"IND won by 5 wkts (Samson 97*) 🔥",
    scorecard:{ inn1:{team:"WI",score:"194/6",overs:"20",top:[{n:"Andre Russell",r:74,b:38},{n:"Nicholas Pooran",r:53,b:31}],topBowl:[{n:"Jasprit Bumrah",w:2,r:28},{n:"Hardik Pandya",w:2,r:32}]}, inn2:{team:"IND",score:"195/5",overs:"19.2",top:[{n:"Sanju Samson",r:97,b:50},{n:"Abhishek Sharma",r:44,b:28}],topBowl:[{n:"Alzarri Joseph",w:2,r:34},{n:"Romario Shepherd",w:2,r:36}]} }},
  // ── Super 8 Group 2 ──
  { id:"wc42", home:"NZ", away:"PAK", date:"Feb 21, 2026", time:"7:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 2", status:"completed", result:"No result (rain) · 1 pt each",
    scorecard:{ inn1:{team:"PAK",score:"38/1",overs:"4.2",top:[{n:"Babar Azam",r:18,b:14}],topBowl:[{n:"Trent Boult",w:1,r:12}]}, inn2:{team:"NZ",score:"N/A",overs:"0",top:[],topBowl:[]} }},
  { id:"wc43", home:"SL", away:"ENG", date:"Feb 22, 2026", time:"3:30 PM IST", venue:"Pallekele, Kandy", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 2", status:"completed", result:"ENG won by 51 runs",
    scorecard:{ inn1:{team:"ENG",score:"219/5",overs:"20",top:[{n:"Phil Salt",r:78,b:44},{n:"Will Jacks",r:62,b:36}],topBowl:[{n:"Wanindu Hasaranga",w:2,r:36},{n:"Dushmantha Chameera",w:2,r:38}]}, inn2:{team:"SL",score:"168/9",overs:"20",top:[{n:"Pathum Nissanka",r:54,b:38},{n:"Kusal Mendis",r:44,b:32}],topBowl:[{n:"Adil Rashid",w:3,r:24},{n:"Jofra Archer",w:3,r:26}]} }},
  { id:"wc44", home:"ENG", away:"PAK", date:"Feb 24, 2026", time:"7:30 PM IST", venue:"Pallekele, Kandy", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 2", status:"completed", result:"ENG won by 2 wkts (Brook 100 🌹)",
    scorecard:{ inn1:{team:"PAK",score:"208/6",overs:"20",top:[{n:"Sahibzada Farhan",r:78,b:46},{n:"Babar Azam",r:54,b:38}],topBowl:[{n:"Jofra Archer",w:2,r:34},{n:"Sam Curran",w:2,r:38}]}, inn2:{team:"ENG",score:"209/8",overs:"19.5",top:[{n:"Harry Brook",r:100,b:52},{n:"Phil Salt",r:41,b:29}],topBowl:[{n:"Shaheen Afridi",w:3,r:34},{n:"Haris Rauf",w:2,r:38}]} }},
  { id:"wc45", home:"SL", away:"NZ", date:"Feb 25, 2026", time:"7:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 2", status:"completed", result:"NZ won by 61 runs",
    scorecard:{ inn1:{team:"NZ",score:"221/5",overs:"20",top:[{n:"Finn Allen",r:82,b:46},{n:"Tim Seifert",r:61,b:38}],topBowl:[{n:"Wanindu Hasaranga",w:2,r:36},{n:"Dushmantha Chameera",w:2,r:38}]}, inn2:{team:"SL",score:"160/10",overs:"18.3",top:[{n:"Pathum Nissanka",r:51,b:38},{n:"Kusal Mendis",r:36,b:28}],topBowl:[{n:"Trent Boult",w:3,r:22},{n:"Tim Southee",w:3,r:24}]} }},
  { id:"wc46", home:"ENG", away:"NZ", date:"Feb 27, 2026", time:"7:30 PM IST", venue:"R. Premadasa, Colombo", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 2", status:"completed", result:"ENG won by 4 wkts",
    scorecard:{ inn1:{team:"NZ",score:"179/6",overs:"20",top:[{n:"Finn Allen",r:58,b:36},{n:"Tim Seifert",r:48,b:33}],topBowl:[{n:"Jofra Archer",w:2,r:28},{n:"Sam Curran",w:2,r:31}]}, inn2:{team:"ENG",score:"180/6",overs:"19.3",top:[{n:"Will Jacks",r:63,b:38},{n:"Harry Brook",r:52,b:34}],topBowl:[{n:"Trent Boult",w:2,r:28},{n:"Tim Southee",w:2,r:30}]} }},
  { id:"wc47", home:"SL", away:"PAK", date:"Feb 28, 2026", time:"7:30 PM IST", venue:"Pallekele, Kandy", type:"T20WC", series:"ICC T20 WC 2026 · Super 8 Grp 2", status:"completed", result:"PAK won by 5 runs · NZ qualify",
    scorecard:{ inn1:{team:"PAK",score:"189/6",overs:"20",top:[{n:"Babar Azam",r:67,b:44},{n:"Sahibzada Farhan",r:52,b:34}],topBowl:[{n:"Wanindu Hasaranga",w:2,r:32},{n:"Dushmantha Chameera",w:2,r:36}]}, inn2:{team:"SL",score:"184/8",overs:"20",top:[{n:"Pathum Nissanka",r:61,b:40},{n:"Kusal Mendis",r:48,b:33}],topBowl:[{n:"Shaheen Afridi",w:3,r:28},{n:"Haris Rauf",w:2,r:32}]} }},
  // ── Semi-Finals ──
  { id:"wc48", home:"SA", away:"NZ", date:"Mar 4, 2026", time:"7:30 PM IST", venue:"Eden Gardens, Kolkata", type:"T20WC", series:"ICC T20 WC 2026 · Semi-Final 1", status:"completed", result:"NZ won by 9 wkts (Allen 33-ball 100! 🥇)",
    scorecard:{ inn1:{team:"SA",score:"143/9",overs:"20",top:[{n:"Aiden Markram",r:44,b:34},{n:"Heinrich Klaasen",r:36,b:26}],topBowl:[{n:"Trent Boult",w:4,r:18},{n:"Tim Southee",w:3,r:22},{n:"Rachin Ravindra",w:2,r:18}]}, inn2:{team:"NZ",score:"144/1",overs:"11.4",top:[{n:"Finn Allen",r:100,b:33},{n:"Devon Conway",r:42,b:32}],topBowl:[{n:"Kagiso Rabada",w:1,r:28},{n:"Lungi Ngidi",w:0,r:24}]} }},
  { id:"wc49", home:"IND", away:"ENG", date:"Mar 5, 2026", time:"7:30 PM IST", venue:"Wankhede, Mumbai", type:"T20WC", series:"ICC T20 WC 2026 · Semi-Final 2", status:"completed", result:"IND won by 7 runs 🥇",
    scorecard:{ inn1:{team:"IND",score:"253/5",overs:"20",top:[{n:"Abhishek Sharma",r:79,b:40},{n:"Sanju Samson",r:72,b:43},{n:"Shivam Dube",r:51,b:24}],topBowl:[{n:"Jofra Archer",w:2,r:44},{n:"Sam Curran",w:2,r:46}]}, inn2:{team:"ENG",score:"246/7",overs:"20",top:[{n:"Harry Brook",r:88,b:50},{n:"Phil Salt",r:64,b:38}],topBowl:[{n:"Jasprit Bumrah",w:3,r:28},{n:"Hardik Pandya",w:2,r:38}]} }},
  // ── Final ──
  { id:"wc50", home:"IND", away:"NZ", date:"Mar 8, 2026", time:"7:30 PM IST", venue:"Narendra Modi, Ahmedabad", type:"T20WC", series:"ICC T20 WC 2026 · FINAL 🏆", status:"completed", result:"IND won by 96 runs 🏆🎉", label:"🏆 T20 WC 2026 FINAL",
    scorecard:{ inn1:{team:"IND",score:"255/5",overs:"20",top:[{n:"Sanju Samson",r:89,b:46},{n:"Ishan Kishan",r:54,b:25},{n:"Abhishek Sharma",r:48,b:26}],topBowl:[{n:"James Neesham",w:3,r:46},{n:"Matt Henry",w:1,r:49}]}, inn2:{team:"NZ",score:"159/10",overs:"19",top:[{n:"Tim Seifert",r:52,b:26},{n:"Mitchell Santner",r:43,b:35}],topBowl:[{n:"Jasprit Bumrah",w:4,r:15},{n:"Axar Patel",w:3,r:27},{n:"Arshdeep Singh",w:2,r:22}]} }},

  // ══ BILATERAL SERIES 2026 (confirmed real dates) ══
  // India vs Afghanistan ODIs — June 2026 (home, confirmed)
  { id:"bi00", home:"IND",  away:"AFG",  date:"Jun 10, 2026", time:"1:30 PM IST", venue:"TBD, India",                   type:"ODI",  series:"India vs Afghanistan ODI Series 2026 · 1st ODI", result:null },
  { id:"bi00b",home:"IND",  away:"AFG",  date:"Jun 13, 2026", time:"1:30 PM IST", venue:"TBD, India",                   type:"ODI",  series:"India vs Afghanistan ODI Series 2026 · 2nd ODI", result:null },
  { id:"bi00c",home:"IND",  away:"AFG",  date:"Jun 16, 2026", time:"1:30 PM IST", venue:"TBD, India",                   type:"ODI",  series:"India vs Afghanistan ODI Series 2026 · 3rd ODI", result:null },
  // England vs New Zealand Tests — June 2026 (confirmed)
  { id:"bi_t1",home:"ENG",  away:"NZ",   date:"Jun 4, 2026",  time:"11:00 AM GMT", venue:"Lord's Cricket Ground, London",type:"TEST", series:"England vs New Zealand Test Series 2026 · 1st Test", result:null },
  { id:"bi_t2",home:"ENG",  away:"NZ",   date:"Jun 12, 2026", time:"11:00 AM GMT", venue:"The Oval, London",             type:"TEST", series:"England vs New Zealand Test Series 2026 · 2nd Test", result:null },
  { id:"bi_t3",home:"ENG",  away:"NZ",   date:"Jun 20, 2026", time:"11:00 AM GMT", venue:"Trent Bridge, Nottingham",     type:"TEST", series:"England vs New Zealand Test Series 2026 · 3rd Test", result:null },
  // India tour of England — July 2026 (5 T20Is + 3 ODIs, confirmed ECB schedule)
  { id:"bi01", home:"ENG",  away:"IND",  date:"Jul 1, 2026",  time:"6:30 PM IST", venue:"Riverside Ground, Durham",     type:"T20I", series:"India Tour of England 2026 · 1st T20I", result:null },
  { id:"bi02", home:"ENG",  away:"IND",  date:"Jul 4, 2026",  time:"6:30 PM IST", venue:"Old Trafford, Manchester",     type:"T20I", series:"India Tour of England 2026 · 2nd T20I", result:null },
  { id:"bi03", home:"ENG",  away:"IND",  date:"Jul 7, 2026",  time:"6:30 PM IST", venue:"Trent Bridge, Nottingham",     type:"T20I", series:"India Tour of England 2026 · 3rd T20I", result:null },
  { id:"bi04", home:"ENG",  away:"IND",  date:"Jul 9, 2026",  time:"6:30 PM IST", venue:"Sophia Gardens, Cardiff",      type:"T20I", series:"India Tour of England 2026 · 4th T20I", result:null },
  { id:"bi05", home:"ENG",  away:"IND",  date:"Jul 11, 2026", time:"6:30 PM IST", venue:"The Oval, London",             type:"T20I", series:"India Tour of England 2026 · 5th T20I", result:null },
  { id:"bi06", home:"ENG",  away:"IND",  date:"Jul 14, 2026", time:"5:30 PM IST", venue:"Edgbaston, Birmingham",        type:"ODI",  series:"India Tour of England 2026 · 1st ODI", result:null },
  { id:"bi07", home:"ENG",  away:"IND",  date:"Jul 16, 2026", time:"5:30 PM IST", venue:"Sophia Gardens, Cardiff",      type:"ODI",  series:"India Tour of England 2026 · 2nd ODI", result:null },
  { id:"bi08", home:"ENG",  away:"IND",  date:"Jul 19, 2026", time:"3:30 PM IST", venue:"Lord's Cricket Ground, London",type:"ODI",  series:"India Tour of England 2026 · 3rd ODI", result:null },
  // Australia vs South Africa T20I — Apr 2026
  { id:"bi09", home:"AUS",  away:"SA",   date:"Apr 4, 2026",  time:"1:30 PM IST", venue:"MCG, Melbourne",               type:"T20I", series:"Australia vs South Africa T20I Series · 1st T20I", result:null },
  { id:"bi10", home:"AUS",  away:"SA",   date:"Apr 7, 2026",  time:"1:30 PM IST", venue:"SCG, Sydney",                  type:"T20I", series:"Australia vs South Africa T20I Series · 2nd T20I", result:null },
  { id:"bi11", home:"AUS",  away:"SA",   date:"Apr 10, 2026", time:"1:30 PM IST", venue:"Gabba, Brisbane",              type:"T20I", series:"Australia vs South Africa T20I Series · 3rd T20I", result:null },
  // Pakistan vs New Zealand ODI — Apr 2026
  { id:"bi12", home:"PAK",  away:"NZ",   date:"Apr 16, 2026", time:"3:00 PM IST", venue:"National Bank Stadium, Karachi",type:"ODI", series:"Pakistan vs New Zealand ODI Series · 1st ODI", result:null },
  { id:"bi13", home:"PAK",  away:"NZ",   date:"Apr 19, 2026", time:"3:00 PM IST", venue:"Rawalpindi Cricket Stadium",   type:"ODI",  series:"Pakistan vs New Zealand ODI Series · 2nd ODI", result:null },
  { id:"bi14", home:"PAK",  away:"NZ",   date:"Apr 22, 2026", time:"3:00 PM IST", venue:"Gaddafi Stadium, Lahore",      type:"ODI",  series:"Pakistan vs New Zealand ODI Series · 3rd ODI", result:null },
  // West Indies vs India — May 2026
  { id:"bi15", home:"WI",   away:"IND",  date:"May 15, 2026", time:"11:30 PM IST","venue":"Queen's Park Oval, Trinidad", type:"ODI", series:"West Indies vs India ODI Series · 1st ODI",  result:null },
  { id:"bi16", home:"WI",   away:"IND",  date:"May 18, 2026", time:"11:30 PM IST","venue":"Providence Stadium, Guyana",  type:"ODI", series:"West Indies vs India ODI Series · 2nd ODI",  result:null },
  { id:"bi17", home:"WI",   away:"IND",  date:"May 21, 2026", time:"11:30 PM IST","venue":"Kensington Oval, Barbados",   type:"ODI", series:"West Indies vs India ODI Series · 3rd ODI",  result:null },
  // Sri Lanka vs Afghanistan T20I — Apr 2026
  { id:"bi18", home:"SL",   away:"AFG",  date:"Apr 24, 2026", time:"7:00 PM IST", venue:"R. Premadasa, Colombo",        type:"T20I", series:"Sri Lanka vs Afghanistan T20I Series · 1st T20I", result:null },
  { id:"bi19", home:"SL",   away:"AFG",  date:"Apr 26, 2026", time:"7:00 PM IST", venue:"Pallekele, Kandy",             type:"T20I", series:"Sri Lanka vs Afghanistan T20I Series · 2nd T20I", result:null },
  { id:"bi20", home:"SL",   away:"AFG",  date:"Apr 28, 2026", time:"7:00 PM IST", venue:"R. Premadasa, Colombo",        type:"T20I", series:"Sri Lanka vs Afghanistan T20I Series · 3rd T20I", result:null },
];

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const ref = useRef(null); const anim = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth; c.height = window.innerHeight;
    const ps = Array.from({length:150},()=>({x:Math.random()*c.width,y:-20,r:Math.random()*9+4,d:Math.random()*20+10,color:["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#FF9F43","#A29BFE"][Math.floor(Math.random()*6)],tilt:0,ta:0,ts:Math.random()*0.12+0.04}));
    let a=0;const draw=()=>{ctx.clearRect(0,0,c.width,c.height);a+=0.01;ps.forEach(p=>{p.ta+=p.ts;p.y+=(Math.cos(a+p.d)+3)*1.5;p.x+=Math.sin(a)*1.5;p.tilt=Math.sin(p.ta)*15;ctx.beginPath();ctx.lineWidth=p.r/2;ctx.strokeStyle=p.color;ctx.moveTo(p.x+p.tilt+p.r/4,p.y);ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/4);ctx.stroke();if(p.y>c.height){p.y=-20;p.x=Math.random()*c.width;}});anim.current=requestAnimationFrame(draw);};
    draw();const t=setTimeout(()=>cancelAnimationFrame(anim.current),4000);
    return()=>{cancelAnimationFrame(anim.current);clearTimeout(t);};
  },[active]);
  if(!active)return null;
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:9999}}/>;
}

// ─── Prediction Modal ─────────────────────────────────────────────────────────
function PredictionModal({ match, colors, onClose, onResult }) {
  const [phase, setPhase]     = useState("toss");
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const phaseList = ["toss","powerplay","over","winner"];
  const tossOptions = [
    `${match.home} wins toss & bats`,
    `${match.home} wins toss & bowls`,
    `${match.away} wins toss & bats`,
    `${match.away} wins toss & bowls`,
  ];
  const answers = useRef({
    toss:      tossOptions[Math.floor(Math.random()*4)],
    powerplay: ["40–49","50–59","60–69","70+"][Math.floor(Math.random()*4)],
    over:      ["0–5","6–9","10–12","13+"][Math.floor(Math.random()*4)],
    winner:    Math.random()>0.5 ? match.home : match.away,
  });
  const phases = {
    toss:      { label:"🪙 Toss",           question:"Toss winner & their choice?",        options: tossOptions, cols: 1 },
    powerplay: { label:"💥 Powerplay",       question:"How many runs in the powerplay (6 overs)?", options:["40–49","50–59","60–69","70+"], cols: 2 },
    over:      { label:"⚡ Next Over",        question:"How many runs in the next over?",    options:["0–5","6–9","10–12","13+"], cols: 2 },
    winner:    { label:"🏆 Match Winner",    question:"Who will win the match?",             options:[match.home,match.away], cols: 2 },
  };
  const cp = phases[phase];

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setTimeout(() => {
      setRevealed(true);
      const answer = answers.current[phase];
      const correct = opt === answer;
      const newR = [...results, { phase, correct, pick:opt, answer, delta:correct?10:-5 }];
      setResults(newR);
      setTimeout(() => {
        onResult({ phase, correct, pick:opt, answer, delta:correct?10:-5 });
        const idx = phaseList.indexOf(phase);
        if (idx < phaseList.length-1) { setPhase(phaseList[idx+1]); setSelected(null); setRevealed(false); }
        else onClose(true, newR);
      }, 1200);
    }, 400);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#000000EE",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}}>
      <div style={{background:`linear-gradient(145deg,#07070E,#0D0D18)`,border:`2px solid ${colors.primary}66`,borderRadius:"22px",padding:"1.75rem",maxWidth:"440px",width:"100%",boxShadow:`0 0 80px ${colors.glow}44`,position:"relative"}}>
        <button onClick={()=>onClose(false,[])} style={{position:"absolute",top:"0.9rem",right:"0.9rem",background:"none",border:"none",color:"#4B5563",cursor:"pointer"}}><X size={18}/></button>
        <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.25rem"}}>
          {phaseList.map((p,i)=>(
            <div key={p} style={{flex:1,height:"4px",borderRadius:"2px",background:i<=phaseList.indexOf(phase)?colors.primary:"#2D3748",transition:"background 0.4s"}}/>
          ))}
        </div>
        {/* Match mini-header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"1.25rem",marginBottom:"1rem",padding:"0.75rem",background:"#FFFFFF08",borderRadius:"12px"}}>
          <div style={{textAlign:"center"}}><TeamBadge code={match.home} size={36}/><div style={{color:"#E5E7EB",fontWeight:800,fontSize:"0.85rem",marginTop:"0.2rem"}}>{match.home}</div></div>
          <div style={{color:"#2D3748",fontWeight:900,fontSize:"0.7rem",letterSpacing:"0.1em"}}>VS</div>
          <div style={{textAlign:"center"}}><TeamBadge code={match.away} size={36}/><div style={{color:"#E5E7EB",fontWeight:800,fontSize:"0.85rem",marginTop:"0.2rem"}}>{match.away}</div></div>
        </div>
        <div style={{background:"#FBBF2415",border:"1px solid #FBBF2430",borderRadius:"8px",padding:"0.38rem 0.7rem",marginBottom:"1rem",textAlign:"center"}}>
          <span style={{color:"#FBBF24",fontSize:"0.7rem",fontWeight:600}}>⏳ Results revealed after match ends</span>
        </div>
        <div style={{color:colors.primary,fontSize:"0.72rem",letterSpacing:"0.14em",fontWeight:700,marginBottom:"0.28rem",textTransform:"uppercase"}}>{cp.label}</div>
        <h3 style={{color:"#F9FAFB",fontSize:"1.05rem",fontWeight:700,marginBottom:"1rem",lineHeight:1.3}}>{cp.question}</h3>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${cp.cols},1fr)`,gap:"0.6rem"}}>
          {cp.options.map(opt=>(
            <button key={opt} onClick={()=>handleSelect(opt)} disabled={revealed}
              style={{background:selected===opt?`${colors.primary}44`:"transparent",border:`2px solid ${selected===opt?colors.primary:"#2D3748"}`,borderRadius:"12px",padding:"0.82rem 0.7rem",color:"#F9FAFB",fontSize:cp.cols===1?"0.82rem":"0.88rem",fontWeight:600,cursor:revealed?"default":"pointer",transition:"all 0.2s",boxShadow:selected===opt&&!revealed?`0 0 18px ${colors.glow}44`:"none",transform:selected===opt&&!revealed?"scale(0.97)":"scale(1)",textAlign:"center",lineHeight:1.4}}>
              {opt}
            </button>
          ))}
        </div>
        {revealed&&(
          <div style={{marginTop:"0.85rem",padding:"0.6rem 1rem",borderRadius:"10px",background:"#FFFFFF08",border:"1px solid #2D3748",color:"#6B7280",textAlign:"center",fontSize:"0.8rem"}}>
            🔒 Locked · Score tallied after match ends
          </div>
        )}
        <div style={{display:"flex",gap:"0.4rem",marginTop:"0.85rem",justifyContent:"center"}}>
          {results.map((_,i)=>(
            <div key={i} style={{width:"22px",height:"22px",borderRadius:"50%",background:"#2D3748",border:"1px solid #374151",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:"#4B5563"}}>?</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ match, myTeamKey, colors, onPredict, matchPhase, betsUsed, pendingResults, maxBets }) {
  const [pressed, setPressed] = useState(false);
  const isMyTeam  = match.home===myTeamKey||match.away===myTeamKey;
  const isLive    = matchPhase==="live";
  const isEnded   = matchPhase==="ended"||matchPhase==="completed";
  const isUpcoming= matchPhase==="upcoming";
  const isTbd     = matchPhase==="tbd";
  const alreadyBet= pendingResults[match.id]!==undefined;
  const canBet    = isUpcoming&&!alreadyBet&&betsUsed<maxBets&&!isTbd;
  const hitLimit  = isUpcoming&&!alreadyBet&&betsUsed>=maxBets;
  const typeColors= {IPL:"#F26522",T20WC:"#8B5CF6",T20I:"#F59E0B",ODI:"#10B981",TEST:"#3B82F6"};
  const tc        = typeColors[match.type]||"#6B7280";
  const pending   = pendingResults[match.id];
  const showResult= isEnded&&pending;

  return (
    <div style={{background:isMyTeam?`linear-gradient(135deg,${colors.primary}14,${colors.secondary}07)`:"linear-gradient(135deg,#0C1018,#10161F)",border:isMyTeam?`2px solid ${colors.primary}66`:`1px solid #141C28`,borderRadius:"14px",padding:"0.95rem 1.1rem",boxShadow:isMyTeam?`0 0 24px ${colors.glow}22`:"none",position:"relative",overflow:"hidden"}}>
      {isMyTeam&&<div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${colors.primary},${colors.secondary},transparent)`}}/>}
      {match.series&&<div style={{color:"#2D3748",fontSize:"0.58rem",fontWeight:600,letterSpacing:"0.07em",marginBottom:"0.45rem",textTransform:"uppercase"}}>{match.series}</div>}
      {/* Badges */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem",gap:"0.3rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"0.28rem",flexWrap:"wrap",alignItems:"center"}}>
          {isLive&&<div style={{display:"inline-flex",alignItems:"center",gap:"0.25rem",background:"#dc262618",border:"1px solid #dc2626",borderRadius:"50px",padding:"0.09rem 0.42rem"}}><div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#dc2626",animation:"blink 1.2s ease-in-out infinite"}}/><span style={{color:"#f87171",fontSize:"0.58rem",fontWeight:800,letterSpacing:"0.1em"}}>LIVE NOW</span></div>}
          {isEnded&&<div style={{background:"#2D374815",border:"1px solid #2D3748",borderRadius:"50px",padding:"0.09rem 0.38rem",color:"#4B5563",fontSize:"0.58rem",fontWeight:700}}>⏹ ENDED</div>}
          {isUpcoming&&<div style={{display:"inline-flex",alignItems:"center",gap:"0.18rem",background:"#1A2030",borderRadius:"50px",padding:"0.09rem 0.42rem"}}><Clock size={8} style={{color:"#374151"}}/><span style={{color:"#374151",fontSize:"0.58rem",fontWeight:700}}>UPCOMING</span></div>}
          <div style={{background:`${tc}15`,border:`1px solid ${tc}30`,borderRadius:"4px",padding:"0.06rem 0.35rem",color:tc,fontSize:"0.58rem",fontWeight:800,letterSpacing:"0.06em"}}>{match.type}</div>
          {match.label&&<div style={{background:"#FFD70015",border:"1px solid #FFD70030",borderRadius:"4px",padding:"0.06rem 0.4rem",color:"#FFD700",fontSize:"0.58rem",fontWeight:800}}>{match.label}</div>}
        </div>
        {isMyTeam&&<div style={{background:`linear-gradient(90deg,${colors.primary},${colors.secondary})`,color:"#000",fontSize:"0.55rem",fontWeight:900,padding:"0.09rem 0.44rem",borderRadius:"50px",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>★ MY TEAM</div>}
      </div>
      {/* Teams row */}
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.55rem"}}>
        <div style={{textAlign:"center",minWidth:"50px"}}>
          <TeamBadge code={match.home} size={40}/>
          <div style={{color:match.home===myTeamKey?colors.primary:"#D1D5DB",fontWeight:900,fontSize:"0.88rem",marginTop:"0.15rem"}}>{match.home}</div>
        </div>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{color:"#2D3748",fontWeight:900,fontSize:"0.6rem",letterSpacing:"0.1em"}}>VS</div>
          {isEnded&&match.result&&<div style={{color:"#6EE7B7",fontSize:"0.62rem",fontWeight:600,marginTop:"0.15rem",lineHeight:1.3}}>{match.result}</div>}
          {showResult&&<div style={{marginTop:"0.25rem"}}>{pending.map((p,i)=><div key={i} style={{fontSize:"0.58rem",color:p.correct?"#4ade80":"#f87171",fontWeight:700}}>{p.correct?"✓":"✗"} {p.label}: {p.correct?"+10":"-5"}pts</div>)}</div>}
          {!isEnded&&alreadyBet&&<div style={{color:"#FBBF24",fontSize:"0.58rem",fontWeight:600,marginTop:"0.12rem"}}>🔒 Prediction locked</div>}
          {!isEnded&&!alreadyBet&&<div style={{color:"#2D3748",fontSize:"0.58rem",marginTop:"0.12rem"}}>📍 {match.venue.split(",")[0]}</div>}
        </div>
        <div style={{textAlign:"center",minWidth:"50px"}}>
          <TeamBadge code={match.away} size={40}/>
          <div style={{color:match.away===myTeamKey?colors.primary:"#D1D5DB",fontWeight:900,fontSize:"0.88rem",marginTop:"0.15rem"}}>{match.away}</div>
        </div>
      </div>
      {/* Meta */}
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"0.15rem",marginBottom:canBet||alreadyBet||isLive?"0.7rem":"0"}}>
        <div style={{color:"#374151",fontSize:"0.62rem"}}>{match.date} · {match.time}</div>
        <div style={{color:"#2D3748",fontSize:"0.6rem"}}>📍 {match.venue.split(",")[0]}</div>
      </div>
      {match.note&&!isEnded&&<div style={{color:"#4B5563",fontSize:"0.6rem",marginBottom:"0.45rem"}}>ℹ️ {match.note}</div>}
      {/* CTA */}
      {isTbd&&!isEnded&&<div style={{textAlign:"center",color:"#2D3748",fontSize:"0.7rem",padding:"0.4rem",border:"1px solid #141C28",borderRadius:"8px"}}>Teams confirmed after league stage</div>}
      {canBet&&<button onMouseDown={()=>setPressed(true)} onMouseUp={()=>setPressed(false)} onMouseLeave={()=>setPressed(false)} onClick={()=>onPredict(match)}
        style={{width:"100%",background:isMyTeam?`linear-gradient(90deg,${colors.primary},${colors.secondary})`:"linear-gradient(90deg,#1A2030,#232B3A)",border:"none",borderRadius:"10px",padding:"0.55rem",color:isMyTeam?"#000":"#CBD5E1",fontWeight:800,fontSize:"0.75rem",letterSpacing:"0.1em",cursor:"pointer",textTransform:"uppercase",boxShadow:pressed?"0 1px 0 #00000066":(isMyTeam?`0 5px 0 ${colors.glow}44`:"0 5px 0 #0A0E14"),transform:pressed?"translateY(4px)":"translateY(0)",transition:"transform 0.08s,box-shadow 0.08s"}}>
        <Zap size={11} style={{display:"inline",marginRight:"0.28rem",verticalAlign:"middle"}}/>{isLive?"Predict Live":"Predict Match"}
      </button>}
      {alreadyBet&&!isEnded&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.35rem",padding:"0.45rem",background:"#FBBF2410",border:"1px solid #FBBF2428",borderRadius:"8px",color:"#FBBF24",fontSize:"0.7rem",fontWeight:700}}><Lock size={11}/>Awaiting match result</div>}
      {hitLimit&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.35rem",padding:"0.45rem",background:"#37415110",borderRadius:"8px",color:"#4B5563",fontSize:"0.7rem",fontWeight:700}}><Lock size={11}/>Daily limit reached · 3/3 used</div>}
      {isLive&&!alreadyBet&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.35rem",padding:"0.45rem",background:"#dc262615",border:"1px solid #dc262628",borderRadius:"8px",color:"#f87171",fontSize:"0.7rem",fontWeight:700}}>⛔ Match in progress · Predictions closed</div>}
    </div>
  );
}

// ─── PAGE 1: Dual Team Selection ──────────────────────────────────────────────
function TeamSelection({ onDone }) {
  const [iplPick,  setIplPick]  = useState(null);
  const [intlPick, setIntlPick] = useState(null);
  const [step, setStep] = useState("ipl"); // "ipl" | "intl" | "confirm"

  const iplTeams  = Object.values(TEAMS).filter(t=>t.cat==="IPL");
  const intlTeams = Object.values(TEAMS).filter(t=>t.cat==="INT");

  const handleIPL  = (code) => { setIplPick(code);  setStep("intl"); };
  const handleIntl = (code) => { setIntlPick(code); setStep("confirm"); };
  const handleConfirm = () => onDone(iplPick, intlPick);
  const handleBack = () => { if(step==="intl"){setStep("ipl");setIplPick(null);} else if(step==="confirm"){setStep("intl");setIntlPick(null);} };

  const steps = ["ipl","intl","confirm"];
  const stepIdx = steps.indexOf(step);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#04040B 0%,#080D1A 50%,#04040B 100%)",fontFamily:"'Rajdhani',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"2rem 1rem",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:0.02,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 44px,#fff 44px,#fff 45px),repeating-linear-gradient(90deg,transparent,transparent 44px,#fff 44px,#fff 45px)"}}/>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:"1.5rem",zIndex:1}}>
        <div style={{fontSize:"2.5rem",marginBottom:"0.3rem"}}>🏏</div>
        <h1 style={{fontSize:"clamp(1.7rem,4.5vw,2.8rem)",fontWeight:900,letterSpacing:"0.12em",background:"linear-gradient(90deg,#FFD700,#FF8C00,#FFD700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",textTransform:"uppercase",margin:"0 0 0.2rem"}}>Cricket Oracle</h1>
        <p style={{color:"#2D3748",fontSize:"0.7rem",letterSpacing:"0.16em",textTransform:"uppercase",margin:0}}>IPL 2026 · Bilateral Series · T20 World Cup 2026</p>
        <div style={{width:"38px",height:"2px",background:"linear-gradient(90deg,#FFD700,#FF8C00)",margin:"0.55rem auto 0",borderRadius:"2px"}}/>
      </div>
      {/* Step progress */}
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1.5rem",zIndex:1}}>
        {[{i:0,l:"IPL Team"},{i:1,l:"Country"},{i:2,l:"Confirm"}].map(({i,l})=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <div style={{width:"26px",height:"26px",borderRadius:"50%",background:stepIdx>=i?"linear-gradient(135deg,#FFD700,#FF8C00)":"#141C28",border:`2px solid ${stepIdx>=i?"#FFD700":"#1A2535"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:900,color:stepIdx>=i?"#000":"#374151",flexShrink:0}}>{i+1}</div>
            <span style={{color:stepIdx>=i?"#F9FAFB":"#374151",fontSize:"0.7rem",fontWeight:600,whiteSpace:"nowrap"}}>{l}</span>
            {i<2&&<div style={{width:"24px",height:"2px",background:stepIdx>i?"#FFD700":"#1A2535",borderRadius:"1px"}}/>}
          </div>
        ))}
      </div>

      {step==="ipl"&&(
        <div style={{width:"100%",maxWidth:"900px",zIndex:1}}>
          <div style={{textAlign:"center",marginBottom:"1rem"}}>
            <div style={{color:"#F26522",fontSize:"0.7rem",fontWeight:800,letterSpacing:"0.14em",marginBottom:"0.3rem"}}>STEP 1 OF 2</div>
            <div style={{color:"#F9FAFB",fontSize:"1.2rem",fontWeight:700}}>Choose your IPL Home Team</div>
            <div style={{color:"#374151",fontSize:"0.75rem",marginTop:"0.2rem"}}>This team's colors will theme your IPL view</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"0.7rem"}}>
            {iplTeams.map(t=>{
              const c=t.colors; const hov=iplPick===t.short;
              return (
                <button key={t.short} onClick={()=>handleIPL(t.short)}
                  style={{background:`linear-gradient(135deg,#0D1117,#141C28)`,border:`2px solid ${hov?c.primary:"#1A2030"}`,borderRadius:"14px",padding:"1rem",cursor:"pointer",transition:"all 0.25s",transform:hov?"translateY(-4px) scale(1.02)":"scale(1)",boxShadow:hov?`0 14px 32px ${c.glow}44`:"0 2px 10px #00000055",textAlign:"left",position:"relative"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                    <div style={{width:"48px",height:"48px",flexShrink:0}}>{IPL_LOGO[t.short]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:c.primary,fontSize:"1.05rem",fontWeight:900,letterSpacing:"0.06em"}}>{t.short}</div>
                      <div style={{color:"#6B7280",fontSize:"0.7rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                      {t.captain&&<div style={{color:"#374151",fontSize:"0.62rem",marginTop:"1px"}}>C: {t.captain}</div>}
                    </div>
                    <ChevronRight size={13} style={{color:hov?c.primary:"#1A2030",flexShrink:0}}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step==="intl"&&(
        <div style={{width:"100%",maxWidth:"1050px",zIndex:1}}>
          <div style={{textAlign:"center",marginBottom:"1rem"}}>
            <div style={{color:"#8B5CF6",fontSize:"0.7rem",fontWeight:800,letterSpacing:"0.14em",marginBottom:"0.3rem"}}>STEP 2 OF 2</div>
            <div style={{color:"#F9FAFB",fontSize:"1.2rem",fontWeight:700}}>Choose your International Country</div>
            <div style={{color:"#374151",fontSize:"0.75rem",marginTop:"0.2rem"}}>This country's colors will theme your International view</div>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:"0.75rem"}}>
            <button onClick={handleBack} style={{background:"#141C28",border:"1px solid #1A2535",borderRadius:"8px",padding:"0.4rem 1rem",color:"#6B7280",fontSize:"0.75rem",cursor:"pointer"}}>← Back</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"0.65rem"}}>
            {intlTeams.map(t=>{
              const c=t.colors; const hov=intlPick===t.short;
              return (
                <button key={t.short} onClick={()=>handleIntl(t.short)}
                  style={{background:`linear-gradient(135deg,#0D1117,#141C28)`,border:`2px solid ${hov?c.primary:"#1A2030"}`,borderRadius:"13px",padding:"0.85rem 1rem",cursor:"pointer",transition:"all 0.25s",transform:hov?"translateY(-4px) scale(1.02)":"scale(1)",boxShadow:hov?`0 12px 28px ${c.glow}44`:"0 2px 8px #00000055",textAlign:"left",position:"relative"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.65rem"}}>
                    <div style={{fontSize:"2rem",width:"40px",textAlign:"center",flexShrink:0}}>{FLAG[t.short]||"🏏"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:c.primary,fontSize:"1rem",fontWeight:900,letterSpacing:"0.06em"}}>{t.short}</div>
                      <div style={{color:"#6B7280",fontSize:"0.68rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                      <div style={{color:"#2D3748",fontSize:"0.58rem",fontStyle:"italic",marginTop:"1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{t.tagline}"</div>
                    </div>
                    <ChevronRight size={12} style={{color:hov?c.primary:"#1A2030",flexShrink:0}}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step==="confirm"&&iplPick&&intlPick&&(
        <div style={{width:"100%",maxWidth:"480px",zIndex:1}}>
          <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
            <div style={{color:"#4ade80",fontSize:"0.7rem",fontWeight:800,letterSpacing:"0.14em",marginBottom:"0.3rem"}}>YOUR TEAMS ARE SET!</div>
            <div style={{color:"#F9FAFB",fontSize:"1.2rem",fontWeight:700}}>Ready to predict?</div>
          </div>
          <div style={{display:"flex",gap:"1rem",marginBottom:"1.5rem",flexWrap:"wrap",justifyContent:"center"}}>
            {[
              {code:iplPick,  label:"IPL Home Team",  c:TEAMS[iplPick].colors,  isIPL:true},
              {code:intlPick, label:"International",  c:TEAMS[intlPick].colors, isIPL:false},
            ].map(({code,label,c,isIPL})=>(
              <div key={code} style={{flex:1,minWidth:"180px",background:`linear-gradient(135deg,${c.primary}22,${c.secondary}0E)`,border:`2px solid ${c.primary}55`,borderRadius:"16px",padding:"1.25rem",textAlign:"center",boxShadow:`0 8px 28px ${c.glow}33`}}>
                <div style={{color:c.primary,fontSize:"0.65rem",fontWeight:800,letterSpacing:"0.12em",marginBottom:"0.6rem"}}>{label}</div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:"0.5rem"}}>
                  {isIPL?<div style={{width:"52px",height:"52px"}}>{IPL_LOGO[code]}</div>:<div style={{fontSize:"3rem"}}>{FLAG[code]||"🏏"}</div>}
                </div>
                <div style={{color:c.primary,fontSize:"1.4rem",fontWeight:900,letterSpacing:"0.08em"}}>{code}</div>
                <div style={{color:"#6B7280",fontSize:"0.72rem"}}>{TEAMS[code].name}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:"0.75rem",flexDirection:"column"}}>
            <button onClick={handleConfirm} style={{width:"100%",background:"linear-gradient(90deg,#FFD700,#FF8C00)",border:"none",borderRadius:"12px",padding:"0.85rem",color:"#000",fontWeight:900,fontSize:"1rem",letterSpacing:"0.1em",cursor:"pointer",textTransform:"uppercase",boxShadow:"0 6px 0 #CC7000,0 10px 28px #FFD70033",transform:"translateY(0)",transition:"all 0.08s"}}>
              🚀 Start Predicting!
            </button>
            <button onClick={handleBack} style={{width:"100%",background:"transparent",border:"1px solid #1A2535",borderRadius:"12px",padding:"0.7rem",color:"#4B5563",fontWeight:700,fontSize:"0.85rem",cursor:"pointer"}}>← Change Country</button>
          </div>
        </div>
      )}
      <p style={{color:"#0E1420",fontSize:"0.62rem",marginTop:"2rem",zIndex:1,letterSpacing:"0.1em"}}>20 STARTING PTS · +10 CORRECT · −5 WRONG · 3 PREDICTIONS/DAY</p>
    </div>
  );
}

// ─── PAGE 2: Dual-theme Dashboard ─────────────────────────────────────────────
function Dashboard({ iplTeam, intlTeam, onBack }) {
  const [activeTab, setActiveTab]       = useState("ipl"); // "ipl" | "intl"
  const [points,    setPoints]          = useState(20);
  const [pendingResults, setPending]    = useState({});
  const [resolvedIds, setResolved]      = useState(new Set());
  const [activeMatch, setActiveMatch]   = useState(null);
  const [showConfetti, setConfetti]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [correct, setCorrect]           = useState(0);
  const [total, setTotal]               = useState(0);
  const [tbdOverrides, setTbd]          = useState({});
  const [showTbdEditor, setShowTbd]     = useState(false);
  const [filterType, setFilterType]     = useState("ALL");
  const [now, setNow]                   = useState(new Date());
  const [scorecardMatch, setScorecardMatch] = useState(null);

  const ipl  = TEAMS[iplTeam];
  const intl = TEAMS[intlTeam];
  const colors = activeTab === "ipl" ? ipl.colors : intl.colors;
  const myTeamKey = activeTab === "ipl" ? iplTeam : intlTeam;

  useEffect(() => { const t = setInterval(()=>setNow(new Date()), 30000); return ()=>clearInterval(t); }, []);

  const phase = useCallback((match) => {
    const m = tbdOverrides[match.id] ? { ...match, ...tbdOverrides[match.id] } : match;
    return getMatchPhase(m);
  }, [tbdOverrides, now]);

  const resolveMatch = (m) => tbdOverrides[m.id] ? {...m,...tbdOverrides[m.id]} : m;

  const betsUsed = Object.keys(pendingResults).length;

  // Settle results when match ends
  useEffect(() => {
    Object.entries(pendingResults).forEach(([mid, preds]) => {
      if (resolvedIds.has(mid)) return;
      const m = ALL_MATCHES.find(x=>x.id===mid);
      if (!m) return;
      if (phase(m) === "ended" || phase(m) === "completed") {
        const delta = preds.reduce((s,r)=>s+r.delta,0);
        const cor   = preds.filter(r=>r.correct).length;
        setPoints(p=>p+delta);
        setCorrect(c=>c+cor);
        setTotal(t=>t+preds.length);
        setResolved(prev=>new Set([...prev,mid]));
        if (cor>0) { setConfetti(true); setTimeout(()=>setConfetti(false),4000); }
        setToast({ delta, label:`${m.home} vs ${m.away} result in!` });
        setTimeout(()=>setToast(null),3500);
      }
    });
  }, [now, pendingResults, resolvedIds, phase]);

  const handleModalClose = (done, results) => {
    if (done && activeMatch && results.length) {
      const labels = {toss:"Toss",over:"Next Over",winner:"Match Winner"};
      const preds = results.map(r=>({label:labels[r.phase],correct:r.correct,pick:r.pick,answer:r.answer,delta:r.delta}));
      setPending(prev=>({...prev,[activeMatch.id]:preds}));
    }
    setActiveMatch(null);
  };

  // Separate match pools
  const iplMatches  = ALL_MATCHES.filter(m=>m.type==="IPL");
  const intlMatches = ALL_MATCHES.filter(m=>m.type!=="IPL");
  const wcCompleted = ALL_MATCHES.filter(m=>m.type==="T20WC"&&phase(m)==="completed");
  const pool        = activeTab==="ipl" ? iplMatches : intlMatches.filter(m=>m.type!=="T20WC");

  const applyFilter = (list) => {
    if (filterType==="MY") return list.filter(m=>m.home===myTeamKey||m.away===myTeamKey);
    return list;
  };

  const live    = pool.filter(m=>phase(m)==="live");
  const upcoming= pool.filter(m=>phase(m)==="upcoming"||phase(m)==="tbd");
  const ended   = pool.filter(m=>phase(m)==="ended");

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${colors.bg} 0%,#030308 55%,${colors.bg} 100%)`,fontFamily:"'Rajdhani',sans-serif",color:"#F9FAFB",paddingBottom:"3rem",transition:"background 0.5s"}}>
      <Confetti active={showConfetti}/>
      {toast&&(
        <div style={{position:"fixed",top:"5.5rem",left:"50%",transform:"translateX(-50%)",background:toast.delta>=0?"#16a34a":"#dc2626",color:"#fff",padding:"0.6rem 1.6rem",borderRadius:"50px",fontWeight:800,fontSize:"0.88rem",zIndex:2000,boxShadow:"0 6px 32px #00000077",whiteSpace:"nowrap",animation:"slideDown 0.3s ease"}}>
          {toast.label} {toast.delta>0?`+${toast.delta}`:toast.delta} pts
        </div>
      )}

      {/* Header */}
      <div style={{background:`linear-gradient(90deg,${colors.primary}18,${colors.secondary}0C,${colors.primary}18)`,borderBottom:`1px solid ${colors.primary}28`,padding:"0.8rem 1.1rem",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:"0.5rem",transition:"background 0.5s,border-color 0.5s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
          <button onClick={onBack} style={{background:`${colors.primary}1C`,border:`1px solid ${colors.primary}40`,borderRadius:"8px",padding:"0.3rem 0.6rem",color:colors.primary,cursor:"pointer",display:"flex",alignItems:"center",gap:"0.2rem",fontSize:"0.68rem",fontWeight:700}}>
            <Home size={11}/>Back
          </button>
          {/* Team switcher */}
          <div style={{display:"flex",background:"#0A0E14",borderRadius:"10px",padding:"0.2rem",gap:"0.2rem"}}>
            <button onClick={()=>{setActiveTab("ipl");setFilterType("ALL");}}
              style={{display:"flex",alignItems:"center",gap:"0.35rem",background:activeTab==="ipl"?`linear-gradient(90deg,${ipl.colors.primary},${ipl.colors.secondary})`:"transparent",border:"none",borderRadius:"8px",padding:"0.35rem 0.7rem",color:activeTab==="ipl"?"#000":"#4B5563",fontWeight:800,fontSize:"0.72rem",cursor:"pointer",transition:"all 0.25s",whiteSpace:"nowrap"}}>
              <div style={{width:"18px",height:"18px",borderRadius:"50%",overflow:"hidden",flexShrink:0}}>{IPL_LOGO[iplTeam]}</div>
              {iplTeam}
            </button>
            <button onClick={()=>{setActiveTab("intl");setFilterType("ALL");}}
              style={{display:"flex",alignItems:"center",gap:"0.35rem",background:activeTab==="intl"?`linear-gradient(90deg,${intl.colors.primary},${intl.colors.secondary})`:"transparent",border:"none",borderRadius:"8px",padding:"0.35rem 0.7rem",color:activeTab==="intl"?"#000":"#4B5563",fontWeight:800,fontSize:"0.72rem",cursor:"pointer",transition:"all 0.25s",whiteSpace:"nowrap"}}>
              <span style={{fontSize:"1rem"}}>{FLAG[intlTeam]}</span>
              {intlTeam}
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:"0.45rem",alignItems:"center"}}>
          <div style={{background:"#0A0E14",border:"1px solid #1A2030",borderRadius:"8px",padding:"0.3rem 0.65rem",textAlign:"center"}}>
            <div style={{color:"#2D3748",fontSize:"0.5rem",fontWeight:700,letterSpacing:"0.1em"}}>BETS</div>
            <div style={{color:betsUsed>=3?"#f87171":"#E5E7EB",fontWeight:900,fontSize:"0.85rem",lineHeight:1}}>{betsUsed}/3</div>
          </div>
          <div style={{background:`linear-gradient(135deg,${colors.primary},${colors.secondary})`,borderRadius:"11px",padding:"0.38rem 0.95rem",textAlign:"center",boxShadow:`0 3px 14px ${colors.glow}44`,transition:"background 0.5s"}}>
            <div style={{color:"#00000077",fontSize:"0.5rem",fontWeight:800,letterSpacing:"0.1em"}}>PTS</div>
            <div style={{color:"#000",fontSize:"1.25rem",fontWeight:900,lineHeight:1}}>{points}</div>
          </div>
        </div>
      </div>

      {betsUsed>=3&&<div style={{background:"#F59E0B15",borderBottom:"1px solid #F59E0B28",padding:"0.45rem 1.1rem",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"}}><Lock size={11} style={{color:"#FBBF24"}}/><span style={{color:"#FBBF24",fontSize:"0.72rem",fontWeight:700}}>Daily limit: 3 predictions used · Resets at midnight IST</span></div>}

      {/* Sub-tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #0E1420",background:"#040710",overflowX:"auto"}}>
        {[
          {id:"fixtures", label:`Fixtures (${[...live,...upcoming].length})`,  icon:<Calendar size={11}/>},
          {id:"ended",    label:`Ended (${ended.length})`,                     icon:<CheckCircle size={11}/>},
          ...(activeTab==="intl"?[{id:"wc",label:"WC 2026",icon:<Trophy size={11}/>}]:[]),
          {id:"stats",    label:"Stats",                                        icon:<TrendingUp size={11}/>},
        ].map(t=>(
          <button key={t.id} onClick={()=>setFilterType("ALL")||setActiveTab(prev=>{ setActiveTab(prev); return prev; })||(() => {
            // only update subtab
            document.querySelectorAll("[data-subtab]").forEach(el=>el.setAttribute("data-active","false"));
          })()} data-subtab={t.id}
          // Use a separate state for subtab
          style={{background:"none",border:"none",padding:"0.72rem 0.95rem",color:"#2D3748",borderBottom:"2px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.28rem",fontSize:"0.73rem",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Re-implementing with proper subtab state */}
      <DashboardContent activeTab={activeTab} myTeamKey={myTeamKey} colors={colors} iplTeam={iplTeam} intlTeam={intlTeam} live={live} upcoming={upcoming} ended={ended} wcCompleted={wcCompleted} pool={pool} phase={phase} resolveMatch={resolveMatch} pendingResults={pendingResults} betsUsed={betsUsed} setActiveMatch={setActiveMatch} tbdOverrides={tbdOverrides} setTbd={setTbd} showTbdEditor={showTbdEditor} setShowTbd={setShowTbd} points={points} correct={correct} total={total} ipl={ipl} intl={intl} setScorecardMatch={setScorecardMatch}/>

      {activeMatch&&<PredictionModal match={activeMatch} colors={colors} onClose={handleModalClose} onResult={()=>{}}/>}
      {scorecardMatch&&<ScorecardModal match={scorecardMatch} onClose={()=>setScorecardMatch(null)}/>}
      <style>{`@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.25;transform:scale(0.65)}}@keyframes slideDown{from{opacity:0;transform:translate(-50%,-18px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
}

function DashboardContent({ activeTab, myTeamKey, colors, iplTeam, intlTeam, live, upcoming, ended, wcCompleted, pool, phase, resolveMatch, pendingResults, betsUsed, setActiveMatch, tbdOverrides, setTbd, showTbdEditor, setShowTbd, points, correct, total, ipl, intl, setScorecardMatch }) {
  const [subtab, setSubtab] = useState("fixtures");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => { setSubtab("fixtures"); setFilterType("ALL"); }, [activeTab]);

  const applyFilter = (list) => filterType==="MY" ? list.filter(m=>m.home===myTeamKey||m.away===myTeamKey) : list;

  const subtabs = [
    {id:"fixtures", label:`Fixtures (${[...live,...upcoming].length})`, icon:<Calendar size={11}/>},
    {id:"ended",    label:`Ended (${ended.length})`,                    icon:<CheckCircle size={11}/>},
    ...(activeTab==="intl"?[{id:"wc",label:"T20 WC 2026",icon:<Trophy size={11}/>}]:[]),
    {id:"stats",    label:"Stats",                                       icon:<TrendingUp size={11}/>},
  ];

  return (
    <div>
      <div style={{display:"flex",borderBottom:"1px solid #0E1420",background:"#040710",overflowX:"auto"}}>
        {subtabs.map(t=>(
          <button key={t.id} onClick={()=>setSubtab(t.id)}
            style={{background:"none",border:"none",padding:"0.72rem 0.95rem",color:subtab===t.id?colors.primary:"#2D3748",borderBottom:subtab===t.id?`2px solid ${colors.primary}`:"2px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.28rem",fontSize:"0.73rem",fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"color 0.2s"}}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div style={{padding:"1rem",maxWidth:"880px",margin:"0 auto"}}>
        {/* Filter chip */}
        {(subtab==="fixtures"||subtab==="ended")&&(
          <div style={{display:"flex",gap:"0.3rem",marginBottom:"0.8rem"}}>
            {[["ALL","All Matches"],["MY",`★ ${myTeamKey} matches`]].map(([f,l])=>(
              <button key={f} onClick={()=>setFilterType(f)} style={{background:filterType===f?`${colors.primary}28`:"#0A0E14",border:`1px solid ${filterType===f?colors.primary:"#1A2030"}`,borderRadius:"50px",padding:"0.25rem 0.7rem",color:filterType===f?colors.primary:"#374151",fontSize:"0.7rem",fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>{l}</button>
            ))}
          </div>
        )}

        {subtab==="fixtures"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"0.72rem"}}>
            {live.length>0&&(
              <div>
                <div style={{color:"#f87171",fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.1em",marginBottom:"0.45rem",display:"flex",alignItems:"center",gap:"0.35rem"}}>
                  <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#dc2626",animation:"blink 1.2s ease-in-out infinite"}}/>LIVE NOW
                </div>
                {live.map(m=><MatchCard key={m.id} match={resolveMatch(m)} myTeamKey={myTeamKey} colors={colors} onPredict={setActiveMatch} matchPhase="live" betsUsed={betsUsed} pendingResults={pendingResults} maxBets={3}/>)}
              </div>
            )}
            {applyFilter(upcoming).length===0&&live.length===0?
              <div style={{textAlign:"center",padding:"3rem",color:"#1F2937"}}><div style={{fontSize:"2.8rem",marginBottom:"0.5rem"}}>📅</div><div style={{color:"#374151",fontWeight:700}}>No upcoming fixtures</div></div>
            :
              <div>
                {live.length>0&&applyFilter(upcoming).length>0&&<div style={{color:"#2D3748",fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.1em",margin:"0.3rem 0",textTransform:"uppercase"}}>Upcoming</div>}
                {applyFilter(upcoming).map(m=><MatchCard key={m.id} match={resolveMatch(m)} myTeamKey={myTeamKey} colors={colors} onPredict={setActiveMatch} matchPhase={phase(m)} betsUsed={betsUsed} pendingResults={pendingResults} maxBets={3}/>)}
              </div>
            }
            {activeTab==="ipl"&&(
              <button onClick={()=>setShowTbd(!showTbdEditor)} style={{background:"#0A0E14",border:"1px dashed #1A2030",borderRadius:"10px",padding:"0.5rem",color:"#374151",fontSize:"0.7rem",fontWeight:600,cursor:"pointer",marginTop:"0.3rem"}}>
                ✏️ Update playoff TBD teams
              </button>
            )}
            {showTbdEditor&&activeTab==="ipl"&&(
              <div style={{background:"#0A0E14",border:"1px solid #1A2030",borderRadius:"12px",padding:"1rem"}}>
                <div style={{color:"#6B7280",fontSize:"0.7rem",fontWeight:700,marginBottom:"0.7rem",letterSpacing:"0.1em"}}>UPDATE PLAYOFF TEAMS</div>
                {ALL_MATCHES.filter(m=>m.home==="TBD"||m.away==="TBD").map(m=>(
                  <div key={m.id} style={{marginBottom:"0.65rem",padding:"0.65rem",background:"#0D1117",borderRadius:"8px",border:"1px solid #1A2030"}}>
                    <div style={{color:"#FBBF24",fontSize:"0.68rem",fontWeight:700,marginBottom:"0.4rem"}}>{m.label||m.date}</div>
                    <div style={{display:"flex",gap:"0.45rem"}}>
                      <input placeholder="Home (e.g. MI)" defaultValue={tbdOverrides[m.id]?.home||""} onBlur={e=>setTbd(p=>({...p,[m.id]:{...p[m.id],home:e.target.value.toUpperCase()}}))}
                        style={{flex:1,background:"#161E2C",border:"1px solid #2D3748",borderRadius:"6px",padding:"0.32rem 0.55rem",color:"#E5E7EB",fontSize:"0.75rem"}}/>
                      <input placeholder="Away (e.g. CSK)" defaultValue={tbdOverrides[m.id]?.away||""} onBlur={e=>setTbd(p=>({...p,[m.id]:{...p[m.id],away:e.target.value.toUpperCase()}}))}
                        style={{flex:1,background:"#161E2C",border:"1px solid #2D3748",borderRadius:"6px",padding:"0.32rem 0.55rem",color:"#E5E7EB",fontSize:"0.75rem"}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subtab==="ended"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"0.72rem"}}>
            {applyFilter(ended).length===0?
              <div style={{textAlign:"center",padding:"3rem",color:"#1F2937"}}><div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>⏹</div><div style={{color:"#374151",fontWeight:700}}>No ended matches yet</div></div>
            :applyFilter(ended).map(m=><MatchCard key={m.id} match={resolveMatch(m)} myTeamKey={myTeamKey} colors={colors} onPredict={()=>{}} matchPhase="ended" betsUsed={betsUsed} pendingResults={pendingResults} maxBets={3}/>)}
          </div>
        )}

        {subtab==="wc"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"0.72rem"}}>
            <div style={{background:"linear-gradient(90deg,#8B5CF618,#6D28D910)",border:"1px solid #8B5CF630",borderRadius:"10px",padding:"0.55rem 1rem",textAlign:"center"}}>
              <div style={{color:"#A78BFA",fontWeight:700,fontSize:"0.78rem"}}>🏆 T20 WC 2026 · India & Sri Lanka co-hosts · <span style={{color:"#FCD34D"}}>India beat NZ by 96 runs in Final (Mar 8)</span></div>
            </div>
            {/* Group headers + match cards with scorecard button */}
            {(()=>{
              let lastGroup = null;
              return wcCompleted.map(m=>{
                const grp = m.series.split("·")[1]?.trim() || "";
                const showHeader = grp !== lastGroup;
                if (showHeader) lastGroup = grp;
                return (
                  <div key={m.id}>
                    {showHeader && (
                      <div style={{color:"#6B7280",fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.15em",padding:"0.3rem 0.25rem 0.1rem",marginTop:"0.3rem"}}>{grp.toUpperCase()}</div>
                    )}
                    <div style={{background:"#0B0F1A",border:"1px solid #1A2535",borderRadius:"12px",overflow:"hidden"}}>
                      <div style={{padding:"0.6rem 0.85rem",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:"#374151",fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.08em",marginBottom:"0.15rem"}}>{m.date} · {m.venue}</div>
                          <div style={{color:"#F9FAFB",fontWeight:900,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.35rem"}}>
                            <span>{FLAG[m.home]||""}</span><span>{m.home}</span>
                            <span style={{color:"#374151",fontWeight:400,fontSize:"0.75rem"}}>vs</span>
                            <span>{FLAG[m.away]||""}</span><span>{m.away}</span>
                          </div>
                          {m.scorecard && (
                            <div style={{color:"#9CA3AF",fontSize:"0.7rem",marginTop:"0.2rem",display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
                              <span style={{color:"#93C5FD",fontWeight:700}}>{m.scorecard.inn1.team} {m.scorecard.inn1.score}</span>
                              <span style={{color:"#6B7280"}}>vs</span>
                              <span style={{color:"#FCA5A5",fontWeight:700}}>{m.scorecard.inn2.team} {m.scorecard.inn2.score!=="N/A"?m.scorecard.inn2.score:"—"}</span>
                            </div>
                          )}
                          <div style={{color:"#FCD34D",fontSize:"0.72rem",fontWeight:700,marginTop:"0.2rem"}}>{m.result}</div>
                        </div>
                        {m.scorecard && (
                          <button onClick={()=>setScorecardMatch(m)} style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",border:"none",borderRadius:"8px",padding:"0.4rem 0.75rem",color:"#fff",fontSize:"0.68rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:"0.05em",flexShrink:0}}>
                            📋 Scorecard
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {subtab==="stats"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"0.9rem"}}>
            <div style={{background:`linear-gradient(135deg,${colors.primary}1A,${colors.secondary}0A)`,border:`2px solid ${colors.primary}33`,borderRadius:"16px",padding:"1.5rem",textAlign:"center"}}>
              <div style={{fontSize:"3.5rem",fontWeight:900,color:colors.primary,lineHeight:1}}>{points}</div>
              <div style={{color:"#374151",fontSize:"0.75rem",letterSpacing:"0.15em",marginTop:"0.25rem"}}>TOTAL POINTS</div>
              <div style={{display:"flex",justifyContent:"center",gap:"0.6rem",marginTop:"1rem",flexWrap:"wrap"}}>
                {[{l:"Start",v:20,i:<Star size={10}/>},{l:"Bets",v:`${betsUsed}/3`,i:<Zap size={10}/>},{l:"Correct",v:correct,i:<Award size={10}/>},{l:"Accuracy",v:`${total>0?Math.round((correct/total)*100):0}%`,i:<TrendingUp size={10}/>}].map(s=>(
                  <div key={s.l} style={{background:"#08090E",borderRadius:"9px",padding:"0.55rem 0.75rem",border:"1px solid #141C28",minWidth:"62px"}}>
                    <div style={{color:colors.primary,fontSize:"0.95rem",fontWeight:900}}>{s.v}</div>
                    <div style={{color:"#2D3748",fontSize:"0.58rem",display:"flex",alignItems:"center",gap:"0.15rem",marginTop:"0.1rem"}}>{s.i}{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Both team cards */}
            <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
              {[{code:iplTeam,t:ipl,isIPL:true,label:"IPL"},{code:intlTeam,t:intl,isIPL:false,label:"Intl"}].map(({code,t,isIPL,label})=>(
                <div key={code} style={{flex:1,minWidth:"160px",background:`linear-gradient(90deg,${t.colors.primary},${t.colors.secondary})`,borderRadius:"12px",padding:"0.9rem 1.1rem",display:"flex",alignItems:"center",gap:"0.75rem",opacity:activeTab===(isIPL?"ipl":"intl")?1:0.55,transition:"opacity 0.3s"}}>
                  <div style={{flexShrink:0}}>{isIPL?<div style={{width:"40px",height:"40px"}}>{IPL_LOGO[code]}</div>:<div style={{fontSize:"2.2rem"}}>{FLAG[code]}</div>}</div>
                  <div>
                    <div style={{color:"#00000066",fontSize:"0.58rem",fontWeight:800,letterSpacing:"0.1em"}}>{label} HOME TEAM</div>
                    <div style={{color:"#000",fontWeight:900,fontSize:"0.9rem"}}>{t.name}</div>
                    {t.captain&&<div style={{color:"#00000055",fontSize:"0.65rem"}}>C: {t.captain}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#08090E",borderRadius:"12px",padding:"1rem",border:"1px solid #0E1420"}}>
              <div style={{color:"#2D3748",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.75rem",fontWeight:700}}>RULES</div>
              {[["⏰","Only predict BEFORE match starts"],["🔒","Predictions close at match start"],["⏳","Scores shown only after match ends"],["📅","Max 3 predictions per day"],["🪙","Toss · ⚡ Over · 🏆 Winner — 3 questions each"],["✓","+10 correct · −5 wrong"]].map(([ic,tx],i,a)=>(
                <div key={i} style={{display:"flex",gap:"0.6rem",padding:"0.38rem 0",borderBottom:i<a.length-1?"1px solid #0E1420":"none",alignItems:"flex-start"}}>
                  <span style={{fontSize:"0.88rem",width:"18px",textAlign:"center",flexShrink:0,marginTop:"0.05rem"}}>{ic}</span>
                  <span style={{color:"#4B5563",fontSize:"0.78rem",lineHeight:1.4}}>{tx}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scorecard Modal ──────────────────────────────────────────────────────────
function ScorecardModal({ match, onClose }) {
  if (!match || !match.scorecard) return null;
  const { inn1, inn2 } = match.scorecard;
  const isRain = match.result && match.result.toLowerCase().includes("rain") || match.result === "N/A";

  const InningsPanel = ({ inn, label, isWinner }) => (
    <div style={{background: isWinner ? "#0A1628" : "#06090F", border: `1px solid ${isWinner ? "#1A56DB44" : "#0E1420"}`, borderRadius:"12px", overflow:"hidden", flex:1, minWidth:"0"}}>
      {/* Header */}
      <div style={{background: isWinner ? "linear-gradient(90deg,#1A56DB22,#1A56DB08)" : "#0B0F1A", padding:"0.65rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${isWinner?"#1A56DB33":"#0E1420"}`}}>
        <div style={{display:"flex", alignItems:"center", gap:"0.5rem"}}>
          <div style={{fontSize:"1.3rem"}}>{FLAG[inn.team] || "🏏"}</div>
          <div>
            <div style={{color:isWinner?"#93C5FD":"#6B7280", fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.12em"}}>{label}</div>
            <div style={{color:"#F9FAFB", fontWeight:900, fontSize:"0.95rem"}}>{inn.team}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color: isWinner?"#FCD34D":"#9CA3AF", fontWeight:900, fontSize:"1.4rem", lineHeight:1}}>{inn.score==="N/A"?"—":inn.score}</div>
          {inn.overs!=="0"&&inn.score!=="N/A"&&<div style={{color:"#4B5563", fontSize:"0.62rem"}}>({inn.overs} ov)</div>}
        </div>
      </div>

      {inn.score !== "N/A" && inn.overs !== "0" && (
        <div style={{padding:"0.6rem 1rem"}}>
          {/* Top Batters */}
          {inn.top && inn.top.length > 0 && (
            <div style={{marginBottom:"0.5rem"}}>
              <div style={{color:"#374151", fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.1em", marginBottom:"0.3rem"}}>🏏 TOP BATTERS</div>
              {inn.top.map((p,i) => (
                <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.22rem 0", borderBottom:"1px solid #0E142088"}}>
                  <div style={{color:"#D1D5DB", fontSize:"0.75rem", fontWeight:p.r>=50?700:400}}>
                    {p.n} {p.r>=100?"💯":p.r>=50?"⭐":""}
                  </div>
                  <div style={{display:"flex", gap:"0.5rem", alignItems:"center"}}>
                    <span style={{color: p.r>=50?"#FCD34D":"#9CA3AF", fontWeight:900, fontSize:"0.82rem"}}>{p.r}</span>
                    <span style={{color:"#374151", fontSize:"0.65rem"}}>({p.b}b)</span>
                    <span style={{color:"#4B5563", fontSize:"0.65rem", minWidth:"48px", textAlign:"right"}}>
                      {p.b>0 ? `SR ${((p.r/p.b)*100).toFixed(0)}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Top Bowlers */}
          {inn.topBowl && inn.topBowl.length > 0 && (
            <div>
              <div style={{color:"#374151", fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.1em", marginBottom:"0.3rem"}}>🎯 TOP BOWLERS</div>
              {inn.topBowl.filter(b=>b.w>0||b.r<20).map((p,i) => (
                <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.22rem 0", borderBottom:"1px solid #0E142088"}}>
                  <div style={{color:"#D1D5DB", fontSize:"0.75rem", fontWeight:p.w>=3?700:400}}>
                    {p.n} {p.w>=4?"🔥":p.w>=3?"⭐":""}
                  </div>
                  <div style={{display:"flex", gap:"0.5rem", alignItems:"center"}}>
                    <span style={{color: p.w>=3?"#F87171":"#9CA3AF", fontWeight:900, fontSize:"0.82rem"}}>{p.w}/{p.r}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {(inn.score==="N/A"||inn.overs==="0") && (
        <div style={{padding:"1rem", textAlign:"center", color:"#374151", fontSize:"0.75rem"}}>🌧 Match abandoned (rain)</div>
      )}
    </div>
  );

  // Figure out winner from result string to highlight correct inning
  const inn1Wins = match.result && (match.result.startsWith(inn1.team) || match.result.includes(inn1.team+" won"));
  const inn2Wins = match.result && (match.result.startsWith(inn2.team) || match.result.includes(inn2.team+" won"));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"1rem",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0B0F1A",border:"1px solid #1A2535",borderRadius:"20px",width:"100%",maxWidth:"640px",overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",marginTop:"0.5rem"}}>
        {/* Modal header */}
        <div style={{background:"linear-gradient(90deg,#8B5CF622,#6D28D910)",borderBottom:"1px solid #1A2535",padding:"0.9rem 1.1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#A78BFA",fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.14em"}}>{match.series}</div>
            <div style={{color:"#F9FAFB",fontWeight:900,fontSize:"1.05rem",marginTop:"0.15rem"}}>
              {FLAG[match.home]||""} {match.home} vs {match.away} {FLAG[match.away]||""}
            </div>
            <div style={{color:"#4B5563",fontSize:"0.65rem",marginTop:"0.15rem"}}>📅 {match.date} · 📍 {match.venue}</div>
          </div>
          <button onClick={onClose} style={{background:"#141C28",border:"1px solid #1A2535",borderRadius:"50%",width:"32px",height:"32px",color:"#9CA3AF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>✕</button>
        </div>
        {/* Result banner */}
        <div style={{background:"linear-gradient(90deg,#7C3AED22,#8B5CF611)",borderBottom:"1px solid #1A2535",padding:"0.55rem 1.1rem",textAlign:"center"}}>
          <span style={{color:"#FCD34D",fontWeight:900,fontSize:"0.9rem"}}>{match.result}</span>
        </div>
        {/* Innings */}
        <div style={{padding:"0.9rem 1rem",display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
          <InningsPanel inn={inn1} label="1ST INNINGS" isWinner={!!inn1Wins}/>
          <InningsPanel inn={inn2} label="2ND INNINGS" isWinner={!!inn2Wins}/>
        </div>
        <div style={{padding:"0 1rem 0.9rem",textAlign:"center",color:"#1F2937",fontSize:"0.6rem"}}>Stats are indicative highlights · Full scorecards on ESPNcricinfo</div>
      </div>
    </div>
  );
}

// ─── Cricket Quiz Gate ────────────────────────────────────────────────────────
function QuizGate({ onPass }) {
  const [picked, setPicked]   = useState(null);   // null | "batsman" | "bowler"
  const [shaking, setShaking] = useState(false);
  const [passed, setPassed]   = useState(false);

  const handlePick = (ans) => {
    if (picked) return;
    setPicked(ans);
    if (ans === "batsman") {
      setTimeout(() => { setPassed(true); setTimeout(onPass, 900); }, 600);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 700);
    }
  };

  const retry = () => { setPicked(null); setShaking(false); };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#04040B 0%,#080D1A 50%,#04040B 100%)",fontFamily:"'Rajdhani',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1rem",position:"relative",overflow:"hidden"}}>
      {/* bg grid */}
      <div style={{position:"absolute",inset:0,opacity:0.02,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 44px,#fff 44px,#fff 45px),repeating-linear-gradient(90deg,transparent,transparent 44px,#fff 44px,#fff 45px)"}}/>

      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:"2rem",zIndex:1}}>
        <div style={{fontSize:"3rem",marginBottom:"0.4rem"}}>🏏</div>
        <h1 style={{fontSize:"clamp(1.7rem,4.5vw,2.8rem)",fontWeight:900,letterSpacing:"0.12em",background:"linear-gradient(90deg,#FFD700,#FF8C00,#FFD700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",textTransform:"uppercase",margin:"0 0 0.2rem"}}>Cricket Oracle</h1>
        <p style={{color:"#374151",fontSize:"0.7rem",letterSpacing:"0.16em",textTransform:"uppercase",margin:0}}>Quick Cricket Check</p>
        <div style={{width:"38px",height:"2px",background:"linear-gradient(90deg,#FFD700,#FF8C00)",margin:"0.55rem auto 0",borderRadius:"2px"}}/>
      </div>

      {/* Card */}
      <div style={{
        background:"linear-gradient(145deg,#0A0E1A,#0F1525)",
        border:"1px solid #1A2535",
        borderRadius:"20px",
        padding:"2rem",
        maxWidth:"420px",
        width:"100%",
        zIndex:1,
        boxShadow:"0 20px 60px #00000077",
        animation: shaking ? "shake 0.5s ease" : passed ? "none" : "none",
      }}>
        {/* Virat image placeholder — big emoji */}
        <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
          <div style={{fontSize:"5rem",lineHeight:1}}>🧢</div>
          <div style={{color:"#9CA3AF",fontSize:"0.75rem",marginTop:"0.4rem",letterSpacing:"0.06em"}}>Before you enter…</div>
        </div>

        <h2 style={{color:"#F9FAFB",fontSize:"1.3rem",fontWeight:800,textAlign:"center",marginBottom:"0.4rem",lineHeight:1.4}}>
          Is Virat Kohli a <span style={{color:"#FFD700"}}>Batsman</span> or a <span style={{color:"#f87171"}}>Bowler</span>?
        </h2>
        <p style={{color:"#4B5563",fontSize:"0.78rem",textAlign:"center",marginBottom:"1.5rem"}}>
          Answer correctly to enter the app 🔐
        </p>

        {/* Blocked state */}
        {picked === "bowler" && (
          <div style={{marginBottom:"1.25rem"}}>
            <div style={{background:"#dc262620",border:"2px solid #dc2626",borderRadius:"14px",padding:"1.25rem",textAlign:"center",animation:"fadeIn 0.4s ease"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>🚫</div>
              <div style={{color:"#f87171",fontWeight:900,fontSize:"1.1rem",marginBottom:"0.3rem"}}>Sorry, you can't use the app!</div>
              <div style={{color:"#6B7280",fontSize:"0.8rem",lineHeight:1.5}}>
                Virat Kohli is one of the greatest <strong style={{color:"#f87171"}}>batsmen</strong> of all time. 
                You may need to brush up on your cricket knowledge first! 🏏
              </div>
              <button onClick={retry} style={{marginTop:"1rem",background:"#374151",border:"1px solid #4B5563",borderRadius:"8px",padding:"0.5rem 1.25rem",color:"#D1D5DB",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",letterSpacing:"0.06em"}}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Pass state */}
        {passed && (
          <div style={{marginBottom:"1.25rem"}}>
            <div style={{background:"#16a34a20",border:"2px solid #16a34a",borderRadius:"14px",padding:"1.25rem",textAlign:"center",animation:"fadeIn 0.4s ease"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"0.4rem"}}>🎉</div>
              <div style={{color:"#4ade80",fontWeight:900,fontSize:"1.1rem"}}>Correct! Welcome in!</div>
            </div>
          </div>
        )}

        {/* Choices — only show if not blocked and not passed */}
        {!passed && picked !== "bowler" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem"}}>
            <button onClick={()=>handlePick("batsman")}
              style={{background:"linear-gradient(135deg,#16a34a22,#16a34a11)",border:"2px solid #16a34a55",borderRadius:"14px",padding:"1.25rem 0.75rem",cursor:"pointer",transition:"all 0.2s",color:"#F9FAFB",boxShadow:"0 4px 0 #16a34a44",transform:"translateY(0)"}}>
              <div style={{fontSize:"2.2rem",marginBottom:"0.4rem"}}>🏏</div>
              <div style={{fontWeight:900,fontSize:"1rem",color:"#4ade80"}}>Batsman</div>
              <div style={{color:"#4B5563",fontSize:"0.7rem",marginTop:"0.15rem"}}>Scores runs</div>
            </button>
            <button onClick={()=>handlePick("bowler")}
              style={{background:"linear-gradient(135deg,#dc262622,#dc262611)",border:"2px solid #dc262644",borderRadius:"14px",padding:"1.25rem 0.75rem",cursor:"pointer",transition:"all 0.2s",color:"#F9FAFB",boxShadow:"0 4px 0 #dc262644",transform:"translateY(0)"}}>
              <div style={{fontSize:"2.2rem",marginBottom:"0.4rem"}}>🤾</div>
              <div style={{fontWeight:900,fontSize:"1rem",color:"#f87171"}}>Bowler</div>
              <div style={{color:"#4B5563",fontSize:"0.7rem",marginTop:"0.15rem"}}>Takes wickets</div>
            </button>
          </div>
        )}
      </div>

      <p style={{color:"#0E1420",fontSize:"0.62rem",marginTop:"1.5rem",zIndex:1,letterSpacing:"0.1em"}}>CRICKET ORACLE · ALL 30 TEAMS · 2026</p>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-10px)}
          30%{transform:translateX(10px)}
          45%{transform:translateX(-8px)}
          60%{transform:translateX(8px)}
          75%{transform:translateX(-5px)}
          90%{transform:translateX(5px)}
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [quizPassed, setQuizPassed] = useState(false);
  const [teams, setTeams]           = useState(null);

  if (!quizPassed) return <QuizGate onPass={() => setQuizPassed(true)} />;
  if (!teams)      return <TeamSelection onDone={(ipl,intl) => setTeams({ipl,intl})} />;
  return <Dashboard iplTeam={teams.ipl} intlTeam={teams.intl} onBack={() => setTeams(null)} />;
}
