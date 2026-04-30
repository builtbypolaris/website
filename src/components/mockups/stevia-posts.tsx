// ─────────────────────────────────────────────────────────────────
//  Stevia Cookies — 12 Instagram Post Components  (1080 × 1350 px)
// ─────────────────────────────────────────────────────────────────

// ── Design tokens (matches website) ──────────────────────────────
const C = {
  brown:      '#6B4226',
  brownDark:  '#4A2E1A',
  brownDeep:  '#3a2210',
  brownMid:   '#5c3820',
  cream:      '#FFF9F0',
  creamDark:  '#F0E4D3',
  creamMid:   '#f5ede0',
  gold:       '#C9A96E',
  goldDark:   '#A68B4B',
  caramel:    '#c8853a',
  caramel2:   '#a86a28',
  caramel3:   '#e8b078',
} as const

const SERIF  = '"Cormorant Garamond", Georgia, serif'
const SANS   = '"Poppins", system-ui, sans-serif'

// ── Shared decorative primitives ─────────────────────────────────

function BrandMark({ dark = true }: { dark?: boolean }) {
  const txt = dark ? C.gold       : C.goldDark
  const sub = dark ? 'rgba(255,249,240,.4)' : 'rgba(107,66,38,.45)'
  const line = dark ? 'rgba(201,169,110,.5)' : 'rgba(166,139,75,.4)'
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
        <div style={{ width:44, height:1, background:line }} />
        <span style={{ fontFamily:SANS, fontSize:15, letterSpacing:7, textTransform:'uppercase', color:txt, fontWeight:300 }}>
          Stevia Cookies
        </span>
        <div style={{ width:44, height:1, background:line }} />
      </div>
      <div style={{ fontFamily:SANS, fontSize:12, letterSpacing:5, textTransform:'uppercase', color:sub, marginTop:7, fontWeight:300 }}>
        Bandung
      </div>
    </div>
  )
}

function GoldRule({ width = 56 }: { width?: number }) {
  return (
    <div style={{ width, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)`, margin:'0 auto' }} />
  )
}

interface CornerProps { pos:'tl'|'tr'|'bl'|'br'; offset?: number; size?: number; dark?: boolean }
function Corner({ pos, offset = 52, size = 28, dark = true }: CornerProps) {
  const clr = dark ? 'rgba(201,169,110,.55)' : 'rgba(166,139,75,.4)'
  const s: React.CSSProperties = { position:'absolute', width:size, height:size }
  if (pos==='tl') { s.top=offset; s.left=offset }
  if (pos==='tr') { s.top=offset; s.right=offset }
  if (pos==='bl') { s.bottom=offset; s.left=offset }
  if (pos==='br') { s.bottom=offset; s.right=offset }
  return (
    <svg style={s} viewBox="0 0 28 28" fill="none">
      {pos==='tl' && <><line x1="0" y1="0" x2="18" y2="0"  stroke={clr} strokeWidth="1.5"/><line x1="0" y1="0" x2="0" y2="18"  stroke={clr} strokeWidth="1.5"/></>}
      {pos==='tr' && <><line x1="28" y1="0" x2="10" y2="0" stroke={clr} strokeWidth="1.5"/><line x1="28" y1="0" x2="28" y2="18" stroke={clr} strokeWidth="1.5"/></>}
      {pos==='bl' && <><line x1="0" y1="28" x2="18" y2="28" stroke={clr} strokeWidth="1.5"/><line x1="0" y1="28" x2="0" y2="10"  stroke={clr} strokeWidth="1.5"/></>}
      {pos==='br' && <><line x1="28" y1="28" x2="10" y2="28" stroke={clr} strokeWidth="1.5"/><line x1="28" y1="28" x2="28" y2="10" stroke={clr} strokeWidth="1.5"/></>}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 01 — Kastengel Hero  (real photo)
// ─────────────────────────────────────────────────────────────────
export function Post01() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.brownDark, fontFamily:SANS }}>
      <img
        src="/images/Kastengel.jpeg"
        crossOrigin="anonymous"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
      />
      {/* top fade */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'38%', background:'linear-gradient(to bottom,rgba(58,34,16,.72) 0%,transparent 100%)' }} />
      {/* bottom fade */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'52%', background:'linear-gradient(to top,rgba(58,34,16,.94) 0%,rgba(58,34,16,.55) 45%,transparent 100%)' }} />

      {/* Top brand mark */}
      <div style={{ position:'absolute', top:60, left:0, right:0 }}>
        <BrandMark dark />
      </div>

      {/* Bottom content */}
      <div style={{ position:'absolute', bottom:80, left:90, right:90 }}>
        <div style={{ fontSize:15, letterSpacing:7, textTransform:'uppercase', color:C.gold, fontWeight:400, marginBottom:20 }}>
          Product Hero
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:100, color:C.cream, lineHeight:1, marginBottom:26 }}>
          Kastengel
        </div>
        <GoldRule width={56} />
        <div style={{ marginTop:22, fontSize:23, fontWeight:300, color:'rgba(255,249,240,.82)', letterSpacing:.3, lineHeight:1.75 }}>
          Kue kering gurih keju, tanpa gula rafinasi.<br />
          Manis yang tulus, dari dapur kami untukmu.
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 02 — Made From Scratch  (ingredient flat lay, SVG)
// ─────────────────────────────────────────────────────────────────
export function Post02() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.cream, fontFamily:SANS }}>
      {/* Linen grid texture */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`linear-gradient(rgba(240,228,211,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(240,228,211,.4) 1px,transparent 1px)`,
        backgroundSize:'14px 14px',
      }} />

      {/* SVG illustration */}
      <svg style={{ position:'absolute', inset:0 }} width={1080} height={1350} viewBox="0 0 1080 1350">

        {/* ── Flour pile (upper-left) ── */}
        <ellipse cx="195" cy="285" rx="130" ry="75" fill="white" opacity="0.96"/>
        <ellipse cx="195" cy="260" rx="108" ry="58" fill="white"/>
        <text x="195" y="318" textAnchor="middle" fontFamily="Poppins" fontSize="19" fill={C.goldDark} letterSpacing="4">TEPUNG</text>

        {/* ── Butter block (upper-right) ── */}
        <rect x="740" y="215" width="225" height="115" rx="6" fill="#F5D080" stroke="#D8B050" strokeWidth="1.5"/>
        <rect x="754" y="228" width="197" height="89" rx="4" fill="#F9DD96" opacity="0.65"/>
        <text x="852" y="282" textAnchor="middle" fontFamily="Poppins" fontSize="18" fill={C.brownMid} letterSpacing="4">BUTTER</text>

        {/* ── Stevia packet (centre) ── */}
        <rect x="432" y="370" width="130" height="185" rx="9" fill={C.brown} stroke={C.brownDark} strokeWidth="1.5"/>
        <rect x="447" y="386" width="100" height="153" rx="5" fill="rgba(255,249,240,.93)"/>
        <text x="497" y="444" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="30" fill={C.brownDeep}>stevia</text>
        <line x1="456" y1="453" x2="538" y2="453" stroke={C.gold} strokeWidth="1"/>
        <text x="497" y="473" textAnchor="middle" fontFamily="Poppins" fontSize="12" fill={C.brown} letterSpacing="3">NATURAL</text>
        <text x="497" y="495" textAnchor="middle" fontFamily="Poppins" fontSize="12" fill={C.brown} letterSpacing="3">SWEETENER</text>
        <line x1="456" y1="505" x2="538" y2="505" stroke={C.gold} strokeWidth="0.8" opacity="0.5"/>
        <text x="497" y="524" textAnchor="middle" fontFamily="Poppins" fontSize="10" fill={C.caramel2} letterSpacing="2">BANDUNG</text>

        {/* ── Aloe vera leaves (left side) ── */}
        <ellipse cx="88" cy="640" rx="32" ry="105" fill="#6A9850" opacity="0.72" transform="rotate(-18 88 640)"/>
        <ellipse cx="93" cy="655" rx="20" ry="80" fill="#8AB870" opacity="0.55" transform="rotate(-18 93 655)"/>
        <ellipse cx="130" cy="575" rx="28" ry="88" fill="#5E8A44" opacity="0.68" transform="rotate(12 130 575)"/>
        <ellipse cx="130" cy="578" rx="18" ry="67" fill="#7AAA60" opacity="0.5" transform="rotate(12 130 578)"/>
        <text x="100" y="772" textAnchor="middle" fontFamily="Poppins" fontSize="17" fill="#6A9850" letterSpacing="3" opacity="0.9">LIDAH BUAYA</text>

        {/* ── Wooden spoon (diagonal centre-right) ── */}
        <g transform="rotate(38 650 640)">
          <rect x="638" y="440" width="24" height="210" rx="12" fill="#C8904A" stroke="#A87030" strokeWidth="1.5"/>
          <ellipse cx="650" cy="436" rx="42" ry="22" fill="#D4A060" stroke="#A87030" strokeWidth="1.5"/>
          <ellipse cx="650" cy="432" rx="30" ry="13" fill="#E0B070" opacity="0.5"/>
        </g>

        {/* ── Eggs (lower-left) ── */}
        <ellipse cx="175" cy="960" rx="65" ry="85" fill="#F8EAD8" stroke="#E8D0B0" strokeWidth="1.5"/>
        <ellipse cx="175" cy="942" rx="52" ry="66" fill="white" opacity="0.6"/>
        <ellipse cx="290" cy="985" rx="58" ry="76" fill="#F8EAD8" stroke="#E8D0B0" strokeWidth="1.5"/>
        <ellipse cx="290" cy="968" rx="46" ry="59" fill="white" opacity="0.6"/>
        <text x="232" y="1088" textAnchor="middle" fontFamily="Poppins" fontSize="18" fill={C.goldDark} letterSpacing="4">TELUR</text>

        {/* ── Cheese block (lower-right) ── */}
        <rect x="768" y="852" width="218" height="125" rx="6" fill="#F0D060" stroke="#D4B040" strokeWidth="1.5"/>
        <rect x="782" y="866" width="190" height="97" rx="4" fill="#F6D870" opacity="0.6"/>
        <text x="877" y="924" textAnchor="middle" fontFamily="Poppins" fontSize="18" fill={C.brownMid} letterSpacing="4">KEJU</text>
        {/* shavings */}
        <ellipse cx="662" cy="876" rx="25" ry="11" fill="#F0D060" opacity="0.8" transform="rotate(-22 662 876)"/>
        <ellipse cx="700" cy="840" rx="20" ry="9"  fill="#E8C850" opacity="0.75" transform="rotate(14 700 840)"/>
        <ellipse cx="690" cy="970" rx="22" ry="10" fill="#F0D060" opacity="0.78" transform="rotate(-38 690 970)"/>
        <ellipse cx="730" cy="950" rx="18" ry="8"  fill="#E8C850" opacity="0.7"  transform="rotate(28 730 950)"/>

        {/* ── Stevia sprig (top-right corner) ── */}
        <g transform="translate(960,100)">
          <path d="M0,0 Q-14,-38 -10,-76" fill="none" stroke="#8a6a3a" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="-18" cy="-44" rx="14" ry="7" fill="#a8844a" opacity="0.65" transform="rotate(-38 -18 -44)"/>
          <ellipse cx="-7" cy="-68" rx="13" ry="6" fill="#8a6a3a" opacity="0.65" transform="rotate(22 -7 -68)"/>
          <ellipse cx="-22" cy="-68" rx="11" ry="6" fill="#a8844a" opacity="0.6"  transform="rotate(-54 -22 -68)"/>
        </g>
      </svg>

      {/* ── Title card (bottom) ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0,
        padding:'52px 90px 64px',
        background:'linear-gradient(to top, rgba(255,249,240,1) 0%, rgba(255,249,240,0.97) 60%, transparent 100%)',
        textAlign:'center',
      }}>
        <div style={{ fontSize:14, letterSpacing:6, textTransform:'uppercase', color:C.goldDark, fontWeight:400, marginBottom:16 }}>
          Post 02 · Ingredient Lay
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:62, color:C.brown, lineHeight:1.1, marginBottom:20 }}>
          Made From Scratch
        </div>
        <GoldRule width={52} />
        <div style={{ marginTop:18, fontSize:20, fontWeight:300, color:C.brownMid, letterSpacing:.3, lineHeight:1.7 }}>
          Tidak ada pengawet, tidak ada gula rafinasi.<br />Hanya bahan-bahan terbaik di setiap toples.
        </div>
        <div style={{ marginTop:24 }}>
          <BrandMark dark={false} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 03 — Brand Philosophy  (quote card, dark)
// ─────────────────────────────────────────────────────────────────
export function Post03() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.brownDark, fontFamily:SANS, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      {/* Concentric circles */}
      <svg style={{ position:'absolute', inset:0, opacity:.05 }} width={1080} height={1350} viewBox="0 0 1080 1350">
        <circle cx="540" cy="675" r="480" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="540" cy="675" r="360" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="540" cy="675" r="240" fill="none" stroke="white" strokeWidth="1"/>
      </svg>

      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 110px', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
        <div style={{ marginBottom:20 }}>
          <BrandMark dark />
        </div>

        <div style={{ marginTop:54, marginBottom:30 }}>
          <GoldRule width={40} />
        </div>

        {/* Big quote mark */}
        <div style={{ fontFamily:SERIF, fontSize:140, fontWeight:300, color:C.gold, lineHeight:.5, marginBottom:44, opacity:.8 }}>
          "
        </div>

        {/* Quote */}
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:58, color:C.cream, lineHeight:1.65, letterSpacing:.5, textAlign:'center' }}>
          Manis yang tulus,<br />tanpa rasa bersalah.
        </div>

        <div style={{ marginTop:48, marginBottom:44 }}>
          <GoldRule width={56} />
        </div>

        <div style={{ fontSize:14, letterSpacing:6, textTransform:'uppercase', color:C.gold, fontWeight:300 }}>
          stevia cookies · bandung
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 04 — Fresh from the Oven  (BTS baking, SVG)
// ─────────────────────────────────────────────────────────────────
export function Post04() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:'#f8f0e4', fontFamily:SANS }}>
      <svg style={{ position:'absolute', inset:0 }} width={1080} height={1350} viewBox="0 0 1080 1350">

        {/* Counter surface */}
        <rect x="0" y="760" width="1080" height="590" fill="#ede0cc"/>
        <line x1="0" y1="760" x2="1080" y2="760" stroke="#d4b888" strokeWidth="2"/>

        {/* ── Mixing bowl (left) ── */}
        <ellipse cx="230" cy="762" rx="195" ry="80" fill="#e8d4b8" stroke="#c8a878" strokeWidth="2"/>
        <path d="M35 762 Q230 910 425 762" fill="#f0e0c0" stroke="#c8a878" strokeWidth="2"/>
        {/* dough */}
        <ellipse cx="230" cy="757" rx="168" ry="55" fill="#e8c890"/>
        <ellipse cx="230" cy="750" rx="130" ry="35" fill="#f0d4a0" opacity="0.6"/>
        {/* wooden spoon */}
        <g transform="rotate(-42 390 680)">
          <rect x="378" y="510" width="28" height="220" rx="14" fill="#C8904A" stroke="#A87030" strokeWidth="1.5"/>
          <ellipse cx="392" cy="506" rx="48" ry="25" fill="#D4A060" stroke="#A87030" strokeWidth="1.5"/>
          <ellipse cx="392" cy="500" rx="34" ry="16" fill="#E0B070" opacity="0.5"/>
        </g>

        {/* ── Baking tray ── */}
        <rect x="160" y="440" width="760" height="295" rx="8" fill="#d8c0a0" stroke="#b8a080" strokeWidth="2"/>
        <rect x="172" y="452" width="736" height="271" rx="6" fill="#e8d0b0" opacity="0.5"/>

        {/* Row 1 cookies — Kastengel (flower rosette) */}
        {[260, 540, 820].map(cx => (
          <g key={cx} transform={`translate(${cx},530)`}>
            <circle cx="0" cy="0" r="8" fill="#d8b030"/>
            {[0,45,90,135,180,225,270,315].map(a => {
              const rad = a * Math.PI / 180
              return <circle key={a} cx={Math.round(18*Math.cos(rad))} cy={Math.round(18*Math.sin(rad))} r="8" fill="#e8c040"/>
            })}
            <circle cx="0" cy="0" r="6" fill="#c8a028" opacity="0.5"/>
          </g>
        ))}

        {/* Row 2 cookies — Lidah-buaya (tongue ovals) */}
        {[260, 540, 820].map(cx => (
          <g key={cx}>
            <ellipse cx={cx} cy="620" rx="20" ry="30" fill="#c89050" stroke="#a87030" strokeWidth="1"/>
            <ellipse cx={cx} cy="617" rx="13" ry="22" fill="#d4a060" opacity="0.45"/>
            <circle cx={cx-4} cy="610" r="2" fill="#8a5c30" opacity="0.35"/>
            <circle cx={cx+5} cy="621" r="2" fill="#8a5c30" opacity="0.35"/>
            <circle cx={cx-2} cy="630" r="2" fill="#8a5c30" opacity="0.3"/>
          </g>
        ))}

        {/* Row 3 cookies — Palm-cheese (balls) */}
        {[260, 540, 820].map(cx => (
          <g key={cx}>
            <circle cx={cx} cy="700" r="24" fill="#c87840"/>
            <circle cx={cx} cy="692" r="17" fill="#d89060" opacity="0.42"/>
            <circle cx={cx-7} cy="693" r="3.5" fill="#f0d880" opacity="0.35"/>
            <circle cx={cx+8} cy="696" r="3"   fill="#f0d880" opacity="0.3"/>
          </g>
        ))}

        {/* Steam wisps */}
        {[260,540,820].map(cx => (
          <g key={cx}>
            <path d={`M${cx} 438 Q${cx+12} 400 ${cx} 360`} fill="none" stroke="#d8c0a0" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            <path d={`M${cx+20} 435 Q${cx+30} 394 ${cx+18} 352`} fill="none" stroke="#d8c0a0" strokeWidth="2" strokeLinecap="round" opacity="0.38"/>
          </g>
        ))}

        {/* ── Oven mitt (right) ── */}
        <path d="M870 850 Q900 820 935 832 Q965 848 958 876 Q945 908 918 900 Q890 890 870 850Z" fill="#d4935a" stroke="#b87840" strokeWidth="1.5"/>
        <path d="M926 820 Q958 800 978 812 Q992 828 982 848" fill="#c87840" stroke="#b87840" strokeWidth="1.5"/>
        <path d="M940 815 Q960 800 975 808" fill="none" stroke="#a86a28" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>

        {/* ── Timer (bottom-left) ── */}
        <circle cx="148" cy="900" r="72" fill="white" stroke="#d4b888" strokeWidth="2"/>
        <circle cx="148" cy="900" r="56" fill="#faf4ec"/>
        <line x1="148" y1="900" x2="148" y2="858" stroke={C.brownDeep} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="148" y1="900" x2="178" y2="915" stroke={C.caramel}   strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── Stevia sprig (right side) ── */}
        <g transform="translate(1020,280)">
          <path d="M0,0 Q-16,-42 -12,-84" fill="none" stroke="#8a6a3a" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="-20" cy="-48" rx="15" ry="7" fill="#a8844a" opacity="0.68" transform="rotate(-35 -20 -48)"/>
          <ellipse cx="-8" cy="-76" rx="14" ry="7" fill="#8a6a3a" opacity="0.65" transform="rotate(22 -8 -76)"/>
        </g>
      </svg>

      {/* ── Bottom overlay + title ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0,
        background:'linear-gradient(to top,rgba(58,34,16,.88) 0%,rgba(58,34,16,.5) 45%,transparent 100%)',
        padding:'72px 90px 72px',
        textAlign:'center',
      }}>
        <div style={{ fontSize:15, letterSpacing:6, textTransform:'uppercase', color:C.gold, fontWeight:400, marginBottom:16 }}>Behind the Scenes</div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:72, color:C.cream, lineHeight:1.1, marginBottom:22 }}>Fresh from the Oven</div>
        <GoldRule width={52} />
        <div style={{ marginTop:20, fontSize:21, fontWeight:300, color:'rgba(255,249,240,.78)', lineHeight:1.7 }}>
          Aroma kue dari dapur kami — setiap pagi, untuk kamu.
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 05 — Every Bite Counts  (real photo, Palm-cheese)
// ─────────────────────────────────────────────────────────────────
export function Post05() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.brownDark, fontFamily:SANS }}>
      <img
        src="/images/Palm-cheese.jpeg"
        crossOrigin="anonymous"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
      />
      {/* top fade */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'36%', background:'linear-gradient(to bottom,rgba(58,34,16,.65) 0%,transparent 100%)' }} />
      {/* bottom fade */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'48%', background:'linear-gradient(to top,rgba(58,34,16,.92) 0%,rgba(58,34,16,.5) 42%,transparent 100%)' }} />

      {/* Top */}
      <div style={{ position:'absolute', top:60, left:0, right:0 }}>
        <BrandMark dark />
      </div>

      {/* "No refined sugar" badge (top-left) */}
      <div style={{
        position:'absolute', top:160, left:72,
        border:`1px solid rgba(201,169,110,.45)`, padding:'10px 22px', borderRadius:3,
      }}>
        <div style={{ fontSize:12, letterSpacing:5, textTransform:'uppercase', color:C.gold, fontWeight:300 }}>no refined sugar</div>
      </div>

      {/* Bottom */}
      <div style={{ position:'absolute', bottom:80, left:90, right:90 }}>
        <div style={{ fontSize:15, letterSpacing:7, textTransform:'uppercase', color:C.gold, fontWeight:400, marginBottom:18 }}>
          Product Close-Up
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:92, color:C.cream, lineHeight:1, marginBottom:24 }}>
          Palm Cheese
        </div>
        <GoldRule width={56} />
        <div style={{ marginTop:22, fontSize:22, fontWeight:300, color:'rgba(255,249,240,.82)', letterSpacing:.3, lineHeight:1.75 }}>
          Crispy di luar, lembut di dalam.<br />
          Setiap gigitan punya makna — tanpa rasa bersalah.
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 06 — Gift Something Sweet  (packaging SVG, 3 containers)
// ─────────────────────────────────────────────────────────────────
export function Post06() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.cream, fontFamily:SANS }}>
      {/* Linen texture */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`linear-gradient(rgba(240,228,211,.38) 1px,transparent 1px),linear-gradient(90deg,rgba(240,228,211,.38) 1px,transparent 1px)`,
        backgroundSize:'14px 14px',
      }} />

      <svg style={{ position:'absolute', inset:0 }} width={1080} height={1350} viewBox="0 0 1080 1350">

        {/* Table line */}
        <rect x="0" y="980" width="1080" height="280" fill="#f0e4d0"/>
        <line x1="0" y1="980" x2="1080" y2="980" stroke="#dcc8a8" strokeWidth="1.5"/>

        {/* ── Container helper: cylinder = rect body + 2 ellipses ── */}

        {/* Container 1 — Kastengel (left, slightly lower) */}
        <rect x="72" y="320" width="218" height="660" rx="4" fill="rgba(255,255,255,0.7)" stroke="#d4b888" strokeWidth="1.5"/>
        {/* cookies inside */}
        {[580,520,460].map(y => (
          <g key={y} transform={`translate(181,${y})`}>
            <circle cx="0"  cy="0" r="7"  fill="#d8b030"/>
            {[0,45,90,135,180,225,270,315].map(a => {
              const rad = a*Math.PI/180
              return <circle key={a} cx={Math.round(15*Math.cos(rad))} cy={Math.round(15*Math.sin(rad))} r="7" fill="#e8c040"/>
            })}
          </g>
        ))}
        {/* lid */}
        <ellipse cx="181" cy="320" rx="109" ry="26" fill="#e8d8c0" stroke="#d4b888" strokeWidth="1.5"/>
        <ellipse cx="181" cy="306" rx="100" ry="20" fill="#f0e0c8" stroke="#d4b888" strokeWidth="1"/>
        {/* label sticker */}
        <rect x="117" y="380" width="128" height="96" rx="5" fill="rgba(255,249,240,.97)" stroke="#dcc8a8" strokeWidth="1"/>
        <text x="181" y="410" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="22" fill={C.brownDeep}>stevia</text>
        <text x="181" y="434" textAnchor="middle" fontFamily="Poppins" fontSize="13" fill={C.brown} letterSpacing="2">KASTENGEL</text>
        <line x1="127" y1="442" x2="235" y2="442" stroke="#dcc8a8" strokeWidth="0.8"/>
        <text x="181" y="460" textAnchor="middle" fontFamily="Poppins" fontSize="11" fill={C.caramel2} letterSpacing="2">BANDUNG</text>
        {/* shadow */}
        <ellipse cx="181" cy="986" rx="109" ry="14" fill={C.brownDeep} opacity="0.06"/>

        {/* Container 2 — Lidah Buaya (centre, tallest, elevated) */}
        <rect x="431" y="240" width="218" height="740" rx="4" fill="rgba(255,255,255,0.7)" stroke="#d4b888" strokeWidth="1.5"/>
        {/* tongue cookies inside */}
        {[620, 550, 480, 415].map((y, i) => (
          <ellipse key={y} cx="540" cy={y} rx="34" ry="22" fill="#c89050" opacity="0.82"
            transform={`rotate(${i%2===0?-8:6} 540 ${y})`}/>
        ))}
        {/* lid */}
        <ellipse cx="540" cy="240" rx="109" ry="26" fill="#e8d8c0" stroke="#d4b888" strokeWidth="1.5"/>
        <ellipse cx="540" cy="226" rx="100" ry="20" fill="#f0e0c8" stroke="#d4b888" strokeWidth="1"/>
        {/* label */}
        <rect x="476" y="296" width="128" height="96" rx="5" fill="rgba(255,249,240,.97)" stroke="#dcc8a8" strokeWidth="1"/>
        <text x="540" y="326" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="22" fill={C.brownDeep}>stevia</text>
        <text x="540" y="348" textAnchor="middle" fontFamily="Poppins" fontSize="11" fill={C.brown} letterSpacing="1.5">LIDAH BUAYA</text>
        <line x1="486" y1="356" x2="594" y2="356" stroke="#dcc8a8" strokeWidth="0.8"/>
        <text x="540" y="374" textAnchor="middle" fontFamily="Poppins" fontSize="11" fill={C.caramel2} letterSpacing="2">BANDUNG</text>
        {/* shadow */}
        <ellipse cx="540" cy="986" rx="109" ry="16" fill={C.brownDeep} opacity="0.07"/>

        {/* Container 3 — Palm Cheese (right) */}
        <rect x="790" y="300" width="218" height="680" rx="4" fill="rgba(255,255,255,0.7)" stroke="#d4b888" strokeWidth="1.5"/>
        {/* ball cookies inside */}
        {[[860,590],[920,560],[870,510],[930,510],[895,470],[860,640],[920,640]].map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="22" fill="#c87840" opacity="0.86"/>
            <circle cx={cx-5} cy={cy-5} r="6"  fill="#f0d880" opacity="0.28"/>
          </g>
        ))}
        {/* lid */}
        <ellipse cx="899" cy="300" rx="109" ry="26" fill="#e8d8c0" stroke="#d4b888" strokeWidth="1.5"/>
        <ellipse cx="899" cy="286" rx="100" ry="20" fill="#f0e0c8" stroke="#d4b888" strokeWidth="1"/>
        {/* label */}
        <rect x="835" y="356" width="128" height="96" rx="5" fill="rgba(255,249,240,.97)" stroke="#dcc8a8" strokeWidth="1"/>
        <text x="899" y="386" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="22" fill={C.brownDeep}>stevia</text>
        <text x="899" y="408" textAnchor="middle" fontFamily="Poppins" fontSize="12" fill={C.brown} letterSpacing="1.5">PALM CHEESE</text>
        <line x1="845" y1="416" x2="953" y2="416" stroke="#dcc8a8" strokeWidth="0.8"/>
        <text x="899" y="434" textAnchor="middle" fontFamily="Poppins" fontSize="11" fill={C.caramel2} letterSpacing="2">BANDUNG</text>
        {/* shadow */}
        <ellipse cx="899" cy="986" rx="109" ry="14" fill={C.brownDeep} opacity="0.05"/>
      </svg>

      {/* Title top */}
      <div style={{ position:'absolute', top:64, left:0, right:0, textAlign:'center', padding:'0 90px' }}>
        <div style={{ fontSize:15, letterSpacing:7, textTransform:'uppercase', color:C.goldDark, fontWeight:400, marginBottom:14 }}>
          Packaging · Hampers
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:64, color:C.brown, lineHeight:1.1, marginBottom:18 }}>
          Gift Something Sweet
        </div>
        <GoldRule width={52} />
        <div style={{ marginTop:14, fontSize:18, fontWeight:300, color:C.brownMid, letterSpacing:.3 }}>
          DM untuk custom order &amp; hampers ✦
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 07 — Why Stevia?  (education card, dark)
// ─────────────────────────────────────────────────────────────────
export function Post07() {
  const items = [
    { n:'01', title:'Pemanis Alami',       body:'Diekstrak dari daun tanaman stevia — bukan produk kimia buatan.' },
    { n:'02', title:'Indeks Glikemik Nol', body:'Tidak mempengaruhi kadar gula darah secara signifikan.' },
    { n:'03', title:'Aman untuk Diabetes', body:'Dipilih oleh banyak penderita diabetes di seluruh dunia.' },
  ]
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:'#3e2414', fontFamily:SANS, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      {/* subtle radial glow */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 45%, rgba(201,169,110,.07) 0%, transparent 65%)' }} />

      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 100px', width:'100%' }}>
        <BrandMark dark />

        <div style={{ marginTop:56, marginBottom:40 }}>
          <GoldRule width={40} />
        </div>

        <div style={{ fontSize:14, letterSpacing:7, textTransform:'uppercase', color:C.gold, fontWeight:300, marginBottom:18 }}>
          Why Stevia?
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:76, color:C.cream, lineHeight:1.05, marginBottom:52 }}>
          Kenapa Kami Pilih<br />Stevia?
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:36, textAlign:'left' }}>
          {items.map(item => (
            <div key={item.n} style={{ display:'flex', gap:32, alignItems:'flex-start' }}>
              <div style={{ fontFamily:SERIF, fontSize:52, fontWeight:300, color:C.gold, opacity:.7, lineHeight:1, flexShrink:0, marginTop:4 }}>
                {item.n}
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:500, color:C.cream, marginBottom:8, letterSpacing:.5 }}>{item.title}</div>
                <div style={{ fontSize:19, fontWeight:300, color:'rgba(255,249,240,.62)', lineHeight:1.65 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:56, marginBottom:44 }}>
          <GoldRule width={56} />
        </div>

        <div style={{ fontSize:14, letterSpacing:5, textTransform:'uppercase', color:C.gold, fontWeight:300, opacity:.7 }}>
          stevia cookies · bandung
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 08 — Handcrafted with Care  (BTS piping, SVG)
// ─────────────────────────────────────────────────────────────────
export function Post08() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:'#f8f0e4', fontFamily:SANS }}>
      <svg style={{ position:'absolute', inset:0 }} width={1080} height={1350} viewBox="0 0 1080 1350">

        {/* Marble-style surface */}
        <rect x="0" y="340" width="1080" height="1010" fill="#ede0cc"/>
        <path d="M0 380 Q200 374 400 382 Q600 390 800 378 Q960 368 1080 376" fill="none" stroke="#d8c4a8" strokeWidth="1.2" opacity="0.6"/>
        <line x1="0" y1="340" x2="1080" y2="340" stroke="#d4b888" strokeWidth="1.8"/>

        {/* Parchment paper on surface */}
        <rect x="80" y="500" width="920" height="620" rx="4" fill="rgba(255,255,255,0.6)" stroke="#e8d4b0" strokeWidth="1.2"/>

        {/* ── Cookie 1 (left) — already iced ── */}
        <circle cx="230" cy="800" r="95" fill="#d4935a"/>
        <circle cx="230" cy="800" r="72" fill="#e0a868" opacity="0.48"/>
        {/* icing swirl */}
        <path d="M188 800 Q200 768 230 762 Q260 768 272 800 Q262 830 230 836 Q198 830 188 800Z" fill="white" opacity="0.88"/>
        <path d="M210 780 Q230 770 250 780 Q244 794 230 796 Q216 794 210 780Z" fill="white" opacity="0.6"/>

        {/* ── Cookie 2 (centre) — being iced ── */}
        <circle cx="540" cy="800" r="95" fill="#c87840"/>
        <circle cx="540" cy="800" r="72" fill="#d89060" opacity="0.48"/>
        {/* partial icing */}
        <path d="M498 800 Q510 772 540 766 Q570 772 575 795" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.85"/>

        {/* ── Cookie 3 (right) — plain ── */}
        <circle cx="850" cy="800" r="95" fill="#d4935a"/>
        <circle cx="850" cy="800" r="72" fill="#e0a868" opacity="0.48"/>

        {/* Kastengel flower cookie (extra, top right of parchment) */}
        <g transform="translate(870,610)">
          <circle cx="0" cy="0" r="9" fill="#d8b030"/>
          {[0,45,90,135,180,225,270,315].map(a => {
            const rad = a*Math.PI/180
            return <circle key={a} cx={Math.round(18*Math.cos(rad))} cy={Math.round(18*Math.sin(rad))} r="9" fill="#e8c040"/>
          })}
        </g>

        {/* ── Arm + piping bag (coming from top-right, angled down-left) ── */}
        {/* arm */}
        <path d="M1030 40 Q1000 180 960 340" fill="none" stroke="#e2cfc0" strokeWidth="72" strokeLinecap="round"/>
        <path d="M1030 40 Q1000 180 960 340" fill="none" stroke="#ecd8c4" strokeWidth="62" strokeLinecap="round" opacity="0.55"/>
        {/* piping bag */}
        <path d="M985 20 Q1020 15 1045 40 Q1065 120 1048 340 Q1030 352 1010 345 Q988 340 978 140 Q968 40 985 20Z" fill="#d4935a" stroke="#b87840" strokeWidth="1.5"/>
        <path d="M985 20 Q1002 17 1015 24 Q1008 150 1004 335 L1010 345 Q1030 352 1048 340" fill="#c87840" opacity="0.38"/>
        {/* piping tip */}
        <polygon points="1012,344 1028,344 1022,374 1018,374" fill="#a8844a"/>

        {/* Icing piped line from tip to centre cookie */}
        <path d="M1020 374 Q860 560 600 720" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.75"/>

        {/* Small scattered decorations */}
        <circle cx="155" cy="660" r="5" fill={C.gold} opacity="0.6"/>
        <circle cx="190" cy="630" r="4" fill={C.gold} opacity="0.5"/>
        <circle cx="170" cy="650" r="3" fill={C.gold} opacity="0.55"/>
        <circle cx="920" cy="970" r="5" fill={C.gold} opacity="0.6"/>
        <circle cx="895" cy="945" r="4" fill={C.gold} opacity="0.5"/>
      </svg>

      {/* ── Bottom overlay + title ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0,
        background:'linear-gradient(to top,rgba(58,34,16,.88) 0%,rgba(58,34,16,.5) 42%,transparent 100%)',
        padding:'70px 90px 72px',
        textAlign:'center',
      }}>
        <div style={{ fontSize:15, letterSpacing:7, textTransform:'uppercase', color:C.gold, fontWeight:400, marginBottom:16 }}>Behind the Scenes</div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:72, color:C.cream, lineHeight:1.1, marginBottom:22 }}>Handcrafted with Care</div>
        <GoldRule width={52} />
        <div style={{ marginTop:20, fontSize:21, fontWeight:300, color:'rgba(255,249,240,.78)', lineHeight:1.7 }}>
          Setiap kue dibentuk dan dihias dengan tangan —<br />tidak ada yang terburu-buru di dapur kami.
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 09 — Our Flavour Line  (3-column real photos)
// ─────────────────────────────────────────────────────────────────
export function Post09() {
  const cols = [
    { src:'/images/Kastengel.jpeg',   label:'Kastengel'   },
    { src:'/images/Lidah-buaya.jpeg', label:'Lidah Buaya' },
    { src:'/images/Palm-cheese.jpeg', label:'Palm Cheese' },
  ]
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.brownDark, display:'flex' }}>
      {cols.map(({ src, label }, i) => (
        <div key={i} style={{ position:'relative', flex:1, overflow:'hidden' }}>
          <img
            src={src}
            crossOrigin="anonymous"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'50% 65%' }}
          />
          {/* thin separator between columns */}
          {i < 2 && (
            <div style={{ position:'absolute', top:0, right:0, bottom:0, width:1, background:'rgba(201,169,110,.35)', zIndex:5 }} />
          )}
          {/* bottom label */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, zIndex:6,
            background:'linear-gradient(to top,rgba(58,34,16,.88) 0%,transparent 100%)',
            padding:'80px 12px 32px',
            textAlign:'center',
          }}>
            <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:28, color:C.cream, lineHeight:1.4 }}>
              {label.split(' ').map((w,j) => <span key={j} style={{ display:'block' }}>{w}</span>)}
            </div>
          </div>
        </div>
      ))}

      {/* Top header overlay */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, zIndex:10,
        background:'linear-gradient(to bottom,rgba(58,34,16,.82) 0%,transparent 100%)',
        padding:'60px 0 100px',
        textAlign:'center',
        pointerEvents:'none',
      }}>
        <div style={{ fontSize:13, letterSpacing:6, textTransform:'uppercase', color:'rgba(201,169,110,.7)', fontFamily:SANS, fontWeight:300, marginBottom:14 }}>
          Our Flavours
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:52, color:C.cream, lineHeight:1 }}>
          Pilih Favoritmu
        </div>
        <div style={{ marginTop:18, display:'flex', justifyContent:'center' }}>
          <GoldRule width={44} />
        </div>
        <div style={{ marginTop:14, fontSize:13, letterSpacing:5, textTransform:'uppercase', color:'rgba(201,169,110,.55)', fontFamily:SANS, fontWeight:300 }}>
          All Stevia-Sweetened
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 10 — A Quiet Afternoon  (real photo, Lidah-buaya)
// ─────────────────────────────────────────────────────────────────
export function Post10() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.brownDark, fontFamily:SANS }}>
      <img
        src="/images/Lidah-buaya.jpeg"
        crossOrigin="anonymous"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
      />
      {/* very light top veil */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%', background:'linear-gradient(to bottom,rgba(58,34,16,.5) 0%,transparent 100%)' }} />
      {/* bottom veil */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'42%', background:'linear-gradient(to top,rgba(58,34,16,.88) 0%,rgba(58,34,16,.44) 38%,transparent 100%)' }} />

      {/* Top brand mark (minimal) */}
      <div style={{ position:'absolute', top:60, left:0, right:0 }}>
        <BrandMark dark />
      </div>

      {/* Bottom — minimal text */}
      <div style={{ position:'absolute', bottom:80, left:90, right:90, textAlign:'center' }}>
        <div style={{ fontSize:14, letterSpacing:7, textTransform:'uppercase', color:C.gold, fontWeight:300, marginBottom:18 }}>
          Lifestyle
        </div>
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:84, color:C.cream, lineHeight:1.1, marginBottom:26 }}>
          A Quiet<br />Afternoon
        </div>
        <GoldRule width={52} />
        <div style={{ marginTop:22, fontSize:21, fontWeight:300, color:'rgba(255,249,240,.78)', lineHeight:1.75 }}>
          Nikmati waktu sendirimu — tanpa khawatir<br />soal gula darah. ☕
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 11 — Customer Love  (testimonial, dark)
// ─────────────────────────────────────────────────────────────────
export function Post11() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.brownDark, fontFamily:SANS, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      {/* soft ellipse glow */}
      <svg style={{ position:'absolute', inset:0, opacity:.05 }} width={1080} height={1350} viewBox="0 0 1080 1350">
        <ellipse cx="820" cy="200" rx="320" ry="520" fill="white" transform="rotate(-15 820 200)"/>
      </svg>

      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 100px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:13, letterSpacing:6, textTransform:'uppercase', color:C.gold, fontWeight:300, marginBottom:20 }}>
          Customer Love
        </div>

        {/* Stars */}
        <div style={{ display:'flex', gap:10, marginBottom:36 }}>
          {[0,1,2,3,4].map(i => (
            <svg key={i} width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,2 20,12 30,12 22,19 25,29 16,23 7,29 10,19 2,12 12,12" fill={C.gold}/>
            </svg>
          ))}
        </div>

        <GoldRule width={40} />

        {/* Big quote mark */}
        <div style={{ fontFamily:SERIF, fontSize:110, fontWeight:300, color:C.gold, lineHeight:.5, marginTop:36, marginBottom:30, opacity:.75 }}>
          "
        </div>

        {/* Review text */}
        <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:300, fontSize:50, color:C.cream, lineHeight:1.7, letterSpacing:.3 }}>
          "Rasanya enak banget<br />dan nggak bikin khawatir<br />soal gula — cocok banget<br />buat aku yang diabetik."
        </div>

        <div style={{ marginTop:44, marginBottom:40 }}>
          <GoldRule width={52} />
        </div>

        <div style={{ fontSize:18, letterSpacing:3, color:C.caramel3, fontWeight:300 }}>
          — Rina, Bandung
        </div>

        <div style={{ marginTop:52 }}>
          <BrandMark dark />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
//  Post 12 — New Flavour Coming Soon  (teaser, caramel dark)
// ─────────────────────────────────────────────────────────────────
export function Post12() {
  return (
    <div style={{ position:'relative', width:1080, height:1350, overflow:'hidden', background:C.caramel2, fontFamily:SANS, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      {/* Concentric circles */}
      <svg style={{ position:'absolute', inset:0, opacity:.08 }} width={1080} height={1350} viewBox="0 0 1080 1350">
        <circle cx="540" cy="675" r="500" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="540" cy="675" r="380" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="540" cy="675" r="260" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="540" cy="675" r="140" fill="none" stroke="white" strokeWidth="1"/>
      </svg>

      <Corner pos="tl" offset={52} />
      <Corner pos="tr" offset={52} />
      <Corner pos="bl" offset={52} />
      <Corner pos="br" offset={52} />

      <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 90px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:13, letterSpacing:7, textTransform:'uppercase', color:'rgba(255,249,240,.55)', fontWeight:300, marginBottom:36 }}>
          Coming Soon
        </div>

        <div style={{ width:36, height:1, background:'rgba(255,249,240,.35)', marginBottom:48 }} />

        <div style={{ fontFamily:SERIF, fontWeight:300, fontSize:34, letterSpacing:14, textTransform:'uppercase', color:C.cream, marginBottom:8, opacity:.7 }}>
          NEW
        </div>
        <div style={{ fontFamily:SERIF, fontWeight:300, fontSize:120, letterSpacing:10, textTransform:'uppercase', color:C.cream, lineHeight:1 }}>
          Flavour
        </div>

        <div style={{ marginTop:50, marginBottom:50 }}>
          <GoldRule width={52} />
        </div>

        <div style={{ fontSize:14, letterSpacing:5, textTransform:'uppercase', color:'rgba(255,249,240,.45)', fontWeight:300, marginBottom:10 }}>
          Tebak dulu rasanya apa? 👀
        </div>

        <div style={{ marginTop:48 }}>
          <BrandMark dark />
        </div>
      </div>
    </div>
  )
}
