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
    <Card className="workspace-surface w-full max-w-sm gap-6 rounded-3xl py-7 ring-0 [--card-spacing:--spacing(6)]">
      <CardHeader className={enter}>
        {/* Not a link: home redirects guests straight back here. */}
        <Logo href={null} showLabel={false} size={40} eager className="mb-3" />
        <CardTitle className="text-2xl font-semibold tracking-tight">
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
            className="h-10 w-full rounded-full text-sm"
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
        className={`${enter} text-muted-foreground rounded-b-3xl bg-transparent text-xs delay-[110ms]`}
      >
        We only read your public profile and email address.
      </CardFooter>
    </Card>
  );
}
