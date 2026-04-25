import { NextResponse } from 'next/server'

const HACKCLUB_API = 'https://ai.hackclub.com/proxy/v1/chat/completions'
const MODEL = 'qwen/qwen3-32b'

function buildPrompt(profile, selectedClass, selectedSubject, selectedTopic) {
  return `Create a personalized lesson for this student.

Student profile:
${JSON.stringify(profile, null, 2)}

Class:
${selectedClass}

Subject:
${selectedSubject}

Topic:
${selectedTopic}

Return the lesson in this exact JSON format:
{
  "title": "string",
  "intro": "short friendly intro",
  "explanation": ["point 1", "point 2", "point 3"],
  "example": "simple example",
  "mini_quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C"],
      "correct_answer": "A",
      "feedback": "short explanation"
    }
  ],
  "study_tip": "personalized tip based on profile"
}

Rules:
- Match the student's learning_style.
- Match the student's pace.
- Match the student's support_style.
- If visual learner, mention diagrams/patterns.
- If practical learner, focus on exercises.
- If logical learner, explain step by step.
- If story-based learner, use real-life examples.
- Keep it short enough for a hackathon demo.
- Return only valid JSON. No markdown fences.`
}

function fallbackLesson(selectedTopic, selectedSubject) {
  return {
    title: selectedTopic,
    intro: `Let's explore ${selectedTopic} together. This is a foundational concept in ${selectedSubject} that will build your understanding step by step.`,
    explanation: [
      `${selectedTopic} is a key idea in ${selectedSubject}.`,
      'Understanding this concept helps you connect it to other topics you already know.',
      'Practice with small examples is the best way to make it stick.',
    ],
    example: `Think about a real-life situation where ${selectedTopic} comes into play — this makes it easier to remember.`,
    mini_quiz: [
      {
        question: `Which of the following best describes ${selectedTopic}?`,
        options: ['A foundational concept', 'An advanced theory', 'An unrelated topic'],
        correct_answer: 'A foundational concept',
        feedback: `Correct! ${selectedTopic} is indeed a foundational concept that supports further learning.`,
      },
    ],
    study_tip: 'Review this topic after a short break — spaced repetition helps long-term memory.',
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { profile, selectedClass, selectedSubject, selectedTopic } = body

    if (!selectedClass || !selectedSubject || !selectedTopic) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const apiKey = process.env.HACKCLUB_AI_API_KEY
    if (!apiKey) {
      console.warn('HACKCLUB_AI_API_KEY not set — returning fallback lesson.')
      return NextResponse.json({ lesson: fallbackLesson(selectedTopic, selectedSubject) })
    }

    const aiResponse = await fetch(HACKCLUB_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly AI tutor for students. Create short, clear, personalized lessons. Keep language simple, encouraging, and age-appropriate. Do not be verbose.',
          },
          {
            role: 'user',
            content: buildPrompt(profile, selectedClass, selectedSubject, selectedTopic),
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('Hack Club AI error:', errText)
      return NextResponse.json({ lesson: fallbackLesson(selectedTopic, selectedSubject) })
    }

    const aiData = await aiResponse.json()
    const rawContent = aiData?.choices?.[0]?.message?.content || ''

    // Strip markdown fences if the model wraps its output
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    let lesson
    try {
      lesson = JSON.parse(cleaned)
    } catch {
      console.warn('Could not parse AI JSON response — using fallback. Raw:', rawContent.slice(0, 200))
      lesson = fallbackLesson(selectedTopic, selectedSubject)
    }

    return NextResponse.json({ lesson })
  } catch (err) {
    console.error('generate-lesson route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
