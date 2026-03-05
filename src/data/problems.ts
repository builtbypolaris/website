import { ProblemIcon1, ProblemIcon2, ProblemIcon3 } from '../assets/icons'
import type { Problem } from '../types'

export const problems: Problem[] = [
  {
    icon: ProblemIcon1,
    title: '\u201CWe hired a developer but nothing changed\u201D',
    description: 'Built something, but it didn\u2019t solve the actual problem. The technology worked \u2014 it just wasn\u2019t the right technology for the real issue.',
  },
  {
    icon: ProblemIcon2,
    title: '\u201CWe have too many tools and none of them work together\u201D',
    description: 'Fragmented systems creating more work, not less. Every new tool adds complexity instead of removing it.',
  },
  {
    icon: ProblemIcon3,
    title: '\u201CWe don\u2019t know what we actually need\u201D',
    description: 'So many options, no clear direction. Everyone has a different opinion and nobody can agree on the right move.',
  },
]
