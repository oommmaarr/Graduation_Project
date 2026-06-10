import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

const HeroSec = () => {
  const videoRef = useRef();
  const [videoFailed, setVideoFailed] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useGSAP(() => {
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

    const startValue = isMobile ? "top 50%" : "center 60%";
    const endValue = isMobile ? "170% top" : "bottom top";

    if (!videoRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: videoRef.current,
        start: startValue,
        end: endValue,
        scrub: true,
        pin: true,
      },
    });

    videoRef.current.onloadedmetadata = () => {
      tl.to(videoRef.current, {
        currentTime: videoRef.current.duration,
      });
    };
  }, []);

  return (
    <section id="hero">
      <div className="hero-media">
        {!videoFailed ? (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            src="/videos/output2_scrub.mp4"
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <div className="hero-fallback" />
        )}
      </div>
      <div className="noisy pointer-events-none" />
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
