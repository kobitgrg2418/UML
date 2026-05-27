export type DiagramType = "usecase" | "class" | "sequence" | "er" | "flowchart";

interface GenerateResult {
  type: DiagramType;
  code: string;
  label: string;
}

const TEMPLATES: Record<DiagramType, (entities: string[], topic: string) => string> = {
  usecase: (entities, topic) => {
    const actors = entities.slice(0, 3);
    const useCases = extractActions(topic);
    let lines = ["flowchart LR"];
    actors.forEach((a) => {
      lines.push(`  ${sanitize(a)}(("${a}"))`);
    });
    useCases.forEach((uc, i) => {
      lines.push(`  UC${i}["${uc}"]`);
    });
    actors.forEach((a) => {
      useCases.slice(0, 2).forEach((_, i) => {
        lines.push(`  ${sanitize(a)} --> UC${i}`);
      });
    });
    return lines.join("\n");
  },

  class: (entities, topic) => {
    let lines = ["classDiagram"];
    entities.forEach((e) => {
      const name = sanitize(e);
      lines.push(`  class ${name} {`);
      lines.push(`    -id: String`);
      lines.push(`    -name: String`);
      lines.push(`    +create()`);
      lines.push(`    +update()`);
      lines.push(`  }`);
    });
    for (let i = 0; i < entities.length - 1; i++) {
      lines.push(`  ${sanitize(entities[i])} --> ${sanitize(entities[i + 1])}`);
    }
    return lines.join("\n");
  },

  sequence: (entities, topic) => {
    const actors = entities.slice(0, 5);
    let lines = ["sequenceDiagram"];
    lines.push("  autonumber");
    actors.forEach((a) => lines.push(`  participant ${sanitize(a)}`));
    for (let i = 0; i < actors.length - 1; i++) {
      lines.push(`  ${sanitize(actors[i])}->>+${sanitize(actors[i + 1])}: request`);
      lines.push(`  ${sanitize(actors[i + 1])}-->>-${sanitize(actors[i])}: response`);
    }
    return lines.join("\n");
  },

  er: (entities, topic) => {
    let lines = ["erDiagram"];
    entities.forEach((e) => {
      const name = sanitize(e).toUpperCase();
      lines.push(`  ${name} {`);
      lines.push(`    string id PK`);
      lines.push(`    string name`);
      lines.push(`    datetime created_at`);
      lines.push(`  }`);
    });
    for (let i = 0; i < entities.length - 1; i++) {
      lines.push(
        `  ${sanitize(entities[i]).toUpperCase()} ||--o{ ${sanitize(entities[i + 1]).toUpperCase()} : has`
      );
    }
    return lines.join("\n");
  },

  flowchart: (entities, topic) => {
    const steps = extractActions(topic);
    let lines = ["flowchart TD"];
    steps.forEach((s, i) => {
      const id = String.fromCharCode(65 + i);
      if (i === 0) lines.push(`  ${id}([${s}])`);
      else if (i === steps.length - 1) lines.push(`  ${id}([${s}])`);
      else if (s.toLowerCase().includes("check") || s.toLowerCase().includes("valid"))
        lines.push(`  ${id}{${s}}`);
      else lines.push(`  ${id}[${s}]`);
    });
    for (let i = 0; i < steps.length - 1; i++) {
      const a = String.fromCharCode(65 + i);
      const b = String.fromCharCode(65 + i + 1);
      lines.push(`  ${a} --> ${b}`);
    }
    return lines.join("\n");
  },
};

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, "");
}

function extractEntities(prompt: string): string[] {
  const words = prompt.split(/[\s,;.]+/);
  const candidates: string[] = [];
  const stopWords = new Set([
    "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
    "from","as","is","was","are","were","be","been","being","have","has","had",
    "do","does","did","will","would","could","should","can","may","might",
    "that","this","these","those","it","its","i","you","we","they","he","she",
    "my","your","our","their","his","her","not","no","up","out","if","when",
    "then","than","so","just","also","use","using","via","only","each","all",
  ]);
  words.forEach((w) => {
    const clean = w.replace(/[^a-zA-Z]/g, "");
    if (clean.length > 2 && clean[0] === clean[0].toUpperCase() && !stopWords.has(clean.toLowerCase())) {
      if (!candidates.includes(clean)) candidates.push(clean);
    }
  });
  if (candidates.length < 3) {
    const nouns = ["User", "System", "Database", "Service", "Client", "Server", "API"];
    nouns.forEach((n) => {
      if (candidates.length < 5 && !candidates.includes(n)) candidates.push(n);
    });
  }
  return candidates.slice(0, 8);
}

function extractActions(prompt: string): string[] {
  const verbs = prompt
    .split(/[,.;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 6);
  if (verbs.length < 3) {
    return ["Start", "Process input", "Validate", "Execute", "Return result", "End"];
  }
  return ["Start", ...verbs.slice(0, 4).map((v) => v.slice(0, 40)), "End"];
}

export function generateDiagrams(prompt: string): GenerateResult[] {
  const entities = extractEntities(prompt);
  const types: DiagramType[] = ["class", "sequence", "er", "flowchart", "usecase"];
  return types.map((type) => ({
    type,
    code: TEMPLATES[type](entities, prompt),
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Diagram`,
  }));
}

export function generateSingleDiagram(prompt: string, type: DiagramType): string {
  const entities = extractEntities(prompt);
  return TEMPLATES[type](entities, prompt);
}
