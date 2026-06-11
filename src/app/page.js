import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import HeroSec from "@/components/HeroSec/HeroSec";
import Cocktails from "@/components/Cocktails/Cocktails";
import Hero from "@/components/Hero";
import LogoIntro from "@/components/LogoIntro/LogoIntro";
import IntroHandoff from "@/components/LogoIntro/IntroHandoff";
import "@/index.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Home() {
  return (
    <div className="home-page">
      <div className="syntra-intro-section">
        <LogoIntro />
      </div>
      <IntroHandoff />

      <div className="main-site-wrapper">
        <HeroSec />
        <Cocktails />
        <Hero />
      </div>
    </div>
  );
}
