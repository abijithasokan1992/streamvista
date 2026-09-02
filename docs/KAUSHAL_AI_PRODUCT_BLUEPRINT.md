# Kaushal AI — India Vernacular Skilling Platform

## Product
Kaushal AI is a voice-first, offline-first blue-collar skilling app for EV technicians, plumbers and electricians, launching Android-first in Tamil, Telugu and Hindi.

## Core journey
1. Language → trade selection
2. 3-minute AI tutor lessons: voice + video + hands-on visual/AR guidance
3. Practice: learner records/uploads a task video; computer vision checks visible task steps and tool usage
4. Assessment → eligible certification workflow → job matching
5. Saathi: offline-capable voice assistant for learning and revision

## App information architecture
- `/learn`: Duolingo-style streak, progress, module cards, downloaded lessons
- `/practice`: camera capture, task checklist, visual feedback, retake
- `/jobs`: local opportunities, filters, application status
- `/saathi`: voice-first assistant, offline lesson Q&A and revision
- `/profile`: language, trade, certificates, subscription and placement profile

## UX principles
- No English required for learner-critical flows
- Large tap targets and icon-led navigation
- Voice-first interaction with readable local-language text fallback
- High-contrast, low-bandwidth UI
- Downloadable lesson packs, target 50MB per trade pack
- Friendly progress loops: streaks, XP, module completion and practical mastery

## AI architecture
### Tutor
- Curriculum content stored as structured modules: objective, tools, safety, steps, quiz, practice task
- Sarvam AI / AI4Bharat for supported Indian-language TTS/STT
- Whisper for transcription where appropriate
- AI responses must stay within approved curriculum and safety boundaries

### Practice vision
- YOLO-based tool/object detection for supported task categories
- Optional pose/hand landmark model for step verification
- Pipeline: upload → frame sampling → tool/scene detection → step evidence → confidence → learner feedback
- Never claim that CV alone proves electrical safety, plumbing pressure integrity, or professional competence. Human/instructor review can be required for high-risk assessments.

### Saathi
- Offline lesson index + cached transcripts + deterministic FAQs
- Online fallback for richer conversational help
- Audio responses in selected language
- Clear escalation to instructor for uncertain/high-risk questions

## Certification & placement
- Track assessment evidence and certificate eligibility separately from a government certification claim.
- Integrate NSDC/Skill India pathways only after the relevant official partner/API/credential contract is verified.
- Do not advertise a certificate as government/NSDC-issued unless the exact accreditation and issuance flow is live and verified.
- B2B placement dashboard may show a target such as 90%, but must label it as a target/contractual KPI unless independently evidenced.

## Commerce
- Razorpay UPI subscription target: ₹500/month
- Subsidy flow: show a 50% subsidy eligibility/claim workflow only when the applicable Skill India scheme, eligibility rules and reimbursement mechanism are verified.
- Never promise subsidy approval before eligibility verification.

## Creator pipeline
Tamil-first authoring → approved translation/localization → Sarvam-supported dubbing → human QA → Telugu/Hindi publication.

## Data model
Core entities:
- users
- learner_profiles
- trades
- courses
- modules
- lesson_assets
- downloads
- practice_attempts
- practice_evidence
- assessments
- certificates
- jobs
- applications
- subscriptions
- placement_outcomes
- creator_assets
- localization_versions

## Safety
Electrical, EV high-voltage, gas/plumbing pressure and tool-operation lessons require explicit safety gates, PPE guidance and instructor escalation. AI feedback is educational assistance, not a substitute for qualified supervision.

## Android-first implementation
Preferred production stack: Flutter + Firebase Auth/Storage/Firestore where suitable. Keep sensitive verification and entitlement logic server-side. Use signed/download-controlled media rather than exposing unrestricted storage objects.

## MVP release gates
- Tamil language flow works end-to-end
- One trade has a complete 3-minute curriculum sequence
- Offline lesson download and playback verified
- Practice capture works on representative Android devices
- Vision feedback is confidence-based and does not fabricate correctness
- Subscription flow tested in Razorpay test mode before production
- Certification and job integrations verified before being represented as live
- Analytics, crash reporting and consent/privacy flows verified
