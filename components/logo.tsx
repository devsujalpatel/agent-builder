import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site';

type LogoProps = {
  className?: string;
  /** Show the app name beside the mark. */
  showLabel?: boolean;
  labelClassName?: string;
  /** Where the logo links to; `null` renders it without a link. */
  href?: string | null;
  /** Mark size in px. */
  size?: number;
  /** Load eagerly; set on the logo that's above the fold. */
  eager?: boolean;
};

export function Logo({
  className,
  showLabel = true,
  labelClassName,
  href = '/',
  size = 36,
  eager,
}: LogoProps) {
  const content = (
    <>
      <Image
        src={siteConfig.logo}
        // With the label beside it the mark is decorative; alone, it's the name.
        alt={showLabel ? '' : siteConfig.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-lg"
        loading={eager ? 'eager' : undefined}
      />
      {showLabel ? (
        <span
          className={cn(
            'font-heading text-lg font-medium tracking-tight',
            labelClassName,
          )}
        >
          {siteConfig.name}
        </span>
      ) : null}
    </>
  );

  const classes = cn('inline-flex items-center gap-2.5', className);

  if (href === null) return <span className={classes}>{content}</span>;

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
