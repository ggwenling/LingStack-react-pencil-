import { RegisterFormPanel } from "@/app/login/components/register-form-panel";
import { RegisterMarketingPanel } from "@/app/login/components/register-marketing-panel";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)] xl:grid-cols-[minmax(0,1.2fr)_480px]">
        <RegisterMarketingPanel />
        <RegisterFormPanel />
      </section>
    </main>
  );
}
