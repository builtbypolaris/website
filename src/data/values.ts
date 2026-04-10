import { useMemo } from 'react'
import type { Value } from '../types'
import { useT } from '../i18n'

/**
 * Numbers (`01`, `02`, ...) are visual constants — only the word and
 * description are translated. Use `useValues()` to get the merged array.
 */
export function useValues(): Value[] {
  const t = useT()
  return useMemo(() => {
    return t.valuesGrid.values.map((value, i) => ({
      number: String(i + 1).padStart(2, '0'),
      word: value.word,
      description: value.description,
    }))
  }, [t.valuesGrid.values])
}
