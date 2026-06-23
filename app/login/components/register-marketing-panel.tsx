import {
  REGISTER_DESCRIPTION,
  REGISTER_HEADLINE,
  REGISTER_WORKSTATION_LABEL,
} from "@/lib/login/register-content";

import { RegisterWorkspacePreview } from "./register-workspace-preview";

export function RegisterMarketingPanel() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12 xl:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(15,23,42,0.14)_1px,transparent_1px)] bg-size-[18px_18px] opacity-35"
      />

      <div className="relative z-10">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
          {REGISTER_WORKSTATION_LABEL}
        </p>

        <div className="mt-8 max-w-2xl lg:mt-10">
          <h1 className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl xl:text-[42px]">
            {REGISTER_HEADLINE}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-[15px]">
            {REGISTER_DESCRIPTION}
          </p>
        </div>

        <RegisterWorkspacePreview />
      </div>
    </section>
  );
}
