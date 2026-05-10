import WhatsAppButton from '@/components/common/WhatsAppButton'

export default function FinalCTASection() {
  return (
    <section className="bg-accent text-white py-16 md:py-20">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-black leading-tight">
          מוכנים להפוך את האירוע שלכם למיוחד?
        </h2>
        <p className="text-lg md:text-xl mt-4 text-white/90">
          דברו איתנו ב-WhatsApp ונכין לכם הצעה מותאמת אישית
        </p>
        <div className="mt-8 flex justify-center">
          <WhatsAppButton
            source="final_cta"
            label="לכתוב לנו ב-WhatsApp"
            message="היי! ראיתי את האתר ואני רוצה לשמוע פרטים."
            className="h-14 px-8 text-base"
          />
        </div>
      </div>
    </section>
  )
}
