import { LoginFormPanel } from "./components/login-form-panel";
import { LoginMarketingPanel } from "./components/login-marketing-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)] xl:grid-cols-[minmax(0,1.2fr)_480px]">
        <LoginMarketingPanel />
        <LoginFormPanel />
      </section>
    </main>
  );
}
