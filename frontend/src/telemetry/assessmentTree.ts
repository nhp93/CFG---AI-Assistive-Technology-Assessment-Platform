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

const PERSONAL_GOALS = [
  { id: 'independent_living', label: 'Manage daily activities more independently' },
  { id: 'reading_info', label: 'Read documents and find information' },
  { id: 'community_access', label: 'Get around and access community services' },
  { id: 'leisure', label: 'Enjoy hobbies and connect with others' },
]

const CAREER_GOALS = [
  { id: 'current_job', label: 'Do tasks in my current job more independently' },
  { id: 'find_employment', label: 'Prepare for or find a job' },
  { id: 'explore_career', label: 'Explore career and training options' },
  { id: 'work_skills', label: 'Build skills for a future workplace' },
]

const GOAL_TASKS: Record<string, Array<{ id: string; label: string }>> = {
  independent_living: [
    { id: 'medication', label: 'Read medication labels and instructions' },
    { id: 'cooking', label: 'Use kitchen appliances and follow recipes' },
    { id: 'home_labels', label: 'Identify household items, clothing, or bills' },
    { id: 'household', label: 'Complete another task around the home' },
  ],
  reading_info: [
    { id: 'documents', label: 'Read printed documents or mail' },
    { id: 'web', label: 'Read websites and digital documents' },
    { id: 'forms', label: 'Complete online forms' },
    { id: 'books', label: 'Read books, news, or other long text' },
  ],
  community_access: [
    { id: 'navigation', label: 'Navigate familiar or new places' },
    { id: 'signage', label: 'Read signs, menus, or transit information' },
    { id: 'appointments', label: 'Use community or appointment services' },
    { id: 'transport', label: 'Plan or use public transportation' },
  ],
  leisure: [
    { id: 'hobbies', label: 'Take part in a hands-on hobby' },
    { id: 'social', label: 'Connect with family and friends' },
    { id: 'entertainment', label: 'Read or enjoy entertainment' },
    { id: 'crafts', label: 'Do crafts, gardening, or similar activities' },
  ],
  current_job: [
    { id: 'work_email', label: 'Read and respond to work messages' },
    { id: 'spreadsheets', label: 'Use spreadsheets or databases' },
    { id: 'work_forms', label: 'Complete workplace forms and records' },
    { id: 'inspection', label: 'Inspect products, labels, or materials' },
  ],
  find_employment: [
    { id: 'job_search', label: 'Search and apply for jobs online' },
    { id: 'resume', label: 'Create or update a resume' },
    { id: 'interviews', label: 'Prepare for interviews and communication' },
    { id: 'training', label: 'Access training materials' },
  ],
  explore_career: [
    { id: 'career_options', label: 'Research career options' },
    { id: 'work_sample', label: 'Try a sample work task' },
    { id: 'training', label: 'Access training materials' },
    { id: 'applications', label: 'Complete applications or enrollment forms' },
  ],
  work_skills: [
    { id: 'computer', label: 'Use a computer or workplace software' },
    { id: 'communication', label: 'Communicate with coworkers or customers' },
    { id: 'workflow', label: 'Follow a work routine or checklist' },
    { id: 'physical_tasks', label: 'Complete hands-on tasks safely' },
  ],
}

function goalQuestion(focus: string): McqQuestion {
  return {
    id: 'goal',
    title: focus === 'career' ? 'What would you most like to accomplish for work?' : 'What would you most like to do more independently?',
    instruction: 'Choose the goal that matters most to you right now.',
    options: (focus === 'career' ? CAREER_GOALS : PERSONAL_GOALS).map((option) => ({ ...option })),
  }
}

function taskQuestion(goal: string): McqQuestion {
  const tasks = GOAL_TASKS[goal] ?? GOAL_TASKS.reading_info
  return {
    id: 'task',
    title: 'Which specific task would you like to focus on first?',
    instruction: 'Your answer helps us tailor the skills questions and recommendations.',
    options: tasks.map((option) => ({ ...option })),
  }
}

function toolsQuestion(task: string): McqQuestion {
  const taskLabel = Object.values(GOAL_TASKS).flat().find((option) => option.id === task)?.label ?? 'this task'
  return {
    id: 'current_tools',
    title: `What tools or strategies do you currently use for ${taskLabel.toLowerCase()}?`,
    instruction: 'Choose the closest match. You can select a tool even if you are still learning it.',
    options: [
      { id: 'magnification', label: 'Larger text, screen magnification, or a handheld magnifier' },
      { id: 'speech', label: 'Text-to-speech, a screen reader, or audio labels' },
      { id: 'ocr', label: 'A phone camera or OCR app that reads text aloud' },
      { id: 'contrast', label: 'High contrast, improved lighting, or tactile markers' },
      { id: 'none_yet', label: 'I have not found a tool or strategy that works yet' },
    ],
  }
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
  const focus = answers.primary_focus ?? 'personal'
  const limitation = answers.limitation ?? 'not_sure'
  const goal = answers.goal ?? (focus === 'career' ? 'current_job' : 'reading_info')
  const task = answers.task ?? GOAL_TASKS[goal]?.[0]?.id ?? 'documents'
  const tool = answers.current_tools ?? 'none_yet'
  return [
    PRIMARY_FORK_QUESTION,
    getVisionImpactQuestion(limitation),
    goalQuestion(focus),
    taskQuestion(goal),
    toolsQuestion(task),
    ...getSkillQuestions(focus, task, tool),
    getSkillRecoveryQuestion(task, tool),
    getSupportQuestion(focus, tool),
    getNextStepQuestion(focus, task),
  ]
}

// ---------------------------------------------------------------------------
// 5. Tailored Recommendations Engine
// ---------------------------------------------------------------------------
export function getAdaptiveRecommendations(answers: Record<string, string>): RecommendationItem[] {
  const focus = answers.primary_focus === 'career' ? 'Career & Employment' : 'Personal Independence'
  const task = taskLabel(answers.task ?? '')
  const tool = answers.current_tools ?? 'none_yet'
  const list: RecommendationItem[] = []

  if (tool === 'none_yet' || tool === 'ocr') {
    list.push({
      id: 'rec_phone_accessibility_setup',
      title: 'Guided phone accessibility setup',
      category: focus,
      badge: 'Try with staff',
      description: `Explore built-in magnification, text-to-speech, or camera reading features for ${task}.`,
      keyBenefits: ['Starts with a device you may already use', 'Lets you compare visual and audio approaches', 'Can be practiced with an assessor'],
      accessTip: 'Try one feature at a time and keep the settings that feel comfortable.',
      suggestedAction: 'Ask staff to help you try an accessibility feature on your device.',
    })
  } else if (tool === 'magnification') {
    list.push({
      id: 'rec_magnification_trial',
      title: 'Magnification tool trial',
      category: focus,
      badge: 'Equipment trial',
      description: `Compare screen magnification and electronic video magnifiers while working on ${task}.`,
      keyBenefits: ['Compare handheld and screen-based magnification', 'Adjust size and contrast during a real task', 'Identify a comfortable viewing setup'],
      accessTip: 'Check that magnification keeps the information you need easy to locate.',
      suggestedAction: 'Schedule an assistive technology equipment trial.',
    })
  } else {
    list.push({
      id: 'rec_accessible_workflow',
      title: 'Accessible task workflow coaching',
      category: focus,
      badge: 'Personalized practice',
      description: `Practice combining ${tool === 'speech' ? 'speech' : 'contrast and lighting'} settings with a repeatable approach to ${task}.`,
      keyBenefits: ['Builds on tools you already use', 'Focuses on the task you selected', 'Can include practice switching methods'],
      accessTip: 'A comfortable workflow can combine visual settings, audio, and physical organization.',
      suggestedAction: 'Request a coached practice session with an assistive technology specialist.',
    })
  }

  list.push({
    id: 'rec_individual_assessment',
    title: answers.primary_focus === 'career' ? 'Workplace technology and accommodation review' : 'Individual assistive technology review',
    category: focus,
    badge: 'Staff supported',
    description: `Review your vision context, selected goal, task, tools, and skill answers with Lions Services staff to plan useful next steps.`,
    keyBenefits: ['Uses your answers to guide the conversation', 'Allows staff to explore needs in more detail', 'Supports an individualized recommendation'],
    accessTip: 'Your goal and preferred next step can help staff focus the review.',
    suggestedAction: answers.next_step === 'explore_options' ? 'Ask staff to compare options with you.' : 'Request an assessment review with Lions Services staff.',
  })
  return list
}

export function calculateAssessmentScore(answers: Record<string, string>): number {
  const scored = getAdaptiveQuestionPath(answers).flatMap((question) => {
    const option = question.options.find((item) => item.id === answers[question.id])
    return typeof option?.score === 'number' ? [{ score: option.score, weight: question.weight ?? 1 }] : []
  })
  if (!scored.length) return 0
  const totalWeight = scored.reduce((sum, response) => sum + response.weight, 0)
  return Math.round(scored.reduce((sum, response) => sum + response.score * response.weight, 0) / totalWeight)
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
  const followUps: Record<string, { title: string; options: McqQuestion['options'] }> = {
    glaucoma: { title: 'With glaucoma, which visual task is most difficult for you?', options: [
      { id: 'peripheral', label: 'Noticing items or movement to the side' },
      { id: 'scan_layout', label: 'Scanning a busy screen or finding controls' },
      { id: 'contrast_glare', label: 'Distinguishing content or managing glare' },
      { id: 'none_other', label: 'Something else, or none of these' },
    ] },
    macular_degeneration: { title: 'With macular degeneration, which visual task is most difficult for you?', options: [
      { id: 'small_detail', label: 'Reading small text or seeing fine detail' },
      { id: 'faces', label: 'Recognizing faces or details straight ahead' },
      { id: 'scan_layout', label: 'Finding an item on a crowded page' },
      { id: 'none_other', label: 'Something else, or none of these' },
    ] },
    diabetic_retinopathy: { title: 'With diabetic retinopathy, which visual task is most difficult for you?', options: [
      { id: 'small_detail', label: 'Reading text or seeing fine detail clearly' },
      { id: 'contrast_glare', label: 'Handling glare or changes in lighting' },
      { id: 'scan_layout', label: 'Finding information across a screen or page' },
      { id: 'none_other', label: 'Something else, or none of these' },
    ] },
    cataracts: { title: 'With cataracts, which visual task is most difficult for you?', options: [
      { id: 'glare', label: 'Seeing comfortably in bright light or glare' },
      { id: 'contrast_glare', label: 'Distinguishing text from its background' },
      { id: 'low_light', label: 'Seeing in dim light or at night' },
      { id: 'none_other', label: 'Something else, or none of these' },
    ] },
    retinitis_pigmentosa: { title: 'With retinitis pigmentosa, which visual task is most difficult for you?', options: [
      { id: 'peripheral', label: 'Noticing items or movement to the side' },
      { id: 'low_light', label: 'Seeing in dim light or adjusting to darkness' },
      { id: 'scan_layout', label: 'Scanning a page or screen to locate information' },
      { id: 'none_other', label: 'Something else, or none of these' },
    ] },
  }
  const tailored = followUps[limitation]
  return {
    id: `impact_${limitation}`,
    title: tailored?.title ?? 'Which visual task is most affected by your vision?',
    instruction: 'Choose the closest match. This helps us understand what support may fit your experience.',
    options: tailored?.options ?? [
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

function taskLabel(task: string): string {
  return Object.values(GOAL_TASKS).flat().find((option) => option.id === task)?.label.toLowerCase() ?? 'this task'
}

function getSupportQuestion(focus: string, tool: string): McqQuestion {
  const toolLabel: Record<string, string> = { magnification: 'magnification', speech: 'speech or audio', ocr: 'a phone reading app', contrast: 'contrast or lighting changes', none_yet: 'accessibility tools' }
  return {
    ...SUPPORT_QUESTION,
    title: focus === 'career' ? `What would help you build confidence using ${toolLabel[tool] ?? 'accessibility tools'} for work?` : `What would help you feel more confident using ${toolLabel[tool] ?? 'accessibility tools'} for this task?`,
    options: [
      { id: 'self_paced', label: 'A self-paced guide I can revisit' },
      { id: 'coached_practice', label: 'Practice with a staff member' },
      { id: 'equipment_trial', label: 'Try equipment or an app before deciding' },
      { id: 'staff_assessment', label: 'Talk through options with an assessor' },
    ],
  }
}

function getNextStepQuestion(focus: string, task: string): McqQuestion {
  return {
    id: 'next_step',
    title: `What would be the most useful next step for ${taskLabel(task)}?`,
    instruction: 'Your answer records what you would like to explore next.',
    options: focus === 'career'
      ? [
          { id: 'workplace_trial', label: 'Try an accessible tool in a work-like task' },
          { id: 'software_training', label: 'Get one-on-one assistive technology training' },
          { id: 'workplace_accommodation', label: 'Discuss workplace accommodations with staff' },
          { id: 'explore_options', label: 'Explore career or training options first' },
        ]
      : [
          { id: 'device_setup', label: 'Set up an accessibility feature on my device' },
          { id: 'guided_practice', label: 'Practice the task with a staff member' },
          { id: 'equipment_trial', label: 'Try an assistive device or app' },
          { id: 'explore_options', label: 'Learn about options before choosing' },
        ],
  }
}

export function getSkillQuestions(goal: string, detail: string, tool = 'none_yet'): McqQuestion[] {
  const toolLabel: Record<string, string> = { magnification: 'magnification', speech: 'speech or audio', ocr: 'a phone reading app', contrast: 'contrast or lighting changes', none_yet: 'an accessibility tool or strategy' }
  const toolText = toolLabel[tool] ?? 'your current strategy'
  return [
    {
      id: 'skill_use_tool',
      title: `How independently can you use ${toolText} for ${taskLabel(detail)}?`,
      instruction: 'Think about what you can do today, with the tools you currently have.',
      weight: 1,
      options: [
        { id: 'independent', label: 'I can do it independently', score: 100 },
        { id: 'some_help', label: 'I can do it with some help or reminders', score: 60 },
        { id: 'guided', label: 'I need step-by-step help right now', score: 20 },
      ],
    },
    {
      id: 'skill_adapt',
      title: goal === 'career' ? 'If a work task is hard to see or use, how do you usually keep going?' : `If ${taskLabel(detail)} is hard to see or use, how do you usually keep going?`,
      instruction: 'This checks your current problem-solving ability, not whether you own a particular device.',
      weight: 1,
      options: [
        { id: 'adjust_independently', label: 'I can choose another method or adjust settings myself', score: 100 },
        { id: 'adjust_with_help', label: 'I can do that with a suggestion or some help', score: 60 },
        { id: 'not_yet', label: 'I am not sure what to try yet', score: 20 },
      ],
    },
  ]
}

function getSkillRecoveryQuestion(task: string, tool: string): McqQuestion {
  const toolNames: Record<string, string> = { magnification: 'magnification', speech: 'speech or audio', ocr: 'a phone reading app', contrast: 'contrast or lighting changes', none_yet: 'a different approach' }
  return {
    id: 'skill_recover',
    title: `If ${toolNames[tool] ?? 'your current approach'} does not work for ${taskLabel(task)}, what can you do?`,
    instruction: 'Choose what best describes your current ability.',
    weight: 1,
    options: [
      { id: 'switch_independently', label: 'I can switch to another method on my own', score: 100 },
      { id: 'switch_with_prompt', label: 'I can switch methods with a suggestion', score: 60 },
      { id: 'need_guidance', label: 'I would need help deciding what to try', score: 20 },
    ],
  }
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

