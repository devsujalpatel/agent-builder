import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon } from '@hugeicons/core-free-icons';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Spinner } from '@/components/ui/spinner';
import { siteConfig } from '@/lib/site';
import { signIn } from '../actions';
import { AUTH_ROUTES } from '../lib/constants';
import { SubmitButton } from './submit-button';

// Entrance (Emil): first-visit surface, so it earns a short rise-and-fade.
// @starting-style runs it on mount with no JS; the parts stagger by ~60ms.
const enter =
  'transition-[opacity,translate,filter] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] starting:translate-y-2 starting:opacity-0 starting:blur-[2px] motion-reduce:starting:translate-y-0';

export function SignInForm({
  callbackURL = AUTH_ROUTES.afterSignIn,
}: {
  callbackURL?: string;
}) {
  return (
    <Card className="w-full max-w-sm gap-6 py-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] [--card-spacing:--spacing(6)] dark:shadow-none">
      <CardHeader className={enter}>
        {/* Not a link: home redirects guests straight back here. */}
        <Logo href={null} showLabel={false} size={40} eager className="mb-3" />
        <CardTitle className="text-lg font-semibold tracking-tight">
          Sign in to {siteConfig.name}
        </CardTitle>
        <CardDescription className="text-pretty">
          {siteConfig.description} Continue with your GitHub account to get
          started.
        </CardDescription>
      </CardHeader>

      <CardContent className={`${enter} delay-[60ms]`}>
        <form action={signIn.bind(null, 'github', callbackURL)}>
          <SubmitButton
            variant="neutral"
            size="lg"
            className="h-10 w-full text-sm"
            pending={
              <>
                <Spinner className="size-4" />
                Redirecting to GitHub
              </>
            }
          >
            <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
            Continue with GitHub
          </SubmitButton>
        </form>
      </CardContent>

      <CardFooter
        className={`${enter} text-muted-foreground text-xs delay-[110ms]`}
      >
        We only read your public profile and email address.
      </CardFooter>
    </Card>
  );
}
