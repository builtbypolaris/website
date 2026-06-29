interface Props {
  dark?: boolean
  height?: number
  className?: string
}

export default function PolarisLogo({ dark = false, height = 32, className = '' }: Props) {
  return (
    <img
      src={dark ? '/Logo on dark.png' : '/Logo on light.png'}
      alt="Polaris"
      style={{ height, width: 'auto' }}
      className={`object-contain ${className}`}
    />
  )
}
