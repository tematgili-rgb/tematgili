'use client'

import LeadFormInline from '@/components/forms/LeadFormInline'

export default function ContactFormSection() {
  return (
    <section id="contact-form" className="bg-primary-soft py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-white shadow-md p-6 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-text-dark">
              השאירו פרטים — נחזור אליכם 💕
            </h2>
            <p className="text-text-dark/70 mt-2">
              נציגה תיצור איתכם קשר תוך מספר שעות
            </p>
          </div>
          <LeadFormInline source="home_form" />
        </div>
      </div>
    </section>
  )
}
