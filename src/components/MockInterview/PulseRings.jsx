export default function PulseRings({ active = true, color = "mixed", size = "lg" }) {
  const sizeClass =
    size === "sm" ? "h-24 w-24" : size === "md" ? "h-36 w-36" : "h-44 w-44";

  const ringColor =
    color === "purple"
      ? "border-[#7E1487]/45"
      : color === "teal"
        ? "border-[#1387AE]/45"
        : "border-[#7E1487]/35";

  const coreGradient =
    color === "purple"
      ? "from-[#7E1487] to-[#9D3FB0]"
      : color === "teal"
        ? "from-[#1387AE] to-[#0094BD]"
        : "from-[#7E1487] to-[#1387AE]";

  return (
    <div className={`relative flex items-center justify-center ${sizeClass}`}>
      {active && (
        <>
          <span
            className={`absolute inset-0 animate-ping rounded-full border-2 ${ringColor} opacity-30`}
          />
          <span
            className={`absolute inset-[12%] animate-pulse rounded-full border-2 ${ringColor} opacity-50`}
            style={{ animationDuration: "2s" }}
          />
          <span
            className={`absolute inset-[24%] rounded-full border ${ringColor} opacity-70`}
            style={{ animation: "rmPulse 2.4s ease-in-out infinite" }}
          />
        </>
      )}
      <span
        className={`relative z-10 flex h-[38%] w-[38%] items-center justify-center rounded-full bg-gradient-to-br ${coreGradient} shadow-[0_0_32px_rgba(126,20,135,0.35)]`}
      />
      <style>{`
        @keyframes rmPulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
