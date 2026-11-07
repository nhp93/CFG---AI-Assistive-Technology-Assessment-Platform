import type { McqQuestion } from './types'

export interface RecommendationItem {
  id: string
  title: string
  category: string
  badge: string
  description: string
  keyBenefits: string[]
  accessTip: string
  suggestedAction: string
}

export interface RecommendationFeedback {
  recommendationId: string
  reaction: 'like' | 'dislike' | null
  selectedTags: string[]
  comment: string
}

// ---------------------------------------------------------------------------
// 1. PRIMARY FORK: Personal vs. Career
// ---------------------------------------------------------------------------
export const PRIMARY_FORK_QUESTION: McqQuestion = {
  id: 'primary_focus',
  title: 'What is your primary focus today?',
  instruction: 'Choose the area that matters most to you. We will tailor the questions and recommendations to match your goals.',
  options: [
    {
      id: 'personal',
      label: 'Personal (Daily Needs & Independence)',
      description: 'Daily living tasks at home, reading mail, appliances, leisure, and community mobility.',
    },
    {
      id: 'career',
      label: 'Career & Employment',
      description: 'Job preparation, workplace accommodations, career exploration, or current employment tasks.',
    },
  ],
}

// ---------------------------------------------------------------------------
// 2. BRANCH A: Personal (Daily Needs & Independence)
// ---------------------------------------------------------------------------
export const PERSONAL_QUESTIONS: McqQuestion[] = [
  {
    id: 'personal_home',
    title: 'Which daily living task at home would you like to make easier?',
    instruction: 'Select the home activity where low vision causes the most frustration.',
    options: [
      { id: 'kitchen', label: 'Kitchen & Cooking', description: 'Reading oven dials, measuring food, and stove safety.' },
      { id: 'medication', label: 'Medication Management', description: 'Reading prescription bottles, warning labels, and dosage instructions.' },
      { id: 'mail', label: 'Personal Mail & Bills', description: 'Sorting through printed mail, reading utility bills, and handwriting.' },
      { id: 'clothing', label: 'Clothing & Housekeeping', description: 'Identifying garment colors, doing laundry, and home organizing.' },
    ],
  },
  {
    id: 'personal_reading',
    title: 'How do you currently prefer to read print or personal documents?',
    instruction: 'Choose the reading method you use most or wish to improve.',
    options: [
      { id: 'magnifier', label: 'Optical or Electronic Video Magnifier', description: 'Handheld lighted magnifying glass or digital desktop CCTV monitor.' },
      { id: 'tts', label: 'Text-to-Speech Audio Reader', description: 'Scanning a printed page with a smartphone app to hear it read aloud.' },
      { id: 'voice_assistant', label: 'Voice Assistant / Smart Speaker', description: 'Using Siri, Google Assistant, or Alexa for quick answers and reminders.' },
      { id: 'human', label: 'Family or Sighted Assistance', description: 'Relying on a family member or caregiver to read things aloud.' },
    ],
  },
  {
    id: 'personal_digital',
    title: 'Which device do you use most often for personal tasks?',
    instruction: 'Select your primary digital gadget for staying connected.',
    options: [
      { id: 'smartphone', label: 'Smartphone (iPhone or Android)', description: 'Using accessibility features like Large Text, Zoom, or TalkBack / VoiceOver.' },
      { id: 'computer', label: 'Desktop Computer or Laptop', description: 'Windows PC or Mac with high-contrast themes and screen magnification.' },
      { id: 'tablet', label: 'Tablet or iPad', description: 'Larger touch screen with pinch-to-zoom for reading and videos.' },
      { id: 'minimal', label: 'I Rarely Use Digital Devices', description: 'Looking for simple, non-digital or basic push-button accessibility.' },
    ],
  },
  {
    id: 'personal_mobility',
    title: 'When moving around your home or community, what would help most?',
    instruction: 'Choose the accessibility modification that would give you the most confidence.',
    options: [
      { id: 'contrast_lighting', label: 'High-Contrast Markers & Task Lighting', description: 'Bright glare-free lamps and bright tactile edge markers on stairs and switches.' },
      { id: 'talking_gadgets', label: 'Talking Audio Devices', description: 'Talking clocks, audio kitchen scales, and voice-labeled buttons.' },
      { id: 'magnification_signs', label: 'Portable Monocular or Sign Magnifier', description: 'Spotting street signs, bus route numbers, and aisle labels.' },
      { id: 'navigation_apps', label: 'GPS Wayfinding & AI Assistant Apps', description: 'Apps like Seeing AI, Be My Eyes, or Soundcraft for real-time guidance.' },
    ],
  },
  {
    id: 'personal_leisure',
    title: 'What leisure activities or hobbies do you enjoy or want to resume?',
    instruction: 'Tell us how you spend your free time so we can recommend adaptive leisure tools.',
    options: [
      { id: 'reading_books', label: 'Reading Books & News', description: 'Large print books, Talking Books from the National Library Service (NLS), or Kindle.' },
      { id: 'crafts_tactile', label: 'Crafts, Gardening, or Hands-On Hobbies', description: 'Tactile measuring tapes, specialized hobby lighting, and bump dots.' },
      { id: 'social_calls', label: 'Connecting with Family & Friends', description: 'Accessible phone calls, FaceTime/video, and voice messaging.' },
      { id: 'music_news', label: 'Listening to Audio Entertainment', description: 'Podcasts, radio broadcasts, audiobooks, and musical instruments.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// 3. BRANCH B: Career & Employment
// ---------------------------------------------------------------------------
export const CAREER_FORK_QUESTION: McqQuestion = {
  id: 'career_path_choice',
  title: 'Do you have a set career path, or are you exploring options?',
  instruction: 'Choose whether you need accommodations for an existing field or want to discover new vocational paths.',
  options: [
    {
      id: 'set_path',
      label: 'Yes, I have a set career path or current job',
      description: 'I need assistive tech solutions, workstation ergonomics, and task accommodations for my field.',
    },
    {
      id: 'exploring',
      label: 'No, I am exploring options and discovering what fits',
      description: 'I want to discover job areas that match my strengths, interests, and accessible training opportunities.',
    },
  ],
}

// Sub-branch B1: Career Set Path
export const CAREER_SET_PATH_QUESTIONS: McqQuestion[] = [
  {
    id: 'work_environment',
    title: 'What type of workplace environment best describes your target job?',
    instruction: 'Select the primary setting where you perform work tasks.',
    options: [
      { id: 'digital_office', label: 'Digital Office / Remote Computer Work', description: 'Desk workstation using computers, email, databases, and digital files.' },
      { id: 'manufacturing', label: 'Manufacturing / Assembly / Production Floor', description: 'Physical workshop, assembly line, machinery, or warehouse inventory.' },
      { id: 'customer_service', label: 'Customer Service / Call Center', description: 'Telephone headsets, ticket queues, multi-window screen navigation.' },
      { id: 'retail_hospitality', label: 'Retail, Hospitality, or Field Work', description: 'Face-to-face service, POS terminals, inventory stocking, and mobility.' },
    ],
  },
  {
    id: 'work_barriers',
    title: 'Which daily work task poses the biggest barrier for your vision?',
    instruction: 'Identify the task that causes the most eye fatigue or slows you down.',
    options: [
      { id: 'screen_data', label: 'Dense Screen Text & Spreadsheets', description: 'Reading complex spreadsheets, data tables, or small database forms.' },
      { id: 'machinery_tools', label: 'Operating Machinery & Physical Assembly', description: 'Locating small parts, measuring tolerances, and tactile equipment control.' },
      { id: 'communication_speed', label: 'Rapid Email & Multitasking Windows', description: 'Keeping up with instant messages, emails, and jumping between apps.' },
      { id: 'inspection', label: 'Detailed Visual Quality Inspection', description: 'Inspecting printed labels, barcodes, material finishes, or physical flaws.' },
    ],
  },
  {
    id: 'work_current_tools',
    title: 'What assistive tools or modifications have you already tried at work?',
    instruction: 'Choose your current level of workplace assistive technology experience.',
    options: [
      { id: 'screen_magnifier', label: 'Screen Magnification (ZoomText / MagSafe)', description: 'Magnifying screen windows up to 2x–8x with pointer enhancement.' },
      { id: 'screen_reader', label: 'Screen Readers (JAWS / NVDA / VoiceOver)', description: 'Full speech synthesis and keyboard shortcuts without relying on mouse vision.' },
      { id: 'large_monitor', label: 'Hardware Upgrades (Large Monitor / Lighting)', description: '32”+ high-contrast display, articulating monitor arm, or task lighting.' },
      { id: 'none_yet', label: 'None Yet / Looking for Recommendations', description: 'Have not used formal workplace assistive tech; seeking professional guidance.' },
    ],
  },
  {
    id: 'work_input_method',
    title: 'How do you navigate and enter information on workplace systems?',
    instruction: 'Select your preferred method for computer input.',
    options: [
      { id: 'touch_typing', label: 'Standard Keyboard Touch Typing', description: 'Comfortable typing by muscle memory using home-row locator nubs.' },
      { id: 'large_keyboard', label: 'High-Contrast, Large-Print Keyboard', description: 'Yellow-on-black or white-on-black high-visibility oversized keys.' },
      { id: 'mouse_pointer', label: 'Mouse with Extra-Large Glowing Cursor', description: 'High-visibility neon mouse pointer with inverted tracking lines.' },
      { id: 'voice_dictation', label: 'Speech-to-Text Voice Dictation', description: 'Using dictation tools (Dragon / Windows Speech) to speak input.' },
    ],
  },
  {
    id: 'work_support_need',
    title: 'What type of workplace accommodation or support would help you most?',
    instruction: 'Tell us how Lions Services staff can best support your employment goals.',
    options: [
      { id: 'software_training', label: 'One-on-One Assistive Software Training', description: 'Personalized coaching on ZoomText, JAWS, or Excel shortcuts.' },
      { id: 'job_coaching', label: 'Workstation Ergonomic & Task Assessment', description: 'An assessor reviews your physical setup, lighting, and task layout.' },
      { id: 'checklists', label: 'Accessible Checklists & Tactile Workflow', description: 'Color-coded templates, bump dots, and clear SOPs for daily steps.' },
      { id: 'equipment_loan', label: 'Equipment Loan & Work Trial', description: 'Testing assistive devices in your actual workspace before purchasing.' },
    ],
  },
]

// Sub-branch B2: Career Exploring
export const CAREER_EXPLORING_QUESTIONS: McqQuestion[] = [
  {
    id: 'interest_bucket',
    title: 'Which area of work sounds most exciting to you?',
    instruction: 'Pick the field that best matches your natural curiosity and interests.',
    options: [
      { id: 'technology', label: 'Technology & Digital Accessibility', description: 'Testing websites/apps for accessibility, IT helpdesk, and assistive tech support.' },
      { id: 'office', label: 'Digital Office & Administration', description: 'Customer service, data entry, calendar scheduling, and team communication.' },
      { id: 'manufacturing', label: 'Hands-On Assembly & Manufacturing', description: 'Tactile manufacturing, precision sewing, packaging, and shipping at Lions Services.' },
      { id: 'creative', label: 'Art, Creative & Communications', description: 'Audio editing, podcasting, community outreach, and storytelling.' },
    ],
  },
  {
    id: 'work_setting_pref',
    title: 'What work setting feels most comfortable for you?',
    instruction: 'Choose your ideal day-to-day work environment.',
    options: [
      { id: 'independent', label: 'Quiet Independent Workstation', description: 'Focused individual tasks with controlled lighting and low distraction.' },
      { id: 'team', label: 'Collaborative Team Environment', description: 'Working alongside supportive peers with clear team goals and communication.' },
      { id: 'workshop', label: 'Active Workshop / Production Floor', description: 'Hands-on movement, tactile stations, and structured physical production.' },
      { id: 'hybrid', label: 'Flexible Hybrid / Remote Option', description: 'Combining remote home office comfort with scheduled on-site collaboration.' },
    ],
  },
  {
    id: 'learning_pref',
    title: 'How do you prefer to learn new job skills?',
    instruction: 'Tell us the learning format that helps you succeed fastest.',
    options: [
      { id: 'coached', label: 'Hands-On Guided Practice with an Assessor', description: 'One-on-one coaching with live demonstrations and immediate feedback.' },
      { id: 'self_paced', label: 'Self-Paced Audio & Video Modules', description: 'Accessible step-by-step guides you can review at your own pace.' },
      { id: 'peer', label: 'Shadowing an Experienced Peer', description: 'Observing someone in the role and learning practical daily tips.' },
      { id: 'written', label: 'Structured Written / Braille Guides', description: 'Cheat sheets and reference manuals you can keep at your desk.' },
    ],
  },
  {
    id: 'six_month_goal',
    title: 'What is your main goal for the next 6 months?',
    instruction: 'Select your milestone for career growth.',
    options: [
      { id: 'digital_skills', label: 'Master Job-Ready Digital & Computer Skills', description: 'Build strong keyboard navigation, screen magnification, and email proficiency.' },
      { id: 'competitive_job', label: 'Enter Competitive Integrated Employment', description: 'Prepare for job placement, resume tailoring, and interview accommodations.' },
      { id: 'independence', label: 'Build Confidence in Daily Independence', description: 'Establish assistive tech routines so you feel self-reliant in any setting.' },
      { id: 'lions_vocational', label: 'Explore Lions Services Vocational Opportunities', description: 'Tour Lions Services production facilities and join job training tracks.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// 4. Branch Router Engine
// ---------------------------------------------------------------------------
export function getAdaptiveQuestionPath(answers: Record<string, string>): McqQuestion[] {
  const path: McqQuestion[] = [PRIMARY_FORK_QUESTION]
  const primaryFocus = answers.primary_focus

  if (primaryFocus === 'personal') {
    return [...path, ...PERSONAL_QUESTIONS]
  }

  if (primaryFocus === 'career') {
    path.push(CAREER_FORK_QUESTION)
    const careerPathChoice = answers.career_path_choice
    if (careerPathChoice === 'set_path') {
      return [...path, ...CAREER_SET_PATH_QUESTIONS]
    }
    if (careerPathChoice === 'exploring') {
      return [...path, ...CAREER_EXPLORING_QUESTIONS]
    }
  }

  return path
}

// ---------------------------------------------------------------------------
// 5. Tailored Recommendations Engine
// ---------------------------------------------------------------------------
export function getAdaptiveRecommendations(answers: Record<string, string>): RecommendationItem[] {
  const primaryFocus = answers.primary_focus
  const list: RecommendationItem[] = []

  if (primaryFocus === 'personal') {
    const homePref = answers.personal_home
    const readPref = answers.personal_reading

    if (homePref === 'medication' || homePref === 'kitchen') {
      list.push({
        id: 'rec_talking_prescriptions',
        title: 'ScripTalk Talking Prescription Reader & Audio Labels',
        category: 'Personal Care & Medication',
        badge: 'High Impact',
        description: 'RFID-enabled audio labels that speak medication names, dosage, and doctor warnings aloud automatically when placed on the reader.',
        keyBenefits: ['Eliminates medication mix-ups', 'Zero screen vision required', 'Free service via many pharmacy chains'],
        accessTip: 'Pair with tactile bump dots on prescription bottle caps for quick recognition.',
        suggestedAction: 'Ask Lions Services staff for a free ScripTalk demonstration.',
      })
    }

    if (readPref === 'magnifier' || homePref === 'mail') {
      list.push({
        id: 'rec_electronic_magnifier',
        title: 'Full-Color HD Electronic Video Magnifier (7”–10”)',
        category: 'Reading & Documents',
        badge: 'Essential',
        description: 'Portable digital magnifier with adjustable 2x–32x magnification, high-contrast false colors (Yellow-on-Black / White-on-Black), and freeze-frame.',
        keyBenefits: ['Crystal-clear letter clarity without distortion', 'Comfortable stand for reading mail on tables', 'Lightweight portable design'],
        accessTip: 'Your chosen Yellow-on-Black contrast theme is natively supported on modern digital CCTV magnifiers.',
        suggestedAction: 'Schedule an equipment trial at Lions Services to test magnification models.',
      })
    }

    list.push({
      id: 'rec_ai_visual_assistant',
      title: 'Seeing AI & Envision Smart Vision Assistant',
      category: 'Smart Devices & Mobility',
      badge: 'Recommended',
      description: 'Free smartphone app that uses your phone camera to instantly speak short text, scan barcodes, identify currency, and describe your surroundings.',
      keyBenefits: ['Fast point-and-read capability for product boxes and mail', 'Works instantly on your current phone', 'Offline mode for grocery store aisle labels'],
      accessTip: 'Use your phone’s high-visibility large text mode alongside the audio reader.',
      suggestedAction: 'Request a 30-minute coached phone setup session with an assistive tech specialist.',
    })

    list.push({
      id: 'rec_tactile_home_kit',
      title: 'Tactile Home Marking & Glare-Free Task Lighting Kit',
      category: 'Daily Living & Independence',
      badge: 'Quick Win',
      description: 'A complete set of fluorescent orange bump dots, clear tactile locators, and an articulating 5000K daylight task lamp.',
      keyBenefits: ['Preset microwave and oven dial settings by touch', 'Locate key light switches in the dark', 'Reduces eye fatigue while reading bills'],
      accessTip: 'Tactile nubs eliminate the need to squint at unlit appliance buttons.',
      suggestedAction: 'Pick up a complimentary tactile home sample pack from Lions Services.',
    })
  } else {
    // Career Branch
    const careerPath = answers.career_path_choice
    const environment = answers.work_environment
    const interest = answers.interest_bucket

    if (environment === 'digital_office' || interest === 'office' || interest === 'technology') {
      list.push({
        id: 'rec_zoomtext_jaws',
        title: 'ZoomText Magnifier / Reader & Dual-Monitor Rig',
        category: 'Digital Workplace Suite',
        badge: 'Professional Standard',
        description: 'Industry-standard screen magnification and speech synthesis tailored for Microsoft Office, Google Workspace, and enterprise software.',
        keyBenefits: ['Smooth font smoothing up to 36x without pixelation', 'Mouse radar pointer locator that never gets lost', 'Synchronized speech for long emails'],
        accessTip: 'Matches your selected large cursor and high-contrast color palette directly on Windows & Mac.',
        suggestedAction: 'Schedule a vocational technology evaluation for employer accommodation funding.',
      })
    }

    if (environment === 'manufacturing' || interest === 'manufacturing') {
      list.push({
        id: 'rec_lions_manufacturing_track',
        title: 'Lions Services Tactile Manufacturing & Precision Assembly Track',
        category: 'Vocational Training & Employment',
        badge: 'Career Pathway',
        description: 'Integrated manufacturing positions at Lions Services Inc. featuring specialized ergonomic workstations, high-contrast parts bins, and tactile jigs.',
        keyBenefits: ['Competitive pay and comprehensive employee benefits', 'Accessible work floor engineered specifically for low-vision artisans', 'Supportive team environment with peer mentors'],
        accessTip: 'Tactile templates and high-intensity overhead task lighting eliminate fine-detail eye strain.',
        suggestedAction: 'Contact Lions Services intake coordinators to schedule an on-site facility tour.',
      })
    }

    list.push({
      id: 'rec_high_contrast_keyboard',
      title: 'LogicKeyboard High-Contrast Yellow-on-Black Work Keyboard',
      category: 'Workstation Ergonomics',
      badge: 'Ergonomic Tool',
      description: 'Oversized 40pt high-contrast bold lettering printed on durable mechanical keys with textured home-row locator nubs.',
      keyBenefits: ['Speeds up data entry by over 40%', 'Eliminates hunting and pecking on dim keyboards', 'Zero software installation required'],
      accessTip: 'The bold yellow keys mirror your selected Braille Institute high-contrast theme.',
      suggestedAction: 'Request a keyboard demo during your in-person evaluation.',
    })

    list.push({
      id: 'rec_job_coaching_services',
      title: 'Lions Services Vocational Evaluation & Job Placement Assistance',
      category: 'Vocational Services',
      badge: 'Staff Supported',
      description: 'Dedicated one-on-one consultation with certified Assistive Technology Instructional Specialists (CATIS) and vocational rehabilitation counselors.',
      keyBenefits: ['Workplace accommodation letters for your employer or HR', 'Free equipment loan programs for 30-day work trials', 'Ongoing technical support and skills coaching'],
      accessTip: 'Staff can directly export your online assessment telemetry to skip redundant testing.',
      suggestedAction: 'Click below to submit your profile directly for staff review.',
    })
  }

  return list
}

export function calculateAssessmentScore(answers: Record<string, string>): number {
  const answeredCount = Object.keys(answers).length
  if (answeredCount <= 1) return 50
  const base = Math.min(95, 60 + answeredCount * 6)
  return base
}

// ---------------------------------------------------------------------------
// 6. Compatibility & Legacy Schema Bridges (for Demo Data & Staff Dashboard)
// ---------------------------------------------------------------------------
export interface ScoredSkillResponse {
  questionId: string
  prompt: string
  answerId: string
  answerLabel: string
  score: number
  weight: number
}

export const LIMITATIONS: McqQuestion = {
  id: 'limitation',
  title: 'Which vision condition or limitation best describes your experience?',
  instruction: 'Choose the closest description.',
  options: [
    { id: 'glaucoma', label: 'Glaucoma' },
    { id: 'macular_degeneration', label: 'Macular degeneration' },
    { id: 'diabetic_retinopathy', label: 'Diabetic retinopathy' },
    { id: 'cataracts', label: 'Cataracts' },
    { id: 'retinitis_pigmentosa', label: 'Retinitis pigmentosa' },
    { id: 'other', label: 'Other vision limitation' },
    { id: 'not_sure', label: 'Not sure / Prefer not to say' },
  ],
}

export function getVisionImpactQuestion(limitation: string): McqQuestion {
  return {
    id: `impact_${limitation}`,
    title: 'Which screen task, if any, is most affected by your vision?',
    instruction: 'Select the main difficulty.',
    options: [
      { id: 'small_detail', label: 'Reading small text or fine detail' },
      { id: 'scan_layout', label: 'Scanning a page to find controls' },
      { id: 'contrast_glare', label: 'Distinguishing content or managing glare' },
      { id: 'none_other', label: 'None of these / something else' },
    ],
  }
}

export const GOALS: McqQuestion = {
  id: 'goal',
  title: 'What would you most like to do more independently?',
  options: [
    { id: 'documents', label: 'Read documents or find information' },
    { id: 'communication', label: 'Use email, calendar, or video calls' },
    { id: 'work_tasks', label: 'Complete work tasks or online forms' },
    { id: 'explore', label: 'Explore available options' },
  ],
}

export const FOLLOW_UPS: Record<string, McqQuestion> = {
  documents: { id: 'documents', title: 'What kind of material?', options: [{ id: 'digital', label: 'Digital documents' }, { id: 'scanned', label: 'Printed or scanned pages' }] },
  communication: { id: 'communication', title: 'Which communication task?', options: [{ id: 'email_read', label: 'Read emails' }, { id: 'video_call', label: 'Video meetings' }] },
  work_tasks: { id: 'work_tasks', title: 'Which workplace task?', options: [{ id: 'online_form', label: 'Online forms' }, { id: 'spreadsheet', label: 'Spreadsheets' }] },
  explore: { id: 'explore', title: 'Where should we start?', options: [{ id: 'device_basics', label: 'Device accessibility basics' }] },
}

export const TOOL_QUESTION: McqQuestion = {
  id: 'tool_familiarity',
  title: 'Which tools have you used for this kind of task?',
  options: [
    { id: 'magnification', label: 'Screen magnification' },
    { id: 'speech', label: 'Text-to-speech or screen reader' },
    { id: 'none_yet', label: 'Have not tried these tools yet' },
  ],
}

export const SUPPORT_QUESTION: McqQuestion = {
  id: 'support_preference',
  title: 'What kind of next step would be most useful to you?',
  options: [
    { id: 'self_paced', label: 'Self-paced guide' },
    { id: 'coached_practice', label: 'Coached practice with staff' },
  ],
}

export function getSkillQuestions(goal: string, detail: string, tool = 'none_yet'): McqQuestion[] {
  return [
    {
      id: 'skill_setup',
      title: 'Can you set up accessibility settings for your task?',
      options: [
        { id: 'independent', label: 'I can do this independently', score: 100 },
        { id: 'tools', label: 'I can do this with tools or occasional help', score: 75 },
        { id: 'guided', label: 'I need step-by-step guidance', score: 45 },
      ],
    },
  ]
}

export function getQuestionPath(flow: any): McqQuestion[] {
  return getAdaptiveQuestionPath(flow?.answers ?? flow ?? {})
}

export function calculateAbilityScore(responses: ScoredSkillResponse[]): number {
  if (!responses || !responses.length) return 70
  const valid = responses.filter((r) => typeof r.score === 'number')
  if (!valid.length) return 70
  return Math.round(valid.reduce((sum, r) => sum + r.score, 0) / valid.length)
}

export function getFocusLabel(goal: string, detail: string): string {
  if (goal === 'personal') return 'Personal Independence & Home Accessibility'
  if (goal === 'career') return 'Career, Employment & Workplace Accessibility'
  return 'Accessible Assistive Technology'
}

export function getRecommendation(goal: string, detail: string, score: number, prefs: any, tool = 'none_yet', support = 'coached_practice', impact = 'none_other') {
  return {
    title: `Personalized AT Practice: ${getFocusLabel(goal, detail)}`,
    tool: 'Explore customized video magnifiers, screen readers, and tactile labeling tools.',
    accessTip: 'Your selected high-contrast theme and large text settings will be shared with your assessor.',
    nextStep: 'Request an in-person assessment review with Lions Services assistive technology staff.',
  }
}

