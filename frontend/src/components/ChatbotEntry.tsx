import { Bot, ArrowRight } from 'lucide-react';
import { ChatbotIntroContent } from '../types/cms';

export function ChatbotEntry({ content }: { content: ChatbotIntroContent }) {
  return (
    <section id="chatbot" className="px-6 py-12">
      <div className="interactive-card mx-auto flex max-w-2xl flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-magenta/10 text-magenta">
          <Bot size={22} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-royal">AI Symptom Checker</p>
          <p className="mt-1 text-sm text-royal/70">{content.promptText}</p>
        </div>

        <a
          href="/patient"
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-magenta transition-all duration-300 ease-docucare hover:gap-2.5"
        >
          Start chat <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
