import { StoryContent } from '../types/cms';

export function Story({ content }: { content: StoryContent }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-royal sm:text-4xl">{content.heading}</h1>
        <p className="mt-5 text-base leading-relaxed text-royal/70">{content.body}</p>
      </div>
    </section>
  );
}
