import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import HeroSec from "@/components/HeroSec/HeroSec";
import Cocktails from "@/components/Cocktails/Cocktails";
import Hero from "@/components/Hero";
import "@/index.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Home() {
  return (
    <div>
      <HeroSec />
      <Cocktails />
      <Hero />
    </div>
  );
}