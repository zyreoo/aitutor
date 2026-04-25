function detectKeywords(text, keywords) {
  const lower = String(text || '').toLowerCase()
  return keywords.some((kw) => lower.includes(kw))
}

function normalizeList(answer) {
  return String(answer || '')
    .split(/[,.]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5)
}

function inferEducationLevel(answer) {
  const text = String(answer || '').toLowerCase()
  if (detectKeywords(text, ['middle school', 'gimnaziu'])) return 'middle school'
  if (detectKeywords(text, ['high school', 'liceu'])) return 'high school'
  if (detectKeywords(text, ['university', 'college', 'facult'])) return 'university'
  if (detectKeywords(text, ['work', 'job', 'employee', 'business'])) return 'working'
  return text.trim() ? text.trim() : null
}

function inferLearningStyle(answer) {
  const text = String(answer || '').toLowerCase()
  if (detectKeywords(text, ['visual', 'video', 'diagram', 'images'])) return 'visual'
  if (detectKeywords(text, ['practice', 'hands-on', 'project', 'try'])) return 'practical'
  if (detectKeywords(text, ['theory', 'theoretical', 'concept', 'why'])) return 'theoretical'
  return text.trim() ? 'mixed' : null
}

function inferMotivationType(answer) {
  const text = String(answer || '').toLowerCase()
  if (detectKeywords(text, ['fun', 'enjoy', 'play'])) return 'fun'
  if (detectKeywords(text, ['career', 'job', 'money', 'work'])) return 'career'
  if (detectKeywords(text, ['school', 'grade', 'exam', 'bac'])) return 'school'
  if (detectKeywords(text, ['curious', 'curiosity', 'explore'])) return 'curiosity'
  return text.trim() ? 'mixed' : null
}

function inferDifficultyPreference(answer) {
  const text = String(answer || '').toLowerCase()
  if (detectKeywords(text, ['easy', 'basic', 'simple'])) return 'easy'
  if (detectKeywords(text, ['hard', 'advanced', 'challenging'])) return 'hard'
  if (detectKeywords(text, ['medium', 'balanced'])) return 'medium'
  return null
}

function inferCommunicationStyle(answer) {
  const text = String(answer || '').toLowerCase()
  if (detectKeywords(text, ['short', 'quick', 'brief'])) return 'short answers'
  if (detectKeywords(text, ['detailed', 'deep', 'full'])) return 'detailed'
  if (detectKeywords(text, ['interactive', 'questions', 'chat'])) return 'interactive'
  return null
}

const FIELD_WEIGHTS = {
  age: 0.07,
  educationLevel: 0.13,
  classLevel: 0.07,
  knowledgeLevel: 0.12,
  interests: 0.15,
  goals: 0.15,
  learningStyle: 0.11,
  motivationType: 0.08,
  difficultyPreference: 0.06,
  communicationStylePreference: 0.06,
}

function hasValue(profile, field) {
  const value = profile?.[field]
  if (Array.isArray(value)) return value.length > 0
  return Boolean(String(value || '').trim())
}

function shouldAskClassLevel(profile) {
  const level = String(profile?.educationLevel || '').toLowerCase()
  return ['middle school', 'high school', 'university'].includes(level)
}

function getMissingFields(profile) {
  const baseOrder = [
    'educationLevel',
    'age',
    'knowledgeLevel',
    'interests',
    'goals',
    'learningStyle',
    'motivationType',
    'difficultyPreference',
    'communicationStylePreference',
  ]

  if (shouldAskClassLevel(profile)) {
    baseOrder.splice(2, 0, 'classLevel')
  }

  return baseOrder.filter((field) => !hasValue(profile, field))
}

function getProfileCompleteness(profile) {
  let score = 0
  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    if (field === 'classLevel' && !shouldAskClassLevel(profile)) {
      score += weight
      continue
    }
    if (hasValue(profile, field)) score += weight
  }
  return Math.max(0, Math.min(1, score))
}

function getKnowledgePrompt(profile) {
  const interests = (profile?.interests || []).join(', ')
  if (interests) {
    return `How would you rate your current level in ${interests}: beginner, intermediate, or advanced?`
  }
  return 'How would you describe your current knowledge level overall: beginner, intermediate, or advanced?'
}

function getQuestionForField(field, profile) {
  const name = profile?.username ? `${profile.username}, ` : ''
  switch (field) {
    case 'educationLevel':
      return `${name}what stage are you in now: middle school, high school, university, or working?`
    case 'classLevel':
      return `What class/year are you in right now (${profile.educationLevel})?`
    case 'age':
      return `${name}how old are you?`
    case 'knowledgeLevel':
      return getKnowledgePrompt(profile)
    case 'interests':
      return 'What 2-4 interests define you best right now (e.g. gaming, math, coding, sports, design)?'
    case 'goals':
      return 'What outcomes do you want in the next 3 months? You can list more than one.'
    case 'learningStyle':
      return 'When learning, what works best for you: visual, practical, theoretical, or mixed?'
    case 'motivationType':
      return 'What motivates you most to learn: fun, career, school results, or curiosity?'
    case 'difficultyPreference':
      return 'What challenge level should we target first: easy, medium, or hard?'
    case 'communicationStylePreference':
      return 'How should I communicate: short answers, detailed explanations, or interactive coaching?'
    default:
      return 'Tell me more so I can personalize your learning experience.'
  }
}

function updateProfileField(profile, field, answer) {
  switch (field) {
    case 'age':
      return { ...profile, age: answer.trim() }
    case 'educationLevel':
      return { ...profile, educationLevel: inferEducationLevel(answer) }
    case 'classLevel':
      return { ...profile, classLevel: answer.trim() }
    case 'interests':
      return { ...profile, interests: normalizeList(answer) }
    case 'goals':
      return { ...profile, goals: normalizeList(answer) }
    case 'learningStyle':
      return { ...profile, learningStyle: inferLearningStyle(answer) }
    case 'motivationType':
      return { ...profile, motivationType: inferMotivationType(answer) }
    case 'difficultyPreference':
      return { ...profile, difficultyPreference: inferDifficultyPreference(answer) || answer.trim() }
    case 'communicationStylePreference':
      return { ...profile, communicationStylePreference: inferCommunicationStyle(answer) || answer.trim() }
    case 'knowledgeLevel':
      return { ...profile, knowledgeLevel: answer.trim().toLowerCase() }
    default:
      return profile
  }
}

export function createInitialProfilingState(username) {
  const profile = {
    username,
    age: '',
    educationLevel: '',
    classLevel: '',
    interests: [],
    goals: [],
    learningStyle: '',
    motivationType: '',
    difficultyPreference: '',
    communicationStylePreference: '',
    knowledgeLevel: '',
  }

  const missing = getMissingFields(profile)
  const targetField = missing[0]

  return {
    profile,
    responses: [],
    currentQuestion: {
      id: `q_${targetField}`,
      field: targetField,
      prompt: getQuestionForField(targetField, profile),
    },
    completeness: getProfileCompleteness(profile),
  }
}

export function submitProfilingAnswer(state, answer) {
  const field = state?.currentQuestion?.field
  const trimmed = String(answer || '').trim()
  const updatedProfile = updateProfileField(state.profile, field, trimmed)
  const updatedResponses = [
    ...(state.responses || []),
    {
      questionId: state?.currentQuestion?.id || '',
      field,
      question: state?.currentQuestion?.prompt || '',
      answer: trimmed,
    },
  ]

  const workingState = {
    ...state,
    profile: updatedProfile,
    responses: updatedResponses,
  }

  const completeness = getProfileCompleteness(updatedProfile)
  const missing = getMissingFields(updatedProfile)
  const nextField = missing[0] || null
  const shouldFinish = (completeness >= 0.85 && updatedResponses.length >= 6) || updatedResponses.length >= 10 || !nextField

  if (shouldFinish) {
    return {
      ...workingState,
      completeness,
      currentQuestion: null,
      done: true,
    }
  }

  return {
    ...workingState,
    completeness,
    done: false,
    currentQuestion: {
      id: `q_${nextField}_${updatedResponses.length + 1}`,
      field: nextField,
      prompt: getQuestionForField(nextField, updatedProfile),
    },
  }
}

export function getAdaptiveProgressLabel(completeness) {
  if (completeness >= 0.85) return 'Profile clarity: High'
  if (completeness >= 0.55) return 'Profile clarity: Medium'
  return 'Profile clarity: Building'
}
