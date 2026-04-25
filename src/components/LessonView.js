'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MiniQuiz({ quiz }) {
  const [selected, setSelected] = useState(null)

  if (!quiz) return null

  const isAnswered = selected !== null
  const isCorrect = selected === quiz.correct_answer

  return (
    <div>
      <p className="text-[15px] font-semibold text-[#1a1a1a] leading-snug mb-4">{quiz.question}</p>
      <div className="flex flex-col gap-2.5">
        {quiz.options?.map((option) => {
          const isSelected = selected === option
          const isRight = option === quiz.correct_answer

          let buttonStyle = 'bg-[#f5f5f7] text-[#1a1a1a] border-2 border-transparent'
          if (isAnswered) {
            if (isRight) {
              buttonStyle = 'bg-[#e8f8ef] text-[#1d7a40] border-2 border-[#34c759]'
            } else if (isSelected && !isRight) {
              buttonStyle = 'bg-[#fff0f0] text-[#c0392b] border-2 border-[#ff3b30]'
            } else {
              buttonStyle = 'bg-[#f5f5f7] text-[#aeaeb2] border-2 border-transparent'
            }
          }

          return (
            <motion.button
              key={option}
              disabled={isAnswered}
              onClick={() => setSelected(option)}
              whileHover={!isAnswered ? { scale: 1.01 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              className={`w-full px-4 py-3.5 rounded-2xl text-left text-[14px] font-medium transition-all duration-200 flex items-center justify-between gap-3 ${buttonStyle} ${
                !isAnswered ? 'hover:bg-[#ebebf0] cursor-pointer' : 'cursor-default'
              }`}
            >
              <span>{option}</span>
              {isAnswered && isRight && (
                <span className="text-[#34c759] flex-shrink-0">
                  <CheckIcon />
                </span>
              )}
              {isAnswered && isSelected && !isRight && (
                <span className="text-[#ff3b30] flex-shrink-0">
                  <CrossIcon />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-4 px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed ${
              isCorrect
                ? 'bg-[#e8f8ef] text-[#1d7a40]'
                : 'bg-[#fff0f0] text-[#c0392b]'
            }`}
          >
            {isCorrect ? '✓ Correct! ' : '✗ Not quite. '}
            {quiz.feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LessonView({ lesson, selectedClass, selectedSubject, selectedTopic, onBack }) {
  if (!lesson) return null

  const cardBase = 'bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'

  return (
    <motion.div
      key="lesson-view"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#f5f5f7] pb-20"
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 blur-3xl" />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed] px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-[#8e8e93] hover:text-[#1a1a1a] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <div className="flex-1 min-w-0 text-center">
            <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{selectedSubject} · {selectedClass}</p>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-6 space-y-4 relative">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-2"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#007AFF] mb-2">Your Lesson</p>
          <h1 className="text-[26px] font-bold tracking-tight text-[#1a1a1a] leading-tight">
            {lesson.title || selectedTopic}
          </h1>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-3xl p-5 text-white shadow-[0_8px_32px_rgba(0,122,255,0.2)]"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase opacity-70 mb-2">Introduction</p>
          <p className="text-[15px] leading-relaxed font-medium opacity-95">{lesson.intro}</p>
        </motion.div>

        {/* Explanation */}
        {lesson.explanation?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cardBase}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#8e8e93] mb-4">Key Points</p>
            <div className="space-y-3">
              {lesson.explanation.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#e8f4ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-[#007AFF]">{i + 1}</span>
                  </div>
                  <p className="text-[14px] text-[#1a1a1a] leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Example */}
        {lesson.example && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className={cardBase}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#8e8e93] mb-3">Example</p>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-[14px] text-[#1a1a1a] leading-relaxed">{lesson.example}</p>
            </div>
          </motion.div>
        )}

        {/* Mini quiz */}
        {lesson.mini_quiz?.[0] && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className={cardBase}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#8e8e93] mb-4">Quick Check</p>
            <MiniQuiz quiz={lesson.mini_quiz[0]} />
          </motion.div>
        )}

        {/* Study tip */}
        {lesson.study_tip && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="bg-gradient-to-br from-[#fff8e8] to-[#fff3d6] rounded-3xl p-5 border border-[#ffe0a0]/60"
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#b07d00] mb-2">Study Tip</p>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⭐</span>
              <p className="text-[14px] text-[#7a5500] leading-relaxed">{lesson.study_tip}</p>
            </div>
          </motion.div>
        )}

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          onClick={onBack}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl text-[15px] font-semibold text-[#1a1a1a] bg-white border border-[#e8e8ed] transition-all duration-200 hover:bg-[#f5f5f7] shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
        >
          ← Back to Dashboard
        </motion.button>
      </div>
    </motion.div>
  )
}
