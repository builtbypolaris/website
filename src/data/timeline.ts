import { useMemo } from 'react'
import type { TimelineStep } from '../types'
import { useT } from '../i18n'

/**
 * Timeline step numbers (`01`, `02`, ...) are visual — only title,
 * description, and the badge tag are translated. Use `useTimelineSteps()`
 * to get the merged array.
 */
export function useTimelineSteps(): TimelineStep[] {
  const t = useT()
  return useMemo(() => {
    return t.howItWorks.steps.map((step, i) => ({
      number: String(i + 1).padStart(2, '0'),
      title: step.title,
      description: step.description,
      tag: step.tag,
    }))
  }, [t.howItWorks.steps])
}
