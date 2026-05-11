import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants'
import HeroCarousel3D from './HeroCarousel3D'

export default function HeroSection() {
  return (
    <section className="relative bg-white bg-gradient-to-bl from-primary-soft/40 to-cream/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Large soft blobs */}
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary/40 blur-3xl animate-blob-slow" />
        <div className="absolute top-1/3 -left-32 w-[360px] h-[360px] rounded-full bg-cream/70 blur-3xl animate-blob-slower" />
        <div className="absolute -bottom-32 right-1/4 w-[480px] h-[480px] rounded-full bg-primary-soft/60 blur-3xl animate-blob-slow [animation-delay:-6s]" />

        {/* Confetti dots */}
        <span className="absolute top-12 left-[14%] w-2 h-2 rounded-full bg-primary/70 animate-float-a" />
        <span className="absolute top-24 left-[38%] w-1.5 h-1.5 rounded-full bg-accent/60 animate-float-b" />
        <span className="absolute top-[18%] right-[28%] w-2.5 h-2.5 rounded-full bg-twine/60 animate-float-c" />
        <span className="absolute top-[38%] right-[8%] w-1.5 h-1.5 rounded-full bg-primary/60 animate-float-a" />
        <span className="absolute bottom-[22%] left-[10%] w-2 h-2 rounded-full bg-cream animate-float-b" />
        <span className="absolute bottom-[14%] left-1/2 w-1.5 h-1.5 rounded-full bg-accent/50 animate-float-c" />
        <span className="absolute bottom-[30%] right-[20%] w-2 h-2 rounded-full bg-primary-soft animate-float-a" />
        <span className="absolute top-[55%] left-1/3 w-1 h-1 rounded-full bg-twine/70 animate-float-b" />

        {/* Twinkling sparkles */}
        <svg className="absolute top-[10%] right-[12%] w-6 h-6 text-primary animate-twinkle" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
        <svg className="absolute top-[42%] left-[18%] w-4 h-4 text-accent animate-twinkle [animation-delay:-1.2s]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
        <svg className="absolute bottom-[18%] right-[35%] w-5 h-5 text-twine animate-twinkle [animation-delay:-2.5s]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
        <svg className="absolute top-[68%] right-[5%] w-3 h-3 text-primary animate-twinkle [animation-delay:-0.6s]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>

        {/* Drifting bubbles */}
        <span className="absolute bottom-0 left-[20%] w-4 h-4 rounded-full bg-primary/40 animate-bubble-up" />
        <span className="absolute bottom-0 left-[55%] w-3 h-3 rounded-full bg-cream/70 animate-bubble-up [animation-delay:-4s]" />
        <span className="absolute bottom-0 left-[82%] w-5 h-5 rounded-full bg-primary-soft animate-bubble-up [animation-delay:-7s]" />

        {/* Grain texture overlay (very subtle) */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          }}
        />
      </div>
      <div className="container mx-auto px-4 pt-5 pb-12 md:pb-20 lg:pb-28 relative">
        <div className="lg:hidden flex justify-center mb-0">
          <Image
            src="/logo.png"
            alt={SITE_NAME}
            width={918}
            height={314}
            priority
            className="h-24 sm:h-28 w-auto [filter:drop-shadow(0_0_18px_rgba(255,235,240,0.95))_drop-shadow(0_0_42px_rgba(244,168,184,0.55))]"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-center">
          <div className="text-center lg:text-right space-y-6 order-2 lg:order-1">
            <div className="mt-6 md:mt-0 inline-flex items-center gap-2.5 md:gap-2 px-4 md:px-3 py-2 md:py-1.5 rounded-full bg-white/80 border border-primary text-text-dark text-base md:text-sm font-semibold shadow-sm animate-fade-in">
              <span className="relative flex h-2.5 w-2.5 md:h-2 md:w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-2 md:w-2 bg-accent" />
              </span>
              מיתוג אישי לכל אירוע ✨
            </div>
            <h1 className="leading-tight text-text-dark">
              <span className="sr-only">{SITE_NAME}</span>
              <Image
                src="/logo.png"
                alt={SITE_NAME}
                width={918}
                height={314}
                priority
                className="hidden mx-auto lg:mx-0 lg:me-auto lg:block h-24 md:h-28 lg:h-32 w-auto [filter:drop-shadow(0_0_18px_rgba(255,235,240,0.95))_drop-shadow(0_0_42px_rgba(244,168,184,0.55))]"
              />
              <span className="block text-primary mt-3 text-4xl md:text-5xl lg:text-6xl whitespace-nowrap font-black text-center lg:text-right [-webkit-text-stroke:5px_white] [paint-order:stroke_fill]">
                {SITE_TAGLINE}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-dark/80 max-w-xl mx-auto lg:mx-0">
              חוברות צביעה, עטיפות שוקולד, קופסאות פופקורן ועוד — כל מה שהופך את האירוע שלכם
              {' '}
              <span className="font-display text-primary text-2xl md:text-3xl [-webkit-text-stroke:5px_white] [paint-order:stroke_fill]">למיוחד</span>
              , מודפס בהתאמה אישית.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button asChild size="lg" className="bg-primary text-white font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-transform h-14 text-base shadow-lg shadow-primary/40">
                <Link href="/products">ראו את המוצרים</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 text-base hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Link href="/packages">חבילות מוכנות</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-sm text-text-dark/70">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-base leading-none" aria-label="דירוג 5 מתוך 5">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <span>אלפי לקוחות מרוצים</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span>זמן אספקה מהיר</span>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden="true">🇮🇱</span>
                <span>תוצרת ישראל</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:overflow-visible lg:relative lg:w-[130%] lg:translate-x-[12%] lg:-mx-[15%] lg:pointer-events-none">
            <div className="lg:pointer-events-auto">
              <HeroCarousel3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
