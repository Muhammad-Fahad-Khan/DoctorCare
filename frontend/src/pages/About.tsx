import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CmsPageResponse, ImagesContent, StoryContent, StatsContent } from '../types/cms';
import { pickImage } from '../lib/images';
import { Story } from '../components/Story';
import { StatsCounters } from '../components/StatsCounters';

function renderSection(section: CmsPageResponse['sections'][number], images?: ImagesContent) {
  switch (section.key) {
    case 'story':
      return (
        <Story
          key={section.key}
          content={section.content as StoryContent}
          backgroundImage={pickImage(images, 'headerBackground')}
        />
      );
    case 'stats':
      return <StatsCounters key={section.key} content={section.content as StatsContent} />;
    default:
      return null;
  }
}

export function About() {
  const [page, setPage] = useState<CmsPageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPage('about').then(setPage).catch(() => setError('Could not load this page.'));
  }, []);

  if (error) {
    return <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-royal/60">{error}</div>;
  }
  if (!page) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-magenta border-t-transparent" />
      </div>
    );
  }

  const images = page.sections.find((s) => s.key === 'images')?.content as ImagesContent | undefined;

  return <div>{[...page.sections].sort((a, b) => a.order - b.order).map((s) => renderSection(s, images))}</div>;
}
