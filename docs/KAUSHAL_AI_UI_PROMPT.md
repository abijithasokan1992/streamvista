# Kaushal AI — UI Build Prompt

Build an Android-first Flutter app called **Kaushal AI** for Indian blue-collar workers learning EV technician, plumbing and electrical skills.

## Visual direction
Super-simple, friendly and voice-first. Inspired by the engagement loops of ShareChat and Duolingo, but designed for practical vocational learning. Use large icons, large typography, clear cards, generous spacing, minimal text, local-language labels and obvious primary actions. Avoid English in learner-critical screens.

## Primary navigation
Bottom navigation with four large destinations:
- Learn
- Practice
- Jobs
- Saathi

Profile/settings can be reached from the top-right avatar.

## Onboarding
Screen 1: choose language with three giant cards: தமிழ் / తెలుగు / हिन्दी.
Screen 2: choose trade: EV Technician / Plumber / Electrician.
Screen 3: explain the learning loop using icons: Learn → Practice → Assessment → Certificate → Job.
Screen 4: optional notification/download permissions.

## /learn
- Greeting in selected language
- Current trade badge
- Daily streak with large number
- Continue-learning hero card
- 3-minute lesson cards with duration, progress and play button
- Download icon for offline packs
- Module map with locked/unlocked/completed states
- Daily practice reminder

## Lesson player
- Full-width video
- Local-language subtitle/transcript
- Giant play/pause and replay controls
- Voice playback speed control
- Step-by-step task cards below video
- Safety warning card before hazardous procedures
- Finish lesson CTA

## /practice
- Large camera button: “பயிற்சி செய்” / equivalent selected-language copy
- Task name and required tools
- Visual task checklist
- Camera framing guide
- Record / stop / retake controls
- Upload progress indicator
- AI feedback card with confidence percentage
- Show exactly what was detected and what step needs another attempt
- Never display “Certified” from computer vision alone

## /jobs
- Location selector
- Trade filter
- Job cards with company, area, pay range, distance and apply CTA
- Application status timeline
- “Skills matched” indicator
- Keep third-party job-source integration behind a service adapter; do not hardcode claims that external APIs are live.

## /saathi
Voice-first screen with one large microphone button.
- Selected-language greeting
- Listening state
- Transcription
- Spoken answer
- Suggested quick questions represented by icons
- Offline indicator when operating from cached curriculum
- Escalate uncertain/high-risk technical questions to an instructor

## Subscription
- ₹500/month plan card
- UPI AutoPay CTA
- Benefits list using icons
- Eligibility/subsidy check flow separated from payment
- Never show a subsidy as guaranteed before eligibility verification

## Certificate
- Assessment progress
- Required modules
- Practical assessment status
- Certificate eligibility state
- Download/share only after verified issuance

## B2B placement dashboard
Separate employer-facing experience:
- learners enrolled
- active learners
- assessment completion
- job-ready learners
- interviews
- placements
- placement rate
- target KPI can be displayed as a target, not a guaranteed outcome unless contractually evidenced

## Offline-first
- Show download size before download
- Example: “Trade Pack · 50 MB”
- Download progress
- Storage usage
- Available offline badge
- Sync queue when connectivity returns

## Accessibility
- Minimum 48dp touch targets
- Voice interaction wherever text entry is unnecessary
- Support low literacy through icons and audio
- Avoid dense tables
- Use device haptics sparingly for confirmation/error states
- Test Tamil, Telugu and Hindi text wrapping on small Android screens

## Design tokens
Use a warm, approachable visual system with soft surfaces, rounded cards, strong primary CTA treatment and clear success/error states. Avoid overly decorative glassmorphism; performance and legibility take priority on low-end Android devices.

## Engineering contract
Flutter Android-first. Firebase Auth + Storage. Keep API keys/secrets out of the client. Model calls go through controlled backend endpoints. Cache only content explicitly permitted for offline use. Record model confidence and evidence for practice attempts so feedback can be audited.
