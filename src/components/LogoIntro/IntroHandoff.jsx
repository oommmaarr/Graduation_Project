import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export default function IntroHandoff() {
  useGSAP(() => {
    const mobile = isMobileViewport();

    gsap.set(".main-site-wrapper", {
      marginTop: mobile ? "-110vh" : "-130vh",
      opacity: 0,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".intro-handoff-trigger",
        start: "top top",
        end: mobile ? "+=100%" : "+=140%",
        scrub: true,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(".syntra-intro-section", {
      opacity: 0,
      ease: "power1.inOut",
    }).to(
      ".main-site-wrapper",
      {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
      },
      "<0.15"
    );
  });

  return (
    <section className="intro-handoff-trigger" aria-hidden="true">
      <div className="h-dvh w-full" />
    </section>
  );
}
