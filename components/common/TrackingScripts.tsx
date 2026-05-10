'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ''
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

function setCookie(name: string, value: string, days: number): void {
  try {
    const exp = new Date()
    exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp.toUTCString()}; path=/; SameSite=Lax`
  } catch {}
}

export default function TrackingScripts() {
  const [consentGranted, setConsentGranted] = useState(false)

  // 1) Persist GCLID + UTM params from URL into localStorage + cookie (90 days)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const params = new URLSearchParams(window.location.search)
      const gclid = params.get('gclid')
      if (gclid) {
        try { localStorage.setItem('gclid', gclid) } catch {}
        setCookie('gclid', gclid, 90)
      }
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
      const utm: Record<string, string> = {}
      utmKeys.forEach((k) => {
        const v = params.get(k)
        if (v) utm[k] = v
      })
      if (Object.keys(utm).length) {
        try { localStorage.setItem('utm_params', JSON.stringify(utm)) } catch {}
        setCookie('utm_params', JSON.stringify(utm), 90)
      }
    } catch {}
  }, [])

  // 2) Initialize Consent Mode v2 BEFORE GTM/gtag
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer!.push(args)
    }
    ;(window as any).gtag = (window as any).gtag || gtag

    let stored: string | null = null
    try { stored = localStorage.getItem('cookie_consent') } catch {}
    const granted = stored === 'accepted'

    gtag('consent', 'default', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
      wait_for_update: 500,
    })

    if (granted) setConsentGranted(true)

    const onAccept = () => {
      ;(window as any).gtag?.('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      })
      setConsentGranted(true)
    }
    window.addEventListener('cookieConsentAccepted', onAccept)
    return () => window.removeEventListener('cookieConsentAccepted', onAccept)
  }, [])

  if (!consentGranted) return null

  return (
    <>
      {GTM_ID && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {(GOOGLE_ADS_ID || GA4_ID) && (
        <>
          <Script
            id="gtag-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID || GA4_ID}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());${GOOGLE_ADS_ID ? `gtag('config','${GOOGLE_ADS_ID}');` : ''}${GA4_ID ? `gtag('config','${GA4_ID}');` : ''}`}
          </Script>
        </>
      )}

      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  )
}
