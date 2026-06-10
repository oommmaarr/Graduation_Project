import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import { useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

const DESKTOP_SCRUB_SRC = "/videos/output2_scrub.mp4";
const MOBILE_SCRUB_SRC = "/videos/output2_scrub_mobile.mp4";
const SCRUB_FPS = 24;

const HeroSec = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isCoarsePointer = useMediaQuery({ query: "(pointer: coarse)" });
  const useMobileScrub = isMobile || isCoarsePointer;
  const videoSrc = useMobileScrub ? MOBILE_SCRUB_SRC : DESKTOP_SCRUB_SRC;

  useGSAP(
    () => {
      const heroSplit = new SplitText(".title", {
        type: "chars, words",
      });

      const paragraphSplit = new SplitText(".subtitle", {
        type: "lines",
      });

      gsap.from(heroSplit.chars, {
        yPercent: 100,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.06,
      });

      gsap.from(paragraphSplit.lines, {
        opacity: 0,
        yPercent: 100,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.06,
        delay: 1,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to(".right-leaf", { y: 200 }, 0)
        .to(".left-leaf", { y: -200 }, 0)
        .to(".arrow", { y: 100 }, 0);

      const video = videoRef.current;
      const section = sectionRef.current;
      if (!video || !section) return;

      let duration = 0;
      let lastFrame = -1;
      let scrubTrigger = null;

      const applyFrame = (progress) => {
        if (!duration) return;
        const totalFrames = Math.max(1, Math.floor(duration * SCRUB_FPS));
        const frame = Math.min(totalFrames - 1, Math.round(progress * (totalFrames - 1)));
        if (frame === lastFrame) return;
        lastFrame = frame;
        video.currentTime = frame / SCRUB_FPS;
      };

      const setupScrub = () => {
        duration = video.duration || 0;
        if (!duration) return;

        lastFrame = -1;
        scrubTrigger?.kill();

        scrubTrigger = ScrollTrigger.create({
          trigger: section,
          start: useMobileScrub ? "top 52%" : "center 60%",
          end: useMobileScrub ? "+=130%" : "bottom top",
          pin: video,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: useMobileScrub ? 0.35 : true,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyFrame(self.progress),
        });
      };

      if (video.readyState >= 1) {
        setupScrub();
      } else {
        video.addEventListener("loadedmetadata", setupScrub, { once: true });
      }

      return () => {
        scrubTrigger?.kill();
        video.removeEventListener("loadedmetadata", setupScrub);
      };
    },
    { dependencies: [useMobileScrub], scope: sectionRef }
  );

  return (
    <section id="hero" ref={sectionRef}>
      <div className="hero-media">
        {!videoFailed ? (
          <video
            key={videoSrc}
            ref={videoRef}
            className={useMobileScrub ? "hero-video hero-video--mobile" : "hero-video"}
            muted
            playsInline
            preload={useMobileScrub ? "auto" : "auto"}
            disablePictureInPicture
            src={videoSrc}
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <div className="hero-fallback" />
        )}
      </div>
      {!useMobileScrub && <div className="noisy pointer-events-none" />}
      <div className="relative z-10">
        <h1 className="title text-5xl md:text-7xl lg:text-9xl text-[#7E1487] md:mt-10 mt-20 text-center px-4">
          Intelligent Education
        </h1>

        <div className="body w-full px-4 lg:-ml-40">
          <img
            src="/images/arrow.png"
            alt="arrow"
            className="arrow w-20 md:w-40 hidden md:block"
          />
          <div className="content flex flex-col md:flex-row w-full gap-6 md:gap-10 justify-between items-center md:items-end md:-ml-10">
            <div className="space-y-2 md:space-y-5 hidden md:block text-black text-center md:text-left">
              <p className="font-bold text-sm md:text-md lg:text-2xl">Smart. Scalable. Secure</p>
              <p className="subtitle text-[#0094BD] text-sm md:text-xl lg:text-6xl">
                Smart Roadmaps
                <br /> Real Success
              </p>
            </div>

            <div className="flex flex-col space-y-3 md:space-y-5 max-w-xs md:max-w-sm w-full text-center md:text-left items-center md:items-start lg:-mr-40">
              <p className="subtitle text-black text-sm md:text-lg leading-relaxed font-semibold">
                Every roadmap on our platform is a blend of advanced AI algorithms, expert
                curriculum, and verified projects—designed to accelerate your tech career.
              </p>
              <a
                href="#cocktails"
                className="font-semibold text-[#7E1487] hover:text-[#0094BD] transition-colors w-fit"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSec;
