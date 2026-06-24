import WhatsAppButton from '@/components/common/WhatsAppButton'
import { getResolvedSettings } from '@/lib/settings'

export default async function FinalCTASection() {
  const s = await getResolvedSettings()
  return (
    <section className="bg-accent text-white py-16 md:py-20">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-black leading-tight">
          {s.ctaTitle}
        </h2>
        <p className="text-lg md:text-xl mt-4 text-white/90">
          {s.ctaSubtitle}
        </p>
        <div className="mt-8 flex justify-center">
          <WhatsAppButton
            source="final_cta"
            label={s.ctaButtonText}
            message="היי! ראיתי את האתר ואני רוצה לשמוע פרטים."
            className="h-14 px-8 text-base"
          />
        </div>
      </div>
    </section>
  )
}
