export function WebsiteMockup() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'white', overflow: 'hidden', userSelect: 'none', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#EF4444', '#F59E0B', '#10B981'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />)}
        </div>
        <div style={{ flex: 1, background: 'white', border: '1px solid #E5E7EB', borderRadius: 20, padding: '3px 14px', fontSize: 10, color: '#9CA3AF' }}>yoursite.com</div>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 190, background: '#09090F', padding: '20px 0', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 14 }}>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 800 }}>Brand ✦</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 }}>Admin Dashboard</div>
          </div>
          {[{ icon: '⊞', label: 'Overview', active: false }, { icon: '◈', label: 'Products', active: true }, { icon: '♙', label: 'Orders', active: false }, { icon: '◎', label: 'Customers', active: false }, { icon: '⬡', label: 'Analytics', active: false }, { icon: '⚙', label: 'Settings', active: false }].map(item => (
            <div key={item.label} style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 9, background: item.active ? 'rgba(124,58,237,0.15)' : 'transparent', borderLeft: item.active ? '2px solid #7C3AED' : '2px solid transparent' }}>
              <span style={{ fontSize: 12, color: item.active ? '#A78BFA' : 'rgba(255,255,255,0.3)' }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: item.active ? 600 : 400, color: item.active ? 'white' : 'rgba(255,255,255,0.4)' }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: '#FAFAFA', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#09090F' }}>Products</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Manage your product catalog</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ border: '1px solid #E5E7EB', background: 'white', fontSize: 11, padding: '6px 14px', borderRadius: 8, color: '#6B7280' }}>Filter</div>
              <div style={{ background: '#7C3AED', color: 'white', fontSize: 11, padding: '6px 14px', borderRadius: 8, fontWeight: 700 }}>+ Add Product</div>
            </div>
          </div>
          <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, flexShrink: 0 }}>
            {[{ label: 'Total Products', value: '142', change: '+12%' }, { label: 'Active Listings', value: '98', change: '+8%' }, { label: 'Avg. Revenue', value: 'Rp 2.4M', change: '+31%' }].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#09090F', marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>↑ {s.change}</div>
              </div>
            ))}
          </div>
          <div style={{ margin: '0 24px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Product', 'Category', 'Price', 'Status'].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>)}
            </div>
            {[
              { name: 'Signature Blend Coffee', cat: 'Beverages', price: 'Rp 149k', status: 'Active', dot: '#10B981' },
              { name: 'Premium Gift Set', cat: 'Bundles', price: 'Rp 289k', status: 'Active', dot: '#10B981' },
              { name: 'Deluxe Monthly Box', cat: 'Subscription', price: 'Rp 429k', status: 'Draft', dot: '#F59E0B' },
              { name: 'Limited Edition Mug', cat: 'Merchandise', price: 'Rp 85k', status: 'Sold out', dot: '#EF4444' },
            ].map((row, i) => (
              <div key={row.name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '11px 16px', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#09090F' }}>{row.name}</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>{row.cat}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#09090F' }}>{row.price}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.dot }} />
                  <span style={{ fontSize: 10, color: '#6B7280' }}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
