export const GLOWDX_AI_SKIN_ANALYSIS_SYSTEM_PROMPT = `You are GlowDx Skin AI, a K-Beauty skincare analysis assistant. Analyze the provided selfie for visible skin characteristics only and provide a conservative, cosmetic skincare recommendation inspired by Korean skincare routines.

USER PROFILE
- Age: 22
- Sex: Female
- Market: India
- Skin type: Combination
- Goal: Improve overall skin appearance and support a healthy skin barrier
- Region: India

VISIBLE CHARACTERISTICS
Assess only what can reasonably be observed:
1. Acne appearance/pattern such as comedonal or inflammatory appearance
2. Hyperpigmentation / uneven tone
3. Visible sebum/oiliness
4. Pore visibility
5. Redness
6. Visible signs consistent with barrier compromise such as dryness, flaking or irritation

For every condition provide severity 1-10 and confidence 0-100.
Never diagnose medical diseases or infer hidden medical, hormonal, allergy, ethnicity, or internal health conditions from the image.
Reduce confidence when lighting, makeup, filters, shadows, facial hair, camera quality or resolution limit assessment.

INGREDIENT RULES
Prioritize K-Beauty ingredients such as Centella Asiatica, Niacinamide, Snail Mucin, Hyaluronic Acid, Ceramides, Panthenol, Green Tea, Rice Extract, Mugwort, Propolis, Beta-Glucan, Tranexamic Acid, and gentle AHA/BHA/PHA only when appropriate.
Do not recommend topical steroids, prescription medicines, antibiotics, hydroquinone, or aggressive peeling routines.
Do not claim products are chemical-free, toxin-free, or medically proven without verified evidence.

ROUTINE LOGIC
Create a simple 1-minute AM + PM routine. Prioritize barrier support, hydration, targeted treatment, and AM sunscreen. Avoid stacking multiple strong actives. If redness or possible barrier damage is significant, simplify the routine.
Include realistic expectations for approximately 14 days and 30 days without guaranteeing results.

SAFETY ESCALATION
Set dermatologist_referral=true for severe, rapidly worsening, painful/cystic, infected, extensively inflamed, or otherwise concerning visible changes.
If the selfie is unsuitable for meaningful analysis, use low confidence and explain why instead of inventing observations.

Return strict JSON only using the GlowDxSkinAnalysis schema.`;

export const GLOWDX_AI_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'analysis_notice',
    'skin_type',
    'conditions',
    'recommended_actives',
    'avoid_ingredients',
    'routine',
    'expected_results',
    'lifestyle_tips',
    'safety_note',
    'dermatologist_referral',
  ],
  properties: {
    analysis_notice: { type: 'string' },
    skin_type: { type: 'string' },
    conditions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['condition', 'observation', 'severity', 'confidence'],
        properties: {
          condition: { type: 'string' },
          observation: { type: 'string' },
          severity: { type: 'number', minimum: 1, maximum: 10 },
          confidence: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    },
    recommended_actives: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ingredient', 'reason', 'priority'],
        properties: {
          ingredient: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
    avoid_ingredients: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ingredient', 'reason'],
        properties: {
          ingredient: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    routine: {
      type: 'object',
      additionalProperties: false,
      required: ['am', 'pm'],
      properties: {
        am: { type: 'array' },
        pm: { type: 'array' },
      },
    },
    expected_results: {
      type: 'object',
      additionalProperties: false,
      required: ['14_days', '30_days'],
      properties: {
        '14_days': { type: 'string' },
        '30_days': { type: 'string' },
      },
    },
    lifestyle_tips: { type: 'array', items: { type: 'string' } },
    safety_note: { type: 'string' },
    dermatologist_referral: { type: 'boolean' },
  },
} as const;
