"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  highlight?: string;
  image?: string; // public path under /public
  bg?: string; // tailwind classes for background
}

const defaultSlides: Slide[] = [
  {
    id: "s1",
    title: "Fit Seharian saat Musim Hujan",
    subtitle: "Diskon s.d",
    badge: "50%",
    image: "/images/placeholder.jpg",
    bg: "from-sky-50 to-sky-200",
  },
  {
    id: "s2",
    title: "Pilihan Lengkap Spek Mantap",
    subtitle: "Diskon s.d",
    badge: "30%",
    image: "/vercel.svg",
    bg: "from-yellow-50 to-yellow-200",
  },
];

const AUTO_MS = 5000;

export default function HeroCarousel({ slides = defaultSlides }: { slides?: Slide[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const max = slides.length;

  const go = (i: number) => setIndex((prev) => (i + max) % max);
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // autoplay
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIndex((p) => (p + 1) % max), AUTO_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [max]);

  // scroll to active slide without inline transform styles
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const width = el.getBoundingClientRect().width;
    el.scrollTo({ left: width * index, behavior: "smooth" });
  }, [index]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Slides */}
      <div
        ref={wrapRef}
        className="w-full overflow-hidden snap-x snap-mandatory"
      >
        <div className="flex">
          {slides.map((s) => (
            <div key={s.id} className="shrink-0 w-full snap-start">
              <div className={`relative h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] xl:h-[340px] bg-gradient-to-r ${s.bg} rounded-xl p-6 md:p-8 flex items-center justify-between overflow-hidden`}>
                <div className="z-10 max-w-[60%]">
                  {s.subtitle && (
                    <p className="text-neutral-700 text-sm font-semibold uppercase tracking-wide mb-1">{s.subtitle}</p>
                  )}
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight">
                    {s.title}
                  </h2>
                  {s.badge && (
                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-lg md:text-xl lg:text-2xl font-bold">
                        {s.badge}
                      </span>
                    </div>
                  )}
                </div>

                {s.image && (
                  <div className="absolute right-0 bottom-0 opacity-90 translate-x-6 md:translate-x-10">
                    <Image
                      src={s.image}
                      alt={s.title}
                      width={420}
                      height={280}
                      className="object-contain w-[180px] sm:w-[220px] md:w-[260px] lg:w-[320px] h-auto select-none"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        aria-label="Sebelumnya"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow"
      >
        ‹
      </button>
      <button
        aria-label="Berikutnya"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Ke slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-neutral-900' : 'w-2.5 bg-neutral-400/70 hover:bg-neutral-600'}`}
          />
        ))}
      </div>
    </div>
  );
}
