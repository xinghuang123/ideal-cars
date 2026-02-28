interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {/* Accent blue underline */}
        <div className="mt-3 h-1 w-16 rounded-full bg-accent" />
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-silver-dark sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
