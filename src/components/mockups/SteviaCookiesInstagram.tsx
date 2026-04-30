import {
  Post01, Post05, Post09, Post10, Post11, Post12,
} from './stevia-posts'

const POSTS = [Post01, Post05, Post09, Post10, Post11, Post12]

const CELL_W = 129
const CELL_H = Math.round(1350 * (CELL_W / 1080))
const SCALE  = CELL_W / 1080

function PostThumb({ Component }: { Component: React.FC }) {
  return (
    <div style={{ width: CELL_W, height: CELL_H, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{
        width: 1080,
        height: 1350,
        transformOrigin: 'top left',
        transform: `scale(${SCALE})`,
        pointerEvents: 'none',
      }}>
        <Component />
      </div>
    </div>
  )
}

function Avatar() {
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" fill="none">
      <defs>
        <linearGradient id="ig-ring-sc" x1="0" y1="0" x2="86" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f9ce34"/>
          <stop offset="30%" stopColor="#ee2a7b"/>
          <stop offset="70%" stopColor="#6228d7"/>
        </linearGradient>
        <clipPath id="av-clip-sc">
          <circle cx="43" cy="43" r="36"/>
        </clipPath>
      </defs>
      <circle cx="43" cy="43" r="42" stroke="url(#ig-ring-sc)" strokeWidth="2.5" fill="none"/>
      <circle cx="43" cy="43" r="39" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="43" cy="43" r="36" fill="#FFF9F0"/>
      <g clipPath="url(#av-clip-sc)">
        <circle cx="43" cy="43" r="36" fill="#f5ede0"/>
        <circle cx="43" cy="46" r="22" fill="#c8853a"/>
        <circle cx="43" cy="44" r="16" fill="#d4935a" opacity="0.6"/>
        <circle cx="37" cy="42" r="3" fill="#6B4226"/>
        <circle cx="49" cy="40" r="3" fill="#6B4226"/>
        <circle cx="43" cy="52" r="3" fill="#6B4226"/>
        <circle cx="36" cy="52" r="2.5" fill="#6B4226"/>
        <circle cx="51" cy="50" r="2.5" fill="#6B4226"/>
        <text x="43" y="76" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="6" fill="#6B4226" letterSpacing="1" fontWeight="500">STEVIA</text>
      </g>
    </svg>
  )
}

function StatBlock({ count, label }: { count: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 16, fontWeight: 700, color: '#000', lineHeight: 1.2 }}>{count}</span>
      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: '#737373', lineHeight: 1.2 }}>{label}</span>
    </div>
  )
}

export function SteviaCookiesInstagram() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* status bar */}
      <div style={{
        height: 44,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px 0 20px',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'system-ui', fontSize: 13, fontWeight: 600, color: '#000' }}>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <rect x="0"  y="8"  width="3" height="4" rx="0.5" fill="#000"/>
            <rect x="5"  y="5"  width="3" height="7" rx="0.5" fill="#000"/>
            <rect x="10" y="2"  width="3" height="10" rx="0.5" fill="#000"/>
            <rect x="15" y="0"  width="3" height="12" rx="0.5" fill="#000"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 10.5 a0.8 0.8 0 0 1 0 1.5 a0.8 0.8 0 0 1 0-1.5Z" fill="#000"/>
            <path d="M4.5 7.5 Q8 4.5 11.5 7.5" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M1.5 4.5 Q8 -0.5 14.5 4.5" stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0" y="1" width="22" height="10" rx="2" stroke="#000" strokeWidth="1.2" fill="none"/>
            <rect x="1" y="2" width="18" height="8" rx="1.5" fill="#000"/>
            <rect x="23" y="4" width="2" height="4" rx="1" fill="#000" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* Instagram top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 8px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: '"Billabong", cursive, Georgia, serif', fontSize: 24, fontWeight: 400, color: '#000', letterSpacing: -0.5 }}>steviacookies</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
        </div>

        {/* Profile header */}
        <div style={{ padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Avatar />
            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', paddingLeft: 8 }}>
              <StatBlock count="6" label="posts" />
              <StatBlock count="1,284" label="followers" />
              <StatBlock count="198" label="following" />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'system-ui', fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 3 }}>Stevia Cookies</div>
            <div style={{ fontFamily: 'system-ui', fontSize: 13, color: '#000', lineHeight: 1.5 }}>
              🍪 Kue kering sehat tanpa gula rafinasi<br/>
              ✨ Manis yang tulus, tanpa rasa bersalah<br/>
              📍 Bandung
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{
              flex: 1, padding: '7px 0', borderRadius: 8,
              background: '#f0f0f0', border: 'none', cursor: 'pointer',
              fontFamily: 'system-ui', fontSize: 13, fontWeight: 600, color: '#000',
            }}>Edit profile</button>
            <button style={{
              flex: 1, padding: '7px 0', borderRadius: 8,
              background: '#f0f0f0', border: 'none', cursor: 'pointer',
              fontFamily: 'system-ui', fontSize: 13, fontWeight: 600, color: '#000',
            }}>Share profile</button>
            <button style={{
              width: 36, padding: '7px 0', borderRadius: 8,
              background: '#f0f0f0', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Highlights */}
        <div style={{ display: 'flex', gap: 14, padding: '4px 16px 14px', overflowX: 'auto' }}>
          {['Kastengel', 'Palm Cheese', 'Lidah Buaya', 'Promo', 'Review'].map(label => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                border: '1px solid #ddd',
                background: '#f5ede0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13" r="9" fill="#c8853a"/>
                  <circle cx="10" cy="12" r="2" fill="#6B4226"/>
                  <circle cx="15" cy="11" r="2" fill="#6B4226"/>
                  <circle cx="13" cy="16" r="2" fill="#6B4226"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'system-ui', fontSize: 10, color: '#000', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
          <div style={{
            flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center',
            borderBottom: '2px solid #000',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div style={{
            flex: 1, padding: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8">
              <path d="M17.5 6.5a5 5 0 0 1 0 7l-7 7-7-7a5 5 0 0 1 7-7l0 0 0 0"/>
            </svg>
          </div>
        </div>

        {/* 3-column photo grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {POSTS.map((Post, i) => (
            <PostThumb key={i} Component={Post} />
          ))}
        </div>

        {/* bottom nav */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 0 6px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="12" cy="12" r="1.5" fill="#000"/>
            <line x1="2" y1="8" x2="22" y2="8"/>
            <line x1="8" y1="2" x2="8" y2="8"/>
            <line x1="16" y1="2" x2="16" y2="8"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            border: '2px solid #000',
            background: '#f5ede0',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" fill="#c8853a"/>
              <circle cx="7" cy="8.5" r="1.5" fill="#6B4226"/>
              <circle cx="11" cy="8" r="1.5" fill="#6B4226"/>
              <circle cx="9" cy="11" r="1.5" fill="#6B4226"/>
            </svg>
          </div>
        </div>

      </div>

      {/* home indicator */}
      <div style={{
        height: 26,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ width: 120, height: 5, background: '#000', borderRadius: 3 }} />
      </div>
    </div>
  )
}
