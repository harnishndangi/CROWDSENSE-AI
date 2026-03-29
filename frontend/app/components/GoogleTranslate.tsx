"use client";
import { useEffect } from "react";

// Add global declaration for the callback function
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Check if script is already injected
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: "en", 
            includedLanguages: "en,hi,mr,gu,ta,te,kn,ml,pa,bn,ur",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
          },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9999,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        padding: "8px",
        borderRadius: "var(--radius-small)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
    ></div>
  );
}
