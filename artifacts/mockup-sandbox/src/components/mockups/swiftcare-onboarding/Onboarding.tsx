import { useCallback, useEffect, useRef, useState } from "react";
import "./_group.css";

const SLIDES = [
  "/__mockup/images/sc_pharmacy.jpg",
  "/__mockup/images/sc_stethoscope.jpg",
  "/__mockup/images/sc_dental.jpg",
  "/__mockup/images/sc_corridor.jpg",
];

const AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

export function Onboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const resetAutoAdvance = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(goToNext, AUTO_ADVANCE_MS);
  }, [goToNext]);

  useEffect(() => {
    resetAutoAdvance();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetAutoAdvance]);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) {
        goToNext();
      } else {
        goToPrev();
      }
      resetAutoAdvance();
    }
    pointerStartX.current = null;
  };

  return (
    <div
      className="sc-onboarding-root relative w-full h-full overflow-hidden select-none"
      style={{ background: "#0b1f14" }}
    >
      {/* ---------- Top image carousel section (65%) ---------- */}
      <div
        className="absolute top-0 left-0 right-0 overflow-hidden"
        style={{ height: "65%" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            className="sc-slide absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))}

        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.35) 38%, rgba(0,0,0,0.40) 62%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Content overlay, vertically centered in middle 60% */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div className="flex flex-col items-center" style={{ marginTop: "6%" }}>
            <img
              src="/__mockup/images/swiftcare_logo.png"
              alt="SwiftCare"
              className="sc-anim-logo w-48 h-auto object-contain mx-auto rounded-tl-[1px] rounded-tr-[1px] rounded-br-[1px] rounded-bl-[1px] border-t-[1px] border-r-[1px] border-b-[1px] border-l-[1px] opacity-[1] pl-[1px] pr-[1px] pt-[10px] pb-[10px] mt-[0px] mb-[0px] ml-[82.2656px] mr-[82.2656px]"
            />
            <h1
              className="sc-anim-headline text-center text-white font-bold mt-6"
              style={{
                fontSize: "34px",
                lineHeight: 1.15,
                textShadow: "0 2px 12px rgba(0,0,0,0.45)",
                letterSpacing: "-0.5px",
              }}
            >
              Smarter Health
              <br />
              Starts Here.
            </h1>
            <p
              className="sc-anim-sub text-center mt-3"
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.90)",
                textShadow: "0 1px 6px rgba(0,0,0,0.35)",
              }}
            >
              Talk to a medical doctor
            </p>
          </div>
        </div>

        {/* Pagination dots */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{ bottom: "22px", gap: "6px" }}
        >
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className="sc-dot rounded-full"
              style={{
                width: i === activeIndex ? "22px" : "8px",
                height: "8px",
                borderRadius: i === activeIndex ? "4px" : "9999px",
                backgroundColor:
                  i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      </div>
      {/* ---------- Curved divider + bottom green section (35%) ---------- */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{ height: "35%" }}
      >
        {/* SVG wave divider sitting on top of the green panel */}
        <svg
          className="absolute left-0 right-0"
          style={{ top: "-28px", width: "100%", height: "30px", display: "block" }}
          viewBox="0 0 390 30"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C97.5,0 292.5,0 390,30 L390,30 L0,30 Z"
            fill="#16A34A"
          />
        </svg>

        <div
          className="relative w-full h-full flex flex-col items-center justify-end"
          style={{ backgroundColor: "#16A34A", paddingBottom: "40px" }}
        >
          <div className="sc-anim-bottom flex flex-col items-center w-full px-8">
            <p
              className="text-center mb-6"
              style={{
                fontSize: "12.5px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.5,
                maxWidth: "320px",
              }}
            >
              SwiftCare does not replace professional medical advice.
              <br />
              For emergencies, visit the nearest hospital immediately.
            </p>

            <button
              type="button"
              className="sc-get-started-btn w-[85%] font-bold"
              style={{
                height: "56px",
                borderRadius: "30px",
                backgroundColor: "#ffffff",
                color: "#16A34A",
                fontSize: "17px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                border: "none",
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
