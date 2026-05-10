'use client'

import WhatsAppButton from '@/components/common/WhatsAppButton'
import PhoneButton from '@/components/common/PhoneButton'

interface Props {
  productName: string
  minQuantity?: number
}

export default function ContactCTABox({ productName, minQuantity }: Props) {
  const message = `היי! אני מתעניין/ת ב-"${productName}". אשמח לקבל פרטים והצעת מחיר.`

  return (
    <div className="bg-primary-soft border-2 border-primary rounded-2xl p-6 md:p-8 space-y-4">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-text-dark">
          בואו נדבר על {productName} 💕
        </h3>
        <p className="text-text-dark/80 mt-2 text-sm md:text-base">
          נחזור אליכם עם הצעת מחיר מותאמת אישית
        </p>
        {minQuantity && minQuantity > 0 && (
          <p className="text-xs text-text-dark/60 mt-2">
            כמות מינימום להזמנה: {minQuantity} יח׳
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <WhatsAppButton
          source="product_cta_box"
          message={message}
          label="WhatsApp"
          className="flex-1 h-12 text-base"
        />
        <PhoneButton label="התקשרו אלינו" className="flex-1 h-12 text-base bg-white" />
      </div>
    </div>
  )
}
