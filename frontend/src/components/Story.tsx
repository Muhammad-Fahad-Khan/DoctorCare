import { StoryContent } from '../types/cms';

export function Story({ content }: { content: StoryContent }) {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-16 sm:pt-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[560px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(241,188,228,0.55), transparent 70%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <span className="eyebrow">Our story</span>
        <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-royal sm:text-5xl">
          <span className="text-gradient">{content.heading}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-royal/70 sm:text-lg">
          {content.body}
        </p>
      </div>
    </section>
  );
}
