import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export default function LogoIntro() {
  useGSAP(() => {
    const mobile = isMobileViewport();

    gsap.set(".syntra-intro-reveal", { opacity: 0, scale: mobile ? 1.08 : 1.12 });
    gsap.set(".syntra-visible-logo", { scale: 1, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".syntra-intro-hero",
        start: "top top",
        end: mobile ? "+=120%" : "+=160%",
        scrub: mobile ? 1.2 : 1.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(".syntra-visible-logo", {
      scale: mobile ? 22 : 28,
      opacity: 0,
      ease: "power2.in",
      transformOrigin: "50% 50%",
    }).to(
      ".syntra-intro-reveal",
      {
        opacity: 1,
        scale: 1,
        ease: "power1.out",
      },
      "<0.2"
    );
  });

  return (
    <section className="syntra-intro-hero">
      <div className="syntra-intro-backdrop" aria-hidden />

      <div className="syntra-intro-reveal">
        <img
          src="/images/hero-mobile-poster.jpg"
          alt=""
          className="syntra-intro-reveal-img"
        />
      </div>

      <h1 className="syntra-visible-logo" aria-label="syntra.ai">
        syntra<span className="syntra-dot-ai">.ai</span>
      </h1>
    </section>
  );
}
