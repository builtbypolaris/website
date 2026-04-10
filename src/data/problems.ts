import { useMemo } from 'react'
import { ProblemIcon1, ProblemIcon2, ProblemIcon3 } from '../assets/icons'
import type { Problem } from '../types'
import { useT } from '../i18n'

/**
 * Icons are static — text comes from the active locale's translation file.
 * Use `useProblems()` to get the merged array.
 */
const ICONS = [ProblemIcon1, ProblemIcon2, ProblemIcon3] as const

export function useProblems(): Problem[] {
  const t = useT()
  return useMemo(() => {
    return t.problemSection.problems.map((problem, i) => ({
      icon: ICONS[i],
      title: problem.title,
      description: problem.description,
    }))
  }, [t.problemSection.problems])
}
