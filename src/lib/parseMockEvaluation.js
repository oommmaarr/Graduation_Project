function parseBullets(sectionText) {
  if (!sectionText) return [];
  return sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Splits the mock interview evaluation text into structured sections.
 */
export function parseMockEvaluation(text) {
  const fullText = text?.trim() ?? "";
  if (!fullText) {
    return {
      intro: "",
      strengths: [],
      areasToImprove: [],
      nextSteps: [],
      fullText: "",
    };
  }

  const markers = [
    { key: "strengths", pattern: /\n\s*Strengths\s*\n/i },
    { key: "areasToImprove", pattern: /\n\s*Areas to improve\s*\n/i },
    { key: "nextSteps", pattern: /\n\s*Suggested next steps\s*\n/i },
  ];

  const positions = markers
    .map(({ key, pattern }) => {
      const match = fullText.match(pattern);
      if (!match) return null;
      return { key, index: match.index, end: match.index + match[0].length };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  if (positions.length === 0) {
    return {
      intro: fullText,
      strengths: [],
      areasToImprove: [],
      nextSteps: [],
      fullText,
    };
  }

  const intro = fullText.slice(0, positions[0].index).trim();
  const sections = { strengths: "", areasToImprove: "", nextSteps: "" };

  positions.forEach((pos, i) => {
    const start = pos.end;
    const end = positions[i + 1]?.index ?? fullText.length;
    sections[pos.key] = fullText.slice(start, end).trim();
  });

  return {
    intro,
    strengths: parseBullets(sections.strengths),
    areasToImprove: parseBullets(sections.areasToImprove),
    nextSteps: parseBullets(sections.nextSteps),
    fullText,
  };
}

export function ratingColor(rating) {
  if (rating == null) return "text-gray-600";
  if (rating >= 8) return "text-emerald-600";
  if (rating >= 6) return "text-amber-600";
  return "text-orange-600";
}

export function ratingBg(rating) {
  if (rating == null) return "bg-gray-100";
  if (rating >= 8) return "bg-emerald-50 border-emerald-200";
  if (rating >= 6) return "bg-amber-50 border-amber-200";
  return "bg-orange-50 border-orange-200";
}
