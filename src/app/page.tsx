// page.tsx - REFACTORED VERSION
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import styles from "./page.module.css";

// Christmas features (DELETE AFTER HOLIDAYS)
import {
  ChristmasSnow,
  ChristmasBanner,
} from "../components/Christmas/ChristmasVibes";

// Section Components
import BackgroundCanvas from "@/components/AnimatedStarsBackground/BackgroundCanvas";
import HeroSection from "@/components/LandingPageSections/HeroSection";
import WhyChooseSection from "@/components/LandingPageSections/WhyChooseSection";
import HowItWorksSection from "@/components/LandingPageSections/HowItWorksSection";
import SecurityTrustSection from "@/components/LandingPageSections/SecurityTrustSection";
import DeliveryPricingSection from "@/components/LandingPageSections/DeliveryPricingSection";
import BuyerSellerSection from "@/components/LandingPageSections/BuyerSellerSection";
import ScrollToTopButton from "@/components/LandingPageSections/ScrollToTopButton";

// Keep ssr:false for Header
const Header = dynamic(() => import("../components/Header/Header"), {
  ssr: false,
});

export default function Home() {
  const [mounted] = useState(true);

  return (
    <div className={styles.page}>
      {/* CHRISTMAS SNOW (DELETE AFTER HOLIDAYS) */}
      <ChristmasSnow />

      {/* Background Animation Canvas */}
      {mounted && <BackgroundCanvas />}

      <div className={styles.content} suppressHydrationWarning>
        {/* Header */}
        {mounted && <Header />}

        {/* CHRISTMAS BANNER (DELETE AFTER HOLIDAYS) */}
        {mounted && <ChristmasBanner />}

        {/* Hero Section */}
        <HeroSection />

        {/* Why Choose BidZone Section */}
        <WhyChooseSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Security & Trust Section */}
        <SecurityTrustSection />

        {/* Delivery Pricing Section */}
        <DeliveryPricingSection />

        {/* For Buyers & Sellers Section */}
        <BuyerSellerSection />

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>

      {/* Chatbase Widget Script */}
      <Script id="chatbase-widget" strategy="afterInteractive">
        {`
          (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="VbNhP0pRqieM5UP2h8cKU";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
        `}
      </Script>
    </div>
  );
}
