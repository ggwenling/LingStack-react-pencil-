type ResourcesHeroProps = {
  title: string;
  description: string;
};

export function ResourcesHero({ title, description }: ResourcesHeroProps) {
  return (
    <header className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-600 sm:text-lg">
        {description}
      </p>
    </header>
  );
}
