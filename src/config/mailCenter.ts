export type MailLane =
  | "revenue"
  | "buyers"
  | "owners"
  | "licensing"
  | "rentals"
  | "crayons-loop"
  | "finance"
  | "support"
  | "legal"
  | "platform-alerts"
  | "newsletters";

export type MailPriority = "urgent" | "high" | "normal" | "low";

export interface MailIdentity {
  address: string;
  owner: string;
  role: string;
  canApprove: boolean;
}

export interface MailRoutingRule {
  id: string;
  lane: MailLane;
  folder: string;
  priority: MailPriority;
  assignee: string;
  keywords: string[];
  senderDomains?: string[];
}

export const SARIN_NOTIFICATION_RECIPIENT = "support-bridge@crayonspictures.com";

export const MAIL_IDENTITIES: MailIdentity[] = [
  {
    address: "abijithasokan@crayonspictures.com",
    owner: "Abijith Asokan",
    role: "Founder / Final Approval",
    canApprove: true,
  },
  {
    address: SARIN_NOTIFICATION_RECIPIENT,
    owner: "Sarin",
    role: "Support / Crayons Bridge / Mandatory Event Notification",
    canApprove: false,
  },
  {
    address: "finance-bridge@crayonspictures.com",
    owner: "Aruna Sankar CA",
    role: "Finance / Accounts / Compliance",
    canApprove: false,
  },
];

export const MAIL_FOLDERS = {
  revenue: "INBOX.01 Revenue Leads",
  buyers: "INBOX.02 Content Buyers",
  owners: "INBOX.03 Content Owners",
  licensing: "INBOX.04 Licensing",
  rentals: "INBOX.05 Camera Rentals",
  "crayons-loop": "INBOX.06 Crayons Loop",
  finance: "INBOX.07 Finance - Aruna",
  support: "INBOX.08 Support - Sarin",
  legal: "INBOX.09 Legal & Compliance",
  "platform-alerts": "INBOX.10 Platform Alerts",
  newsletters: "INBOX.99 Newsletters",
} satisfies Record<MailLane, string>;

export const MAIL_ROUTING_RULES: MailRoutingRule[] = [
  {
    id: "urgent-security-billing",
    lane: "platform-alerts",
    folder: MAIL_FOLDERS["platform-alerts"],
    priority: "urgent",
    assignee: "Abijith Asokan",
    keywords: ["security alert", "terminated", "suspended", "action required", "verification code", "failed payment"],
    senderDomains: ["google.com", "openai.com", "razorpay.com", "supabase.com", "statuspage.io"],
  },
  {
    id: "finance-compliance",
    lane: "finance",
    folder: MAIL_FOLDERS.finance,
    priority: "high",
    assignee: "Aruna Sankar CA",
    keywords: ["invoice", "payment", "tax", "gst", "duns", "d-u-n-s", "bank", "finance", "accounts", "compliance"],
  },
  {
    id: "support-creator",
    lane: "support",
    folder: MAIL_FOLDERS.support,
    priority: "high",
    assignee: "Sarin",
    keywords: ["support", "upload failed", "login issue", "creator", "submission", "help", "error"],
  },
  {
    id: "licensing-buyers",
    lane: "licensing",
    folder: MAIL_FOLDERS.licensing,
    priority: "high",
    assignee: "Abijith Asokan",
    keywords: ["licensing", "acquisition", "distribution", "ott", "broadcast", "fast", "avod", "rights", "catalogue", "buyer"],
  },
  {
    id: "camera-rentals",
    lane: "rentals",
    folder: MAIL_FOLDERS.rentals,
    priority: "high",
    assignee: "Abijith Asokan",
    keywords: ["camera rental", "lens rental", "lighting rental", "equipment rental", "studio rental", "booking"],
  },
  {
    id: "crayons-loop",
    lane: "crayons-loop",
    folder: MAIL_FOLDERS["crayons-loop"],
    priority: "normal",
    assignee: "Abijith Asokan",
    keywords: ["crayons loop", "fast channel", "channel distribution", "programming schedule", "ad sales"],
  },
  {
    id: "marketing-newsletters",
    lane: "newsletters",
    folder: MAIL_FOLDERS.newsletters,
    priority: "low",
    assignee: "Unassigned",
    keywords: ["newsletter", "digest", "unsubscribe", "promotion", "weekly update"],
    senderDomains: ["linkedin.com", "substack.com", "medium.com", "smartbrief.com"],
  },
];

export function notificationRecipientsForEvent(primaryAssignee?: string): string[] {
  const recipients = new Set<string>([SARIN_NOTIFICATION_RECIPIENT]);

  if (primaryAssignee === "Abijith Asokan") {
    recipients.add("abijithasokan@crayonspictures.com");
  }

  if (primaryAssignee === "Aruna Sankar CA") {
    recipients.add("finance-bridge@crayonspictures.com");
  }

  return [...recipients];
}
