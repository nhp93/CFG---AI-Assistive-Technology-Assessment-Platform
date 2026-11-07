import type { McqQuestion } from './types'

// The condition and access-impact questions identify a useful path. They do not contribute to the skill score.
export const LIMITATIONS: McqQuestion = {
  id: 'limitation',
  title: 'Which vision condition or limitation best describes your experience?',
  instruction: 'This is self-reported information to tailor the questions, not a medical test. Choose “not sure” if you do not know.',
  options: [
    { id: 'glaucoma', label: 'Glaucoma' },
    { id: 'macular_degeneration', label: 'Macular degeneration' },
    { id: 'diabetic_retinopathy', label: 'Diabetic retinopathy' },
    { id: 'cataracts', label: 'Cataracts' },
    { id: 'retinitis_pigmentosa', label: 'Retinitis pigmentosa' },
    { id: 'other', label: 'Another condition or vision limitation' },
    { id: 'not_sure', label: 'I’m not sure / prefer not to say' },
  ],
}

const impactOptions = (options: [string, string][]): McqQuestion['options'] => [
  ...options.map(([id, label]) => ({ id, label })),
  { id: 'none_other', label: 'None of these / something else' },
]

const VISION_IMPACTS: Record<string, McqQuestion> = {
  glaucoma: {
    id: 'impact_glaucoma', title: 'With glaucoma, which screen task, if any, is most difficult for you?',
    options: impactOptions([
      ['peripheral_items', 'Noticing items near the edge of the screen'],
      ['scan_layout', 'Scanning a busy page to find a control'],
      ['small_detail', 'Reading small text or fine detail'],
      ['contrast_glare', 'Distinguishing content when contrast or glare is difficult'],
    ]),
  },
  macular_degeneration: {
    id: 'impact_macular_degeneration', title: 'With macular degeneration, which screen task, if any, is most difficult for you?',
    options: impactOptions([
      ['central_detail', 'Reading text or detail in the center of the page'],
      ['magnification_navigation', 'Keeping my place while magnifying content'],
      ['recognize_items', 'Recognizing icons, images, or short labels'],
      ['contrast_glare', 'Distinguishing content when contrast or glare is difficult'],
    ]),
  },
  diabetic_retinopathy: {
    id: 'impact_diabetic_retinopathy', title: 'With diabetic retinopathy, which screen task, if any, is most difficult for you?',
    options: impactOptions([
      ['variable_detail', 'Reading when clarity or detail varies'],
      ['scan_layout', 'Scanning a page to find the information I need'],
      ['contrast_glare', 'Distinguishing text from its background'],
      ['small_detail', 'Reading small text or fine detail'],
    ]),
  },
  cataracts: {
    id: 'impact_cataracts', title: 'With cataracts, which screen task, if any, is most difficult for you?',
    options: impactOptions([
      ['glare', 'Reading when the screen or lighting causes glare'],
      ['contrast', 'Distinguishing text and controls from the background'],
      ['small_detail', 'Reading small text or fine detail'],
      ['bright_screen', 'Using a bright screen for more than a short time'],
    ]),
  },
  retinitis_pigmentosa: {
    id: 'impact_retinitis_pigmentosa', title: 'With retinitis pigmentosa, which screen task, if any, is most difficult for you?',
    options: impactOptions([
      ['peripheral_items', 'Noticing items near the edge of the screen'],
      ['scan_layout', 'Scanning across a wide or busy page'],
      ['low_light', 'Using a screen when the surrounding area is dim'],
      ['contrast', 'Distinguishing text and controls from the background'],
    ]),
  },
  other: {
    id: 'impact_other', title: 'Which screen task, if any, is most affected by your vision?',
    options: impactOptions([
      ['small_detail', 'Reading small text or fine detail'],
      ['scan_layout', 'Scanning a page to find a control or information'],
      ['contrast_glare', 'Distinguishing content or managing glare'],
      ['variable_detail', 'Reading when my vision or clarity varies'],
    ]),
  },
  not_sure: {
    id: 'impact_not_sure', title: 'Which screen task, if any, is most difficult for you?',
    options: impactOptions([
      ['small_detail', 'Reading small text or fine detail'],
      ['scan_layout', 'Finding things on a busy page'],
      ['contrast_glare', 'Distinguishing content or managing glare'],
      ['variable_detail', 'Reading when clarity varies'],
    ]),
  },
}

export function getVisionImpactQuestion(limitation: string) {
  return VISION_IMPACTS[limitation] ?? VISION_IMPACTS.not_sure
}

export const GOALS: McqQuestion = {
  id: 'goal',
  title: 'What would you most like to do more independently?',
  instruction: 'Choose a task that matters to you. Your answers will guide the next questions and recommendations.',
  options: [
    { id: 'documents', label: 'Read a document or find information' },
    { id: 'communication', label: 'Use email, calendar, or video calls' },
    { id: 'work_tasks', label: 'Complete a work task or online form' },
    { id: 'files', label: 'Find, save, and organize files' },
    { id: 'explore', label: 'I’m not sure yet; help me explore' },
  ],
}

export const FOLLOW_UPS: Record<string, McqQuestion> = {
  documents: {
    id: 'documents', title: 'What kind of material do you most want to work with?',
    instruction: 'This helps us choose useful reading and document-access practice.',
    options: [
      { id: 'digital', label: 'A document already on the computer' },
      { id: 'scanned', label: 'A printed page or scanned document' },
      { id: 'web', label: 'Articles and information on websites' },
      { id: 'mixed', label: 'A mix of these' },
    ],
  },
  communication: {
    id: 'communication', title: 'Which communication task would you like to practice first?',
    options: [
      { id: 'email_read', label: 'Find and read an email' },
      { id: 'email_write', label: 'Write and send a reply' },
      { id: 'calendar', label: 'Create or check an appointment' },
      { id: 'video_call', label: 'Join and participate in a video call' },
    ],
  },
  work_tasks: {
    id: 'work_tasks', title: 'Which work task should we focus on?',
    options: [
      { id: 'online_form', label: 'Complete an online form' },
      { id: 'spreadsheet', label: 'Read or update a spreadsheet' },
      { id: 'upload', label: 'Upload or share a work document' },
      { id: 'work_document', label: 'Create or edit a work document' },
    ],
  },
  files: {
    id: 'files', title: 'What is the hardest part of managing files?',
    options: [
      { id: 'locate', label: 'Find a file I have already saved' },
      { id: 'save', label: 'Save a download to the right place' },
      { id: 'organize', label: 'Name and organize files so I can find them later' },
      { id: 'share', label: 'Attach or share a file with someone' },
    ],
  },
  explore: {
    id: 'explore', title: 'Which area sounds like a useful place to start?',
    options: [
      { id: 'device_basics', label: 'Learn the accessibility features on my device' },
      { id: 'documents', label: 'Practice reading documents' },
      { id: 'communication', label: 'Practice email or communication' },
      { id: 'work_tasks', label: 'Try a common workplace task' },
    ],
  },
}

export const TOOL_QUESTION: McqQuestion = {
  id: 'tool_familiarity',
  title: 'Which tools have you used for this kind of task?',
  instruction: 'Select the closest match. This helps us tailor practice and recommendations; it does not affect your skill score.',
  options: [
    { id: 'magnification', label: 'Screen magnification or zoom' },
    { id: 'speech', label: 'Read-aloud, text-to-speech, or a screen reader' },
    { id: 'ocr', label: 'Optical character recognition (OCR) for printed pages' },
    { id: 'keyboard_braille', label: 'Keyboard access or a refreshable braille display' },
    { id: 'voice', label: 'Voice control or dictation' },
    { id: 'staff_help', label: 'I usually ask someone for help' },
    { id: 'none_yet', label: 'I have not tried these tools yet' },
  ],
}

const TASK_LANGUAGE: Record<string, { object: string; setup: string; navigate: string; complete: string; verify: string }> = {
  documents: { object: 'a document', setup: 'open and prepare', navigate: 'move through it to find a specific detail', complete: 'read the information you need', verify: 'confirm you found the right information' },
  communication: { object: 'a message or event', setup: 'locate and open', navigate: 'move to the message or event you need', complete: 'finish the communication task', verify: 'confirm the message or event was handled as intended' },
  work_tasks: { object: 'a workplace task', setup: 'open and start', navigate: 'move through its controls or information', complete: 'complete the task', verify: 'check that the task was completed correctly' },
  digital: { object: 'a digital document', setup: 'open and prepare', navigate: 'move through it to find a specific detail', complete: 'read the information you need', verify: 'confirm you found the right information' },
  scanned: { object: 'a printed or scanned page', setup: 'capture and prepare', navigate: 'move through the recognized text to find a specific detail', complete: 'read the information you need', verify: 'check the recognized text against the page' },
  web: { object: 'a web article', setup: 'open and prepare', navigate: 'move through headings to find information', complete: 'read the information you need', verify: 'confirm you found the right section' },
  mixed: { object: 'a document', setup: 'open and prepare', navigate: 'move through it to find a specific detail', complete: 'read the information you need', verify: 'confirm you found the right information' },
  email_read: { object: 'an email', setup: 'locate and open', navigate: 'find and understand the message you need', complete: 'read the message and any attachment', verify: 'confirm you have the correct message' },
  email_write: { object: 'an email reply', setup: 'open and prepare', navigate: 'move between the message and reply controls', complete: 'write, review, and send the reply', verify: 'confirm the reply was sent to the right person' },
  calendar: { object: 'a calendar event', setup: 'open and prepare', navigate: 'move between date, time, and event details', complete: 'create or update the event', verify: 'confirm the event details are correct' },
  video_call: { object: 'a video meeting', setup: 'locate and join', navigate: 'find and use the meeting controls', complete: 'participate in the meeting', verify: 'confirm your audio and meeting status' },
  online_form: { object: 'an online form', setup: 'open and prepare', navigate: 'move through fields and labels', complete: 'enter information and submit the form', verify: 'confirm the submission or resolve an error' },
  spreadsheet: { object: 'a spreadsheet', setup: 'open and prepare', navigate: 'find the correct row, column, or cell', complete: 'read or update the cell you need', verify: 'confirm the value in the right location' },
  upload: { object: 'a work document', setup: 'locate and open', navigate: 'find the file and upload controls', complete: 'attach or share the document', verify: 'confirm the correct file is attached' },
  work_document: { object: 'a work document', setup: 'open and prepare', navigate: 'move through headings and editing controls', complete: 'make a change and save the document', verify: 'confirm the changes were saved' },
  locate: { object: 'a saved file', setup: 'open the file browser', navigate: 'find the file you need', complete: 'open the correct file', verify: 'confirm it is the right version' },
  save: { object: 'a downloaded file', setup: 'open the download and save controls', navigate: 'choose a known folder and descriptive name', complete: 'save the file', verify: 'find it again in the chosen folder' },
  organize: { object: 'your work files', setup: 'open the folder you use', navigate: 'choose a useful name and location', complete: 'organize the file', verify: 'find it later using its name or location' },
  share: { object: 'a file attachment', setup: 'locate the file and sharing controls', navigate: 'choose the intended file and recipient', complete: 'attach or share the file', verify: 'confirm the correct file is ready to share' },
  device_basics: { object: 'an accessibility feature', setup: 'turn on and prepare', navigate: 'find its controls while doing a simple task', complete: 'use it to complete the task', verify: 'confirm it is working as expected' },
}

const toolLabels: Record<string, string> = {
  magnification: 'screen magnification', speech: 'speech or screen-reader tools', ocr: 'OCR',
  keyboard_braille: 'keyboard or braille access', voice: 'voice control or dictation',
  staff_help: 'staff-supported access tools', none_yet: 'an assistive technology tool',
}

const scoreOptions = [
  { id: 'independent', label: 'I can do this independently', description: 'I can complete this step on my own.', score: 100 },
  { id: 'tools', label: 'I can do this with my tools or occasional help', description: 'I usually succeed with an assistive tool or a little support.', score: 75 },
  { id: 'guided', label: 'I need step-by-step guidance', description: 'I can take part, but need someone to guide me through it.', score: 45 },
  { id: 'new', label: 'I have not tried this yet', description: 'I would benefit from an introduction and supported practice.', score: 20 },
]

export function getSkillQuestions(goal: string, detail: string, tool = 'none_yet'): McqQuestion[] {
  const task = TASK_LANGUAGE[detail] ?? TASK_LANGUAGE.device_basics
  const usingTool = toolLabels[tool] ?? 'an assistive technology tool'
  const prompts = [
    { id: 'skill_setup', title: `Can you ${task.setup} ${task.object} using ${usingTool}?`, weight: 1 },
    { id: 'skill_navigate', title: `Can you ${task.navigate}?`, weight: 1.25 },
    { id: 'skill_complete', title: `Can you ${task.complete}?`, weight: 1.5 },
    { id: 'skill_verify', title: `Can you ${task.verify}?`, weight: 1.25 },
  ]
  return prompts.map(({ id, title, weight }, index) => ({
    id,
    title,
    instruction: index === 0
      ? 'Choose the answer that best describes what you can do today.'
      : 'Think about completing this step using the access method that works for you.',
    weight,
    options: scoreOptions,
  }))
}

export const SUPPORT_QUESTION: McqQuestion = {
  id: 'support_preference',
  title: 'What kind of next step would be most useful to you?',
  instruction: 'This guides the recommendation but does not affect your skill score.',
  options: [
    { id: 'self_paced', label: 'A self-paced guide I can try on my own' },
    { id: 'coached_practice', label: 'Practice with a staff member nearby' },
    { id: 'step_by_step', label: 'A step-by-step lesson with time to repeat it' },
    { id: 'explore_tools', label: 'Help comparing tools before I choose' },
  ],
}

export function getQuestionPath(flow: { limitation?: string | null; goal?: string | null; detail?: string | null; tool?: string | null }) {
  const limitation = flow.limitation ?? 'not_sure'
  const goal = flow.goal ?? 'documents'
  const detail = flow.detail ?? 'digital'
  return [
    LIMITATIONS,
    getVisionImpactQuestion(limitation),
    GOALS,
    FOLLOW_UPS[goal] ?? FOLLOW_UPS.explore,
    TOOL_QUESTION,
    ...getSkillQuestions(goal, detail, flow.tool ?? 'none_yet'),
    SUPPORT_QUESTION,
  ]
}

export interface ScoredSkillResponse {
  questionId: string
  prompt: string
  answerId: string
  answerLabel: string
  score: number
  weight: number
}

export function calculateAbilityScore(responses: ScoredSkillResponse[]) {
  const scored = responses.filter((response) => Number.isFinite(response.score) && response.weight > 0)
  const totalWeight = scored.reduce((sum, response) => sum + response.weight, 0)
  if (!totalWeight) return 0
  const weightedPoints = scored.reduce((sum, response) => sum + response.score * response.weight, 0)
  return Math.round(weightedPoints / totalWeight)
}

const DETAIL_LABELS: Record<string, string> = {
  digital: 'digital documents', scanned: 'printed and scanned pages', web: 'web content', mixed: 'different document types',
  email_read: 'finding and reading email', email_write: 'writing and sending email', calendar: 'calendar tasks', video_call: 'video calls',
  online_form: 'online forms', spreadsheet: 'spreadsheets', upload: 'sharing work files', work_document: 'work documents',
  locate: 'finding saved files', save: 'saving downloads', organize: 'organizing files', share: 'sharing attachments',
  device_basics: 'device accessibility basics', documents: 'document access', communication: 'email and communication', work_tasks: 'workplace digital tasks',
}

export function getFocusLabel(goal: string, detail: string) {
  return DETAIL_LABELS[detail] ?? (goal === 'documents' ? 'document access' : 'everyday digital tasks')
}

export function getRecommendation(goal: string, detail: string, score: number, prefs: { fontScale: number; theme: string }, tool = 'none_yet', support = 'coached_practice', impact = 'none_other') {
  const chosenGoal = goal === 'explore' && ['documents', 'communication', 'work_tasks'].includes(detail) ? detail : goal
  const accessTip = prefs.fontScale >= 26
    ? 'Keep the larger text setting from the vision check while practicing.'
    : prefs.theme !== 'standard'
      ? 'Keep the contrast and color settings from the vision check while practicing.'
      : 'Use the display settings that felt most comfortable in the vision check.'
  const taskPractice: Record<string, string> = {
    documents: detail === 'scanned'
      ? 'Practice an OCR and read-aloud workflow: capture a page, check the recognized text, then listen or navigate by headings.'
      : 'Practice opening a document, using headings to move through it, and choosing magnification or read-aloud for longer passages.',
    communication: detail === 'video_call'
      ? 'Practice joining a meeting, locating mute and participant controls, and leaving the meeting safely.'
      : 'Practice a short communication workflow: locate the message or event, review it, and complete the next action.',
    work_tasks: detail === 'online_form'
      ? 'Practice a sample form by moving through labels, required fields, error messages, and the final submit confirmation.'
      : detail === 'spreadsheet'
        ? 'Practice moving through a small spreadsheet by row and column, identifying headers, and editing one cell.'
        : 'Practice a short work task: make one change, save or submit it, and confirm the result.',
    files: 'Practice a repeatable file routine: download, choose a known folder, use a descriptive name, then locate and attach the file.',
    explore: 'Start with a guided device-accessibility tour, then choose one everyday task to practice with the settings from the vision check.',
  }
  const toolAdvice: Record<string, string> = {
    magnification: 'Build the practice around screen magnification, then practice moving the magnified view without losing your place.',
    speech: 'Build the practice around read-aloud or screen-reader navigation, including headings, labels, and reading position.',
    ocr: 'Include OCR practice and a step for checking that the recognized text matches the original page.',
    keyboard_braille: 'Include keyboard navigation or braille-display practice so the task can be completed without relying on pointer targeting.',
    voice: 'Include voice-control or dictation practice, with time to review and correct the recognized input.',
    staff_help: 'Begin with a staff-supported session and let the participant choose which access tools to try.',
    none_yet: 'Offer a supported comparison of magnification, read-aloud, screen-reader, and OCR tools for this task.',
  }
  const impactAdvice: Record<string, string> = {
    peripheral_items: 'Use a predictable focus order and landmarks, and practice locating controls without depending on peripheral scanning.',
    central_detail: 'Keep the chosen text size available and compare magnification with speech for dense detail.',
    small_detail: 'Keep the chosen text size and zoom settings available during practice.',
    contrast_glare: 'Use the contrast and color settings selected in the vision check during practice.',
    contrast: 'Use the contrast and color settings selected in the vision check during practice.',
    glare: 'Keep screen contrast comfortable and offer a lower-glare display position during practice.',
    bright_screen: 'Keep the display comfortable and offer breaks or a lower-glare position during practice.',
    scan_layout: 'Practice with a simple layout and predictable navigation before trying a busier page.',
    low_light: 'Use the display settings selected in the vision check and avoid relying on low-contrast controls.',
    variable_detail: 'Practice switching between visual access and speech tools while keeping the task position clear.',
    magnification_navigation: 'Practice panning and returning to a known point in the document.',
    recognize_items: 'Practice combining clear labels with magnification or speech for icons and short controls.',
    none_other: 'Start with the access method the participant already prefers and adjust based on their feedback.',
  }
  const nextStep = support === 'self_paced'
    ? 'Provide an accessible self-paced guide and a sample task the participant can repeat independently.'
    : support === 'step_by_step'
      ? 'Offer a step-by-step lesson with time to repeat each part and a short take-home practice plan.'
      : support === 'explore_tools'
        ? 'Set up a guided comparison of relevant tools, then let the participant choose what to practice next.'
        : score >= 80
          ? 'Offer an independent practice task and let the participant choose when to ask for help.'
          : score >= 50
            ? 'Offer a short coached practice, then let the participant repeat the task with less prompting.'
            : 'Begin with a supported introduction, demonstrate one step at a time, and build a simple take-home practice plan.'
  return {
    title: `Personalized practice: ${getFocusLabel(goal, detail)}`,
    tool: `${taskPractice[chosenGoal] ?? taskPractice.explore} ${toolAdvice[tool] ?? toolAdvice.none_yet}`,
    accessTip: `${accessTip} ${impactAdvice[impact] ?? impactAdvice.none_other}`,
    nextStep,
  }
}
