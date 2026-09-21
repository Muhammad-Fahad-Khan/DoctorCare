// Demo data for manual testing. Goes through the running API (not raw SQL) so it also
// exercises the real backend logic: registration, admin approval, slots, booking, status changes.
//
//   1. start the backend (npm run dev)
//   2. npm run prisma:seed-demo
//
// Safe to re-run: existing accounts are reused, and slots/appointments are only created once.
// Override the target with API_URL / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD if needed.
import { PrismaClient } from '@prisma/client';

const API = process.env.API_URL ?? 'http://localhost:4000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@docucare.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
const DOCTOR_PASSWORD = 'Doctor@123';
const PATIENT_PASSWORD = 'Patient@123';

const prisma = new PrismaClient();

interface DemoDoctor {
  email: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
  yearsExperience: number;
  bio: string;
  approve: boolean; // false = left PENDING so the admin approval flow can be tested
}

const DOCTORS: DemoDoctor[] = [
  { email: 'sarah.ahmed@docucare.demo', fullName: 'Dr. Sarah Ahmed', specialty: 'Cardiologist', licenseNumber: 'PMC-C-1001', yearsExperience: 12, bio: 'Heart and blood-pressure specialist. Chest pain, palpitations, hypertension.', approve: true },
  { email: 'omar.farooq@docucare.demo', fullName: 'Dr. Omar Farooq', specialty: 'Dermatologist', licenseNumber: 'PMC-D-1002', yearsExperience: 8, bio: 'Skin, hair and nail conditions. Acne, eczema, rashes, allergies.', approve: true },
  { email: 'ayesha.khan@docucare.demo', fullName: 'Dr. Ayesha Khan', specialty: 'General Physician', licenseNumber: 'PMC-G-1003', yearsExperience: 10, bio: 'First point of care for fever, flu, infections and general health checks.', approve: true },
  { email: 'bilal.hussain@docucare.demo', fullName: 'Dr. Bilal Hussain', specialty: 'Neurologist', licenseNumber: 'PMC-N-1004', yearsExperience: 15, bio: 'Headaches, migraines, dizziness, numbness, seizures and nerve disorders.', approve: true },
  { email: 'maryam.siddiqui@docucare.demo', fullName: 'Dr. Maryam Siddiqui', specialty: 'Pediatrician', licenseNumber: 'PMC-P-1005', yearsExperience: 9, bio: 'Child health from newborn to teenage years: fevers, growth, vaccinations.', approve: true },
  { email: 'imran.malik@docucare.demo', fullName: 'Dr. Imran Malik', specialty: 'Orthopedic Surgeon', licenseNumber: 'PMC-O-1006', yearsExperience: 14, bio: 'Bones, joints and muscles. Fractures, back pain, knee and shoulder problems.', approve: true },
  { email: 'nadia.rehman@docucare.demo', fullName: 'Dr. Nadia Rehman', specialty: 'Psychiatrist', licenseNumber: 'PMC-Y-1007', yearsExperience: 11, bio: 'Anxiety, depression, sleep problems and stress management.', approve: true },
  // Registered but deliberately NOT approved — for testing the admin approval flow.
  { email: 'hamza.tariq@docucare.demo', fullName: 'Dr. Hamza Tariq', specialty: 'ENT Specialist', licenseNumber: 'PMC-E-2001', yearsExperience: 7, bio: 'Ear, nose and throat.', approve: false },
  { email: 'sana.iqbal@docucare.demo', fullName: 'Dr. Sana Iqbal', specialty: 'Gynecologist', licenseNumber: 'PMC-Gy-2002', yearsExperience: 13, bio: "Women's health and pregnancy care.", approve: false },
  { email: 'kamran.shah@docucare.demo', fullName: 'Dr. Kamran Shah', specialty: 'Ophthalmologist', licenseNumber: 'PMC-Op-2003', yearsExperience: 6, bio: 'Eye examinations and vision problems.', approve: false },
  { email: 'zoya.ali@docucare.demo', fullName: 'Dr. Zoya Ali', specialty: 'Endocrinologist', licenseNumber: 'PMC-En-2004', yearsExperience: 9, bio: 'Diabetes, thyroid and hormonal disorders.', approve: false },
];

const PATIENTS = [
  { email: 'ali.raza@docucare.demo', fullName: 'Ali Raza' },
  { email: 'fatima.noor@docucare.demo', fullName: 'Fatima Noor' },
  { email: 'usman.sheikh@docucare.demo', fullName: 'Usman Sheikh' },
  { email: 'hira.javed@docucare.demo', fullName: 'Hira Javed' },
  { email: 'zain.abbas@docucare.demo', fullName: 'Zain Abbas' },
  { email: 'mahnoor.tariq@docucare.demo', fullName: 'Mahnoor Tariq' },
];

async function call<T = any>(method: string, path: string, opts: { token?: string; body?: unknown; allow?: number[] } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok && !(opts.allow ?? []).includes(res.status)) {
    throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 200)}`);
  }
  return { status: res.status, data: json as T };
}

async function login(email: string, password: string): Promise<string> {
  const { data } = await call<{ accessToken: string }>('POST', '/auth/login', { body: { email, password } });
  return data.accessToken;
}

/** Register through the real endpoint; a 409 just means the account already exists. */
async function register(body: Record<string, unknown>) {
  const { status } = await call('POST', '/auth/register', { body, allow: [409] });
  return status === 409 ? 'exists' : 'created';
}

function slotTimes(dayOffset: number, hour: number) {
  const start = new Date();
  start.setDate(start.getDate() + dayOffset);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}

interface DemoTriage {
  patientEmail: string;
  turns: [user: string, assistant: string][];
  detectedSymptoms: string[];
  urgencyTag: 'Routine' | 'Soon' | 'Urgent';
  recommendedSpecialty: string; // must match a doctor's specialty string exactly to be bookable
  summary: string;
  linkToDoctor?: string; // attach to this patient's appointment with that doctor, so the doctor's brief shows it
}

// Stored the same shape the real GroqService/TriageService writes, so the patient dashboard and the
// doctor's "Patient AI Brief" render them like genuine triage sessions. Inserted directly because
// creating real ones needs a Groq API key.
const TRIAGE: DemoTriage[] = [
  {
    patientEmail: 'ali.raza@docucare.demo', linkToDoctor: 'omar.farooq@docucare.demo',
    turns: [
      ["I have an itchy red rash on both forearms since 4 days.", 'Sorry to hear that. Did you start any new soap, detergent, or medicine recently?'],
      ['Yes, I changed my laundry detergent last week. No fever.', 'Thanks. A skin specialist would be the right person to look at this. I suggest booking a Dermatologist.'],
    ],
    detectedSymptoms: ['itchy red rash', 'forearms', 'started 4 days ago'],
    urgencyTag: 'Routine', recommendedSpecialty: 'Dermatologist',
    summary: 'Patient reports an itchy red rash on both forearms for 4 days, beginning after switching laundry detergent. No fever. Likely contact dermatitis to be assessed.',
  },
  {
    patientEmail: 'fatima.noor@docucare.demo', linkToDoctor: 'sarah.ahmed@docucare.demo',
    turns: [
      ['I get chest tightness and my heart races when I climb stairs.', 'That needs proper attention. How long has this been happening, and does it ease with rest?'],
      ['About two weeks. It goes away after I rest for a few minutes.', 'Thank you. I recommend seeing a Cardiologist soon. If the pain becomes severe or spreads to your arm or jaw, seek emergency care immediately.'],
    ],
    detectedSymptoms: ['chest tightness', 'palpitations on exertion', 'relieved by rest', '2 weeks'],
    urgencyTag: 'Soon', recommendedSpecialty: 'Cardiologist',
    summary: 'Two weeks of exertional chest tightness with palpitations, relieved by rest. Needs cardiac evaluation soon; advised to seek emergency care if symptoms worsen.',
  },
  {
    patientEmail: 'usman.sheikh@docucare.demo', linkToDoctor: 'ayesha.khan@docucare.demo',
    turns: [
      ['I have had fever, body aches and a sore throat for 3 days.', 'Sorry you feel unwell. Any cough, breathing difficulty, or a temperature above 39C?'],
      ['No breathing problems. Temperature is around 38.5.', 'Thanks. A General Physician can assess and treat this. I suggest booking one.'],
    ],
    detectedSymptoms: ['fever', 'body aches', 'sore throat', '3 days'],
    urgencyTag: 'Routine', recommendedSpecialty: 'General Physician',
    summary: 'Three days of fever (~38.5C), body aches and sore throat. No breathing difficulty. Likely viral illness; routine consultation.',
  },
  {
    patientEmail: 'hira.javed@docucare.demo', linkToDoctor: 'bilal.hussain@docucare.demo',
    turns: [
      ['I keep getting severe headaches with flashing lights before them.', 'That sounds distressing. Do you have any weakness, numbness, or trouble speaking with them?'],
      ['Yes, my left hand went numb for a while during the last one.', 'Numbness with severe headaches should be checked promptly. I recommend a Neurologist as soon as possible; go to emergency care if weakness or speech trouble appears.'],
    ],
    detectedSymptoms: ['severe headache', 'visual aura', 'left hand numbness'],
    urgencyTag: 'Urgent', recommendedSpecialty: 'Neurologist',
    summary: 'Recurrent severe headaches preceded by visual aura, with transient left-hand numbness during the latest episode. Prompt neurological assessment advised.',
  },
  {
    patientEmail: 'zain.abbas@docucare.demo',
    turns: [
      ['My right knee hurts when I walk downstairs, since I started running.', 'Is there swelling, or does the knee lock or give way?'],
      ['A little swelling, no locking.', 'Thanks. An Orthopedic Surgeon is the right specialist for this.'],
    ],
    detectedSymptoms: ['right knee pain', 'pain on stairs', 'mild swelling'],
    urgencyTag: 'Routine', recommendedSpecialty: 'Orthopedic Surgeon',
    summary: 'Right knee pain on descending stairs since starting running, with mild swelling and no locking. Routine orthopedic assessment.',
  },
  {
    patientEmail: 'mahnoor.tariq@docucare.demo',
    turns: [
      ["I feel anxious all the time and I can't sleep properly for 3 weeks.", 'I am sorry you are going through that. Does the anxiety affect your work or daily routine?'],
      ['Yes, I cannot focus and I feel exhausted.', 'Thank you for sharing. A Psychiatrist can help with anxiety and sleep problems. I suggest booking one.'],
    ],
    detectedSymptoms: ['persistent anxiety', 'insomnia', 'poor concentration', 'fatigue', '3 weeks'],
    urgencyTag: 'Routine', recommendedSpecialty: 'Psychiatrist',
    summary: 'Three weeks of persistent anxiety and disrupted sleep affecting concentration and daily function. Routine psychiatric evaluation recommended.',
  },
];

async function seedTriageHistory() {
  console.log('\nPatient triage history');
  for (const t of TRIAGE) {
    const patient = await prisma.user.findUniqueOrThrow({ where: { email: t.patientEmail } });
    if ((await prisma.triageSession.count({ where: { patientId: patient.id } })) > 0) {
      console.log(`  skip    ${patient.fullName} already has a triage session`);
      continue;
    }
    const base = Date.now() - 60 * 60 * 1000;
    const messages = t.turns.flatMap(([u, a], i) => [
      { role: 'user', content: u, ts: new Date(base + i * 120000).toISOString() },
      { role: 'assistant', content: a, ts: new Date(base + i * 120000 + 15000).toISOString() },
    ]);
    const session = await prisma.triageSession.create({
      data: {
        patientId: patient.id, messages, detectedSymptoms: t.detectedSymptoms,
        urgencyTag: t.urgencyTag, recommendedSpecialty: t.recommendedSpecialty, summary: t.summary,
      },
    });
    let linked = '';
    if (t.linkToDoctor) {
      const appt = await prisma.appointment.findFirst({
        where: { patientId: patient.id, doctor: { email: t.linkToDoctor }, triageSessionId: null },
      });
      if (appt) {
        await prisma.appointment.update({ where: { id: appt.id }, data: { triageSessionId: session.id } });
        linked = ' (linked to appointment)';
      }
    }
    console.log(`  created ${patient.fullName.padEnd(14)} ${t.urgencyTag.padEnd(8)} -> ${t.recommendedSpecialty}${linked}`);
  }
}

async function main() {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  // ---- doctors: register (always PENDING), then approve most of them via the admin API ----
  console.log('\nDoctors');
  for (const d of DOCTORS) {
    const r = await register({
      email: d.email, password: DOCTOR_PASSWORD, fullName: d.fullName, role: 'DOCTOR',
      specialty: d.specialty, licenseNumber: d.licenseNumber,
    });
    const profile = await prisma.doctorProfile.findFirstOrThrow({ where: { user: { email: d.email } } });
    // bio / yearsExperience have no API endpoint yet, so they're set directly.
    await prisma.doctorProfile.update({ where: { id: profile.id }, data: { bio: d.bio, yearsExperience: d.yearsExperience } });
    if (d.approve && profile.status === 'PENDING') {
      await call('PATCH', `/admin/doctors/${profile.id}/status`, { token: adminToken, body: { status: 'APPROVED' } });
    }
    console.log(`  ${r.padEnd(7)} ${d.fullName.padEnd(22)} ${d.specialty.padEnd(20)} ${d.approve ? 'APPROVED' : 'PENDING (left for admin review)'}`);
  }

  // ---- availability slots for approved doctors: 3 days x 3 slots ----
  console.log('\nAvailability slots');
  for (const d of DOCTORS.filter((x) => x.approve)) {
    const token = await login(d.email, DOCTOR_PASSWORD);
    const existing = await call<any[]>('GET', '/doctors/me/availability', { token });
    if (existing.data.length > 0) {
      console.log(`  skip    ${d.fullName} already has ${existing.data.length} slots`);
      continue;
    }
    for (const day of [1, 2, 3]) {
      for (const hour of [10, 14, 17]) {
        await call('POST', '/doctors/me/availability', { token, body: slotTimes(day, hour) });
      }
    }
    console.log(`  created ${d.fullName}: 9 slots`);
  }

  // ---- patients ----
  console.log('\nPatients');
  for (const p of PATIENTS) {
    const r = await register({ email: p.email, password: PATIENT_PASSWORD, fullName: p.fullName, role: 'PATIENT' });
    console.log(`  ${r.padEnd(7)} ${p.fullName}`);
  }

  // ---- appointments covering each lifecycle path (only on a fresh DB) ----
  console.log('\nAppointments');
  const alreadyBooked = await prisma.appointment.count({ where: { patient: { email: { in: PATIENTS.map((p) => p.email) } } } });
  if (alreadyBooked > 0) {
    console.log(`  skip    ${alreadyBooked} demo appointments already exist`);
  } else {
    const firstSlotOf = async (doctorEmail: string) => {
      const profile = await prisma.doctorProfile.findFirstOrThrow({ where: { user: { email: doctorEmail } } });
      const slots = await call<any[]>('GET', `/doctors/${profile.id}/availability`);
      return slots.data[0].id as string;
    };
    const doctorTok = (email: string) => login(email, DOCTOR_PASSWORD);
    const book = async (patientEmail: string, doctorEmail: string) => {
      const token = await login(patientEmail, PATIENT_PASSWORD);
      const { data } = await call<any>('POST', '/appointments', { token, body: { slotId: await firstSlotOf(doctorEmail) } });
      return { id: data.id as string, patientToken: token };
    };

    // 1. PENDING: booked, waiting for the doctor
    await book('ali.raza@docucare.demo', 'omar.farooq@docucare.demo');
    console.log('  Ali Raza      -> Dr. Omar Farooq    PENDING');

    // 2. ACCEPTED
    const a2 = await book('fatima.noor@docucare.demo', 'sarah.ahmed@docucare.demo');
    await call('PATCH', `/appointments/${a2.id}/status`, { token: await doctorTok('sarah.ahmed@docucare.demo'), body: { status: 'ACCEPTED' } });
    console.log('  Fatima Noor   -> Dr. Sarah Ahmed    ACCEPTED');

    // 3. COMPLETED (accepted, then completed with notes)
    const a3 = await book('usman.sheikh@docucare.demo', 'ayesha.khan@docucare.demo');
    const ayesha = await doctorTok('ayesha.khan@docucare.demo');
    await call('PATCH', `/appointments/${a3.id}/status`, { token: ayesha, body: { status: 'ACCEPTED' } });
    await call('PATCH', `/appointments/${a3.id}/complete`, { token: ayesha, body: { doctorNotes: 'Viral fever. Rest, fluids, paracetamol as needed. Review if no improvement in 3 days.' } });
    console.log('  Usman Sheikh  -> Dr. Ayesha Khan    COMPLETED');

    // 4. REJECTED (frees the slot again)
    const a4 = await book('hira.javed@docucare.demo', 'bilal.hussain@docucare.demo');
    await call('PATCH', `/appointments/${a4.id}/status`, { token: await doctorTok('bilal.hussain@docucare.demo'), body: { status: 'REJECTED' } });
    console.log('  Hira Javed    -> Dr. Bilal Hussain  REJECTED');

    // 5. CANCELLED by the patient (frees the slot again)
    const a5 = await book('zain.abbas@docucare.demo', 'maryam.siddiqui@docucare.demo');
    await call('PATCH', `/appointments/${a5.id}/cancel`, { token: a5.patientToken });
    console.log('  Zain Abbas    -> Dr. Maryam Siddiqui CANCELLED');
  }

  await seedTriageHistory();

  console.log(`\nDone. Doctor password: ${DOCTOR_PASSWORD}   Patient password: ${PATIENT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('\nSeed failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
