import {
  MAIL_FOLDERS,
  MAIL_ROUTING_RULES,
  type MailLane,
  type MailPriority,
  type MailRoutingRule,
} from "../config/mailCenter";

export interface MailMessageInput {
  subject?: string | null;
  from?: string | null;
  to?: string[];
  cc?: string[];
  text?: string | null;
}

export interface MailClassification {
  lane: MailLane;
  folder: string;
  priority: MailPriority;
  assignee: string;
  matchedRuleId: string;
  confidence: number;
  matchedTerms: string[];
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().trim();
}

function domainOf(address: string): string {
  return normalize(address).split("@").at(-1) ?? "";
}

function scoreRule(message: MailMessageInput, rule: MailRoutingRule) {
  const haystack = [
    message.subject,
    message.from,
    ...(message.to ?? []),
    ...(message.cc ?? []),
    message.text,
  ]
    .map(normalize)
    .join(" ");

  const matchedTerms = rule.keywords.filter((keyword) =>
    haystack.includes(normalize(keyword)),
  );

  const senderDomain = domainOf(message.from ?? "");
  const domainMatched = (rule.senderDomains ?? []).some((domain) =>
    senderDomain === normalize(domain) || senderDomain.endsWith(`.${normalize(domain)}`),
  );

  const keywordScore = matchedTerms.length * 3;
  const domainScore = domainMatched ? 2 : 0;

  return {
    score: keywordScore + domainScore,
    matchedTerms,
  };
}

export function classifyMail(message: MailMessageInput): MailClassification {
  const ranked = MAIL_ROUTING_RULES.map((rule) => ({
    rule,
    ...scoreRule(message, rule),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score === 0) {
    return {
      lane: "revenue",
      folder: MAIL_FOLDERS.revenue,
      priority: "normal",
      assignee: "Abijith Asokan",
      matchedRuleId: "default-founder-review",
      confidence: 0.25,
      matchedTerms: [],
    };
  }

  return {
    lane: best.rule.lane,
    folder: best.rule.folder,
    priority: best.rule.priority,
    assignee: best.rule.assignee,
    matchedRuleId: best.rule.id,
    confidence: Math.min(0.99, 0.45 + best.score * 0.08),
    matchedTerms: best.matchedTerms,
  };
}

export function requiresFounderAttention(classification: MailClassification): boolean {
  return classification.priority === "urgent" || classification.assignee === "Abijith Asokan";
}
