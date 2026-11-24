import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight02Icon,
  MessageMultiple01Icon,
  PencilEdit01Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';
import { FeatureBento } from '@/modules/landing/components/feature-bento';
import { HeroDemo } from '@/modules/landing/components/hero-demo';
import { LandingNav } from '@/modules/landing/components/landing-nav';
import { Reveal } from '@/modules/landing/components/reveal';
import '@/modules/landing/components/landing.css';

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} · Build, test and ship AI agents` },
  description:
    'Lay out an AI agent on a canvas, switch on tools like web search and GitHub, and test every reply live.',
};

const STEPS = [
  {
    icon: PencilEdit01Icon,
    title: 'Describe it',
    text: 'Name the agent, write its instructions in plain language and pick a Mercury model.',
  },
  {
    icon: Wrench01Icon,
    title: 'Equip it',
    text: 'Switch on built-in tools, or turn any HTTP endpoint into a custom tool.',
  },
  {
    icon: MessageMultiple01Icon,
    title: 'Talk to it',
    text: 'Chat with it in the test panel and watch each tool call resolve as it runs.',
  },
];

export default function LandingPage() {
  return (
    <div className="lp-page flex flex-1 flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* ---- Hero ---- */}
        <section className="relative overflow-hidden">
          <div className="lp-hero-backdrop" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 pt-14 text-center sm:px-6 sm:pt-20">
            <div className="lp-enter flex flex-col items-center">
              <p className="lp-eyebrow" style={{ '--i': 0 } as CSSProperties}>
                <span className="lp-eyebrow__dot" aria-hidden />
                Runs on Inception&rsquo;s Mercury models
              </p>
              <h1
                className="mt-6 max-w-3xl text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl"
                style={{ '--i': 1 } as CSSProperties}
              >
                Draw an AI agent.{' '}
                <span className="text-muted-foreground">Then talk to it.</span>
              </h1>
              <p
                className="text-muted-foreground mt-6 max-w-xl text-base leading-7 text-pretty sm:text-lg sm:leading-8"
                style={{ '--i': 2 } as CSSProperties}
              >
                {siteConfig.name} is a visual builder for AI agents. Lay out the
                workflow on a canvas, switch on tools like web search and
                GitHub, and test every reply live, tool calls included.
              </p>
              <div
                className="mt-9 flex flex-wrap items-center justify-center gap-3"
                style={{ '--i': 3 } as CSSProperties}
              >
                <Button
                  render={<Link href="/agents/new" />}
                  nativeButton={false}
                  variant="primary"
                  size="lg"
                  className="h-10 rounded-full px-5 text-[15px]"
                >
                  Start building
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    data-icon="inline-end"
                    aria-hidden="true"
                    className="lp-arrow"
                  />
                </Button>
                <Button
                  render={<a href="#how" />}
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                  className="h-10 rounded-full px-5 text-[15px]"
                >
                  See how it works
                </Button>
              </div>
            </div>
          </div>

          <div className="lp-hero-figure relative mx-auto mt-12 max-w-[1128px] px-4 sm:mt-14 sm:px-6">
            <HeroDemo />
          </div>
        </section>

        {/* ---- Features ---- */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32"
        >
          <Reveal>
            <div className="max-w-2xl" data-reveal>
              <p className="lp-kicker">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
                Everything an agent needs.{' '}
                <span className="text-muted-foreground">
                  Nothing you have to wire up.
                </span>
              </h2>
            </div>
            <div className="mt-12">
              <FeatureBento />
            </div>
          </Reveal>
        </section>

        {/* ---- How it works ---- */}
        <section
          id="how"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32"
        >
          <Reveal>
            <div className="max-w-2xl" data-reveal>
              <p className="lp-kicker">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-[2.6rem] sm:leading-[1.1]">
                From idea to a working agent in three steps.
              </h2>
            </div>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="lp-step" data-reveal>
                  <div className="flex items-center justify-between">
                    <span className="lp-step__icon">
                      <HugeiconsIcon
                        icon={step.icon}
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </span>
                    <span className="text-muted-foreground font-mono text-xs tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-10 text-lg font-semibold tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-[15px] leading-6 text-pretty">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* ---- Closing call to action ---- */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <Reveal>
            <div className="lp-cta" data-reveal>
              <div className="lp-cta__texture" aria-hidden />
              <div className="relative flex flex-col items-center px-6 py-16 text-center sm:py-20">
                <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl sm:leading-[1.05]">
                  Your first agent is a few minutes away.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-md text-base leading-7 text-pretty">
                  Start from a template or a blank canvas. Sign in with GitHub
                  and you&rsquo;re building.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    render={<Link href="/agents/new" />}
                    nativeButton={false}
                    variant="primary"
                    size="lg"
                    className="h-10 rounded-full px-5 text-[15px]"
                  >
                    Start building
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      data-icon="inline-end"
                      aria-hidden="true"
                      className="lp-arrow"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-dashed">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6">
          <Logo
            size={22}
            labelClassName="text-sm font-medium text-foreground"
          />
          <p>{siteConfig.description}</p>
        </div>
      </footer>
    </div>
  );
}
