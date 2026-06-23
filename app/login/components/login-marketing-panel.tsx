import Image from "next/image";
import { Brain, Code2, Route, Sparkles } from "lucide-react";

import {
  LOGIN_DESCRIPTION,
  LOGIN_FEATURES,
  LOGIN_HEADLINE,
} from "@/lib/login/login-content";

import { LoginProductPreview } from "./login-product-preview";

const featureIcons = {
  route: Route,
  psychology: Brain,
  sparkles: Sparkles,
  code: Code2,
} as const;

export function LoginMarketingPanel() {
  return (
    <section className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12 xl:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(15,23,42,0.14)_1px,transparent_1px)] bg-[size:18px_18px] opacity-35"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-neutral-950">
            <Image
              src="/images/lingstack/logo-mark.png"
              alt=""
              width={22}
              height={22}
              className="size-[22px] object-contain"
              priority
            />
          </div>
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-neutral-950">LingStack</span>
            <span className="mx-2 text-neutral-300">/</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em]">
              AI Learning Workspace
            </span>
          </p>
        </div>

        <div className="mt-10 max-w-2xl lg:mt-12">
          <h1 className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl xl:text-[42px]">
            {LOGIN_HEADLINE}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-[15px]">
            {LOGIN_DESCRIPTION}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {LOGIN_FEATURES.map((feature) => {
            const Icon = featureIcons[feature.icon];

            return (
              <article
                key={feature.title}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-4"
              >
                <span className="flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                  <Icon className="size-4 text-neutral-700" />
                </span>
                <h2 className="mt-3 text-sm font-semibold text-neutral-950">
                  {feature.title}
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <LoginProductPreview />
      </div>
    </section>
  );
}
