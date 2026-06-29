import { useT } from '../../i18n'

const LOGOS = [
  {
    name: 'Abdi Smart',
    src: '/clients-logo/abdi-smart.png',
    filter: 'grayscale(1) invert(1) brightness(1.5)',
    opacity: 0.82,
  },
  {
    name: 'Cahaya Kesadaran',
    src: '/clients-logo/cahaya-kesadaran.jpeg',
    filter: 'grayscale(1) invert(1) brightness(1.5)',
    opacity: 0.82,
  },
  {
    name: 'Mulia Plastik',
    src: '/clients-logo/mulia-plastik.png',
    filter: 'grayscale(1) brightness(1.2)',
    opacity: 0.85,
  },
  {
    name: 'Sanar',
    src: '/clients-logo/sanar.jpg',
    filter: 'grayscale(1) brightness(1.3)',
    opacity: 0.85,
  },
  {
    name: 'SMAN 4 Denpasar',
    src: '/clients-logo/sman-4-denpasar.png',
    filter: 'grayscale(1) invert(1) brightness(1.5)',
    opacity: 0.82,
  },
  {
    name: 'Telur Gulung Om Gendut',
    src: '/clients-logo/telur-gulung-om-gendut.png',
    filter: 'grayscale(1) invert(1) brightness(1.5)',
    opacity: 0.82,
  },
]

const TEXT_LOGOS = [{ name: 'Stevia Cookies' }]

const ALL_ITEMS: ({ type: 'img'; name: string; src: string; filter: string; opacity: number } | { type: 'text'; name: string })[] = [
  ...LOGOS.map(l => ({ type: 'img' as const, ...l })),
  ...TEXT_LOGOS.map(t => ({ type: 'text' as const, ...t })),
]

export function TrustBar() {
  const t = useT()
  const doubled = [...ALL_ITEMS, ...ALL_ITEMS]

  return (
    <section className="bg-[#09090F] py-10 border-y border-white/[0.05] overflow-hidden">
      <p className="text-center font-sans text-[16px] font-semibold text-white mb-8">
        {t.trustBar.label}
      </p>

      <div className="flex items-center marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center justify-center flex-shrink-0 px-10">
            {item.type === 'img' ? (
              <img
                src={item.src}
                alt={item.name}
                style={{
                  height: 56,
                  maxWidth: 160,
                  objectFit: 'contain',
                  filter: item.filter,
                  opacity: item.opacity,
                }}
              />
            ) : (
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 20,
                fontWeight: 700,
                color: 'white',
                opacity: 0.55,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
