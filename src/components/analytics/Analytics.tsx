"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

/**
 * Meta Pixel and GA4 loaders, gated on env vars. Empty env = zero
 * third-party bytes. App Router navigations are client-side, so page views
 * are fired manually on every pathname change. The `t` query parameter
 * (quiz and unsubscribe tokens) is stripped from page_location.
 *
 * Reserved for a future consent banner: nothing loads while this is false.
 */
const consentGranted = true;

function cleanLocation(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete("t");
  const qs = params.toString();
  return `${window.location.origin}${pathname}${qs ? `?${qs}` : ""}`;
}

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string>("");

  const enabled = consentGranted && (PIXEL_ID || GA4_ID);

  useEffect(() => {
    if (!enabled) return;
    if (pathname.startsWith("/admin")) return;
    const key = `${pathname}?${searchParams.toString()}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    const location = cleanLocation(pathname, searchParams.toString());
    if (window.gtag && GA4_ID) {
      window.gtag("event", "page_view", { page_location: location, page_path: pathname });
    }
    if (window.fbq && PIXEL_ID) {
      window.fbq("track", "PageView");
    }
  }, [enabled, pathname, searchParams]);

  if (!enabled || pathname.startsWith("/admin")) return null;

  return (
    <>
      {GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}', { send_page_view: false });`}
          </Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');`}
        </Script>
      )}
    </>
  );
}
