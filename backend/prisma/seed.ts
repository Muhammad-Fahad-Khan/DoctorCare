import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Admin accounts can't self-register (see AuthService) — seed the first one here.
  // Change this password immediately after first login in any real deployment.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@docucare.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      fullName: 'DocuCare Admin',
      role: Role.ADMIN,
    },
  });
  console.log(`Seeded admin account: ${adminEmail} / ${adminPassword} — change this password after first login.`);

  const home = await prisma.cmsPage.upsert({
    where: { slug: 'home' },
    update: {},
    create: { slug: 'home', title: 'Home' },
  });

  const sections: { sectionKey: string; order: number; content: Record<string, unknown> }[] = [
    {
      sectionKey: 'hero',
      order: 0,
      content: {
        heading: 'Talk to a doctor the moment something feels off',
        subheading:
          'Describe your symptoms, get matched with the right specialist, and see them over video — no downloads, no waiting rooms.',
        ctaLabel: 'Book Now',
        backgroundImageUrl: '',
      },
    },
    {
      sectionKey: 'chatbotIntro',
      order: 1,
      content: {
        promptText:
          "Tell me what you're feeling, in your own words. I'll help you figure out what kind of doctor to see.",
      },
    },
    {
      sectionKey: 'features',
      order: 2,
      content: {
        items: [
          { icon: 'Clock', title: '24/7 Support', description: 'A doctor is reachable any hour, any day.' },
          { icon: 'Stethoscope', title: 'Top Doctors', description: 'Every doctor on DocuCare is license-verified before they see a patient.' },
          { icon: 'Video', title: 'No App Needed', description: 'Video visits open right in your browser.' },
          { icon: 'Bot', title: 'AI Triage', description: 'A few questions steer you to the right specialty before you book.' },
        ],
      },
    },
    {
      sectionKey: 'testimonials',
      order: 3,
      content: {
        items: [
          {
            name: 'Amara Chen',
            quote: 'I described my symptoms at midnight and had a diagnosis plan by morning.',
            rating: 5,
            verified: true,
          },
          {
            name: 'Daniyal Farooq',
            quote: 'Booking took two minutes. The video call was clearer than most work meetings.',
            rating: 5,
            verified: true,
          },
        ],
      },
    },
    {
      sectionKey: 'faq',
      order: 4,
      content: {
        items: [
          {
            question: 'Is the AI symptom checker a diagnosis?',
            answer:
              'No. It suggests what kind of doctor to see and gives your doctor a head start — the doctor makes every medical decision.',
          },
          {
            question: 'Do I need to install anything for the video call?',
            answer: 'No. Consultations run directly in your browser.',
          },
        ],
      },
    },
  ];

  for (const section of sections) {
    await prisma.cmsSection.upsert({
      where: { pageId_sectionKey: { pageId: home.id, sectionKey: section.sectionKey } },
      update: { content: section.content as any, order: section.order },
      create: {
        pageId: home.id,
        sectionKey: section.sectionKey,
        content: section.content as any,
        order: section.order,
      },
    });
  }

  console.log('Seeded Home page CMS content.');

  // ---- About page ----
  const about = await prisma.cmsPage.upsert({
    where: { slug: 'about' },
    update: {},
    create: { slug: 'about', title: 'About' },
  });

  await upsertSection(about.id, 'story', 0, {
    heading: 'Care shouldn\u2019t wait for an appointment slot three weeks out',
    body:
      'DocuCare started as an open-source project to make the first step of getting care — figuring out who to see — as fast as describing the problem. Every doctor on the platform is license-verified, and every consultation runs over video with no app or account required.',
    imageUrl: '',
  });

  await upsertSection(about.id, 'stats', 1, {
    items: [
      { label: 'Patients helped', value: '1,000+' },
      { label: 'Verified doctors', value: '50+' },
      { label: 'Avg. time to see a doctor', value: '< 15 min' },
    ],
  });

  console.log('Seeded About page CMS content.');

  // ---- Contact page ----
  const contact = await prisma.cmsPage.upsert({
    where: { slug: 'contact' },
    update: {},
    create: { slug: 'contact', title: 'Contact' },
  });

  await upsertSection(contact.id, 'contactDetails', 0, {
    address: '123 Health St, Suite 100, San Francisco, CA',
    email: 'support@docucare.local',
    phone: '+1 (555) 010-2024',
  });

  console.log('Seeded Contact page CMS content.');
}

async function upsertSection(pageId: string, sectionKey: string, order: number, content: Record<string, unknown>) {
  await prisma.cmsSection.upsert({
    where: { pageId_sectionKey: { pageId, sectionKey } },
    update: { content: content as any, order },
    create: { pageId, sectionKey, content: content as any, order },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
