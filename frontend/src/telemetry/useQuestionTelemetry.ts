import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent, SyntheticEvent } from 'react'
import type { QuestionTelemetry, StruggleReason } from './types'

type StruggleSignals = Pick<QuestionTelemetry, 'timeSpentMs' | 'hoverSwitches' | 'answerChanges' | 'misclicks' | 'uiTweaksMidQuestion'>

// Struggle rule for one question; also used by the staff dashboard's demo data.
export function getStruggleReason(m: StruggleSignals): StruggleReason {
  if (m.misclicks >= 2 || m.uiTweaksMidQuestion > 0) return 'visual_motor'
  if (m.hoverSwitches >= 5 || m.answerChanges >= 2) return 'cognitive_indecision'
  if (m.timeSpentMs > 60000) return 'slow_reading'
  return 'none'
}

export function useQuestionTelemetry(questionId: string) {
  const startTimeRef = useRef(Date.now())
  const lastHoveredRef = useRef<string | null>(null)
  const selectedOptionRef = useRef<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hoverSwitches, setHoverSwitches] = useState(0)
  const [answerChanges, setAnswerChanges] = useState(0)
  const [misclicks, setMisclicks] = useState(0)
  const [uiTweaksMidQuestion, setUiTweaksMidQuestion] = useState(0)

  useEffect(() => {
    const onTweak = () => setUiTweaksMidQuestion((n) => n + 1)
    window.addEventListener('lions:ui-tweak', onTweak)
    return () => window.removeEventListener('lions:ui-tweak', onTweak)
  }, [questionId])

  const handleOptionHover = useCallback((optionId: string) => {
    if (lastHoveredRef.current && lastHoveredRef.current !== optionId) setHoverSwitches((n) => n + 1)
    lastHoveredRef.current = optionId
  }, [])

  const handleOptionSelect = useCallback((optionId: string, e?: MouseEvent | SyntheticEvent) => {
    e?.stopPropagation()
    if (selectedOptionRef.current && selectedOptionRef.current !== optionId) setAnswerChanges((n) => n + 1)
    selectedOptionRef.current = optionId
    setSelectedOption(optionId)
  }, [])

  const handleContainerClick = useCallback((e?: MouseEvent) => {
    e?.stopPropagation()
    setMisclicks((n) => n + 1)
  }, [])

  const recordUiTweak = useCallback(() => setUiTweaksMidQuestion((n) => n + 1), [])

  const finalizeQuestion = useCallback((finalChoice: string | null = selectedOption): QuestionTelemetry => {
    const timeSpentMs = Date.now() - startTimeRef.current
    const struggleReason = getStruggleReason({ timeSpentMs, hoverSwitches, answerChanges, misclicks, uiTweaksMidQuestion })

    return {
      questionId,
      selectedOption: finalChoice,
      timeSpentMs,
      hoverSwitches,
      answerChanges,
      misclicks,
      uiTweaksMidQuestion,
      isStruggling: struggleReason !== 'none',
      struggleReason,
    }
  }, [answerChanges, hoverSwitches, misclicks, questionId, selectedOption, uiTweaksMidQuestion])

  const resetTelemetry = useCallback(() => {
    startTimeRef.current = Date.now()
    lastHoveredRef.current = null
    selectedOptionRef.current = null
    setSelectedOption(null)
    setHoverSwitches(0)
    setAnswerChanges(0)
    setMisclicks(0)
    setUiTweaksMidQuestion(0)
  }, [])

  return {
    selectedOption,
    hoverSwitches,
    answerChanges,
    misclicks,
    uiTweaksMidQuestion,
    handleOptionHover,
    handleOptionSelect,
    handleContainerClick,
    recordUiTweak,
    finalizeQuestion,
    resetTelemetry,
  }
}
