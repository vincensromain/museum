"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import content from "./data/content.json";
import AppearRef from "./components/AppearRef/AppearRef";
import IconMuseum from "./components/IconsMuseum/IconsMuseum";

import "./page.scss";

export default function Home() {
  const { ctaLink, ctaLabel } = content.home;

  return (
    <main>
      <section className="home inside">
        <div className="narration">
          <div className="orb"></div>
        </div>
        <AppearRef delay={0.4}>
          <Link href={ctaLink || "#"} className="cta">
            <span className="cta_content">
              <span className="cta_text">{ctaLabel}</span>
              <span className="cta_icon">
                <IconMuseum icon="svgArrow" width={14.52} height={15.84} />
              </span>
            </span>
          </Link>
        </AppearRef>
      </section>
    </main>
  );
}
