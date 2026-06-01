import { cn } from '@/lib/cn'
import logoUrl from '@/assets/logo.webp'

interface LogoProps {
  className?: string
  /**
   * Tailwind size class — controls render dimensions. The logo is circular,
   * so width === height. Default h-11 w-11 (44px) gives the mark enough
   * room to read; pass a larger class (e.g. "h-14 w-14") on hero surfaces.
   */
  size?: string
  /**
   * Kept for back-compat with old call sites; ignored now that the logo is
   * a single circular image (wordmark is baked into the artwork, if any).
   */
  showWordmark?: boolean
  alt?: string
}

export function Logo({
  className,
  size = 'h-11 w-11',
  alt = 'Bowled',
}: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      // Circular asset — `rounded-full` masks any stray edge antialiasing
      // and keeps the silhouette crisp on busy backgrounds.
      className={cn(size, 'rounded-full object-contain select-none shrink-0', className)}
      draggable={false}
    />
  )
}
