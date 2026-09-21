import { CmsPageResponse } from '../types/cms';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'docucare_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request to ${path} failed: ${res.status}`);
  }

  // 204 / empty body endpoints
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// ---- Types for the endpoints used by the frontend so far ----

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface TriageSessionResponse {
  id: string;
  messages: { role: 'user' | 'assistant'; content: string; ts: string }[];
  detectedSymptoms: string[] | null;
  urgencyTag: string | null;
  recommendedSpecialty: string | null;
  summary: string | null;
}

export interface DoctorListing {
  id: string; // doctorProfileId
  specialty: string;
  bio: string | null;
  yearsExperience: number | null;
  openSlots: number; // future, unbooked slots
  user: { id: string; fullName: string; avatarUrl: string | null };
}

export interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface AppointmentResponse {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  jitsiRoomName: string | null; // only present from GET /appointments/:id when canJoin is true
  canJoin?: boolean; // true only while the join window is open (server-computed)
  meetingUrl: string | null; // optional Zoom / Meet link; the patient only receives it while canJoin
  urgentMeeting?: boolean; // true while the doctor has asked to meet right now (call room open immediately)
  patientGuidance: string | null; // doctor's advice to the patient before the consultation
  guidanceUrgent: boolean;
  guidanceUpdatedAt: string | null;
  doctorNotes: string | null;
  patient: { id: string; fullName: string };
  doctor: { id: string; fullName: string };
  triageSession: {
    id?: string;
    summary: string | null;
    urgencyTag: string | null;
    recommendedSpecialty: string | null;
    detectedSymptoms: string[] | null;
    messages: { role: 'user' | 'assistant'; content: string; ts: string }[];
  } | null;
}

export interface DoctorProfileAdmin {
  id: string;
  specialty: string;
  licenseNumber: string;
  bio: string | null;
  yearsExperience: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  user: { id: string; email: string; fullName: string; createdAt: string };
}

export interface GroqSettingsResponse {
  hasKey: boolean;
  model: string;
  temperature: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

export const api = {
  getPage: (slug: string) => request<CmsPageResponse>(`/cms/pages/${slug}`),

  // Admin: CMS editor writes go through this — same slug/section shape the public GET returns.
  upsertCmsSection: (
    slug: string,
    body: { sectionKey: string; content: Record<string, unknown>; order: number },
  ) => request<unknown>(`/admin/cms/pages/${slug}/sections`, { method: 'PUT', body: JSON.stringify(body) }),

  register: (body: { email: string; password: string; fullName: string; role: 'PATIENT' | 'DOCTOR'; specialty?: string; licenseNumber?: string }) =>
    request<AuthResponse | { message: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<AuthUser>('/auth/me'),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ changed: boolean }>('/auth/change-password', { method: 'PATCH', body: JSON.stringify(body) }),

  startTriage: (message: string) =>
    request<TriageSessionResponse>('/triage/sessions', { method: 'POST', body: JSON.stringify({ message }) }),
  continueTriage: (sessionId: string, message: string) =>
    request<TriageSessionResponse>(`/triage/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getTriageSession: (sessionId: string) => request<TriageSessionResponse>(`/triage/sessions/${sessionId}`),

  listDoctors: (specialty?: string) =>
    request<DoctorListing[]>(`/doctors${specialty ? `?specialty=${encodeURIComponent(specialty)}` : ''}`),
  listDoctorAvailability: (doctorProfileId: string) =>
    request<AvailabilitySlot[]>(`/doctors/${doctorProfileId}/availability`),

  // Doctor's own availability management (role: DOCTOR)
  listMyAvailability: () => request<AvailabilitySlot[]>('/doctors/me/availability'),
  createAvailability: (body: { startTime: string; endTime: string }) =>
    request<AvailabilitySlot>('/doctors/me/availability', { method: 'POST', body: JSON.stringify(body) }),
  deleteAvailability: (slotId: string) =>
    request<{ deleted: boolean }>(`/doctors/me/availability/${slotId}`, { method: 'DELETE' }),

  bookAppointment: (body: { slotId: string; triageSessionId?: string }) =>
    request<AppointmentResponse>('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  listMyAppointments: () => request<AppointmentResponse[]>('/appointments/me'),
  cancelAppointment: (id: string) => request<AppointmentResponse>(`/appointments/${id}/cancel`, { method: 'PATCH' }),

  // Doctor's own appointment actions (role: DOCTOR)
  updateAppointmentStatus: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
    request<AppointmentResponse>(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  completeAppointment: (id: string, doctorNotes?: string) =>
    request<AppointmentResponse>(`/appointments/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ doctorNotes }),
    }),
  getAppointment: (id: string) => request<AppointmentResponse>(`/appointments/${id}`),
  saveAppointmentNotes: (id: string, doctorNotes: string) =>
    request<AppointmentResponse>(`/appointments/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ doctorNotes }) }),
  startUrgentMeeting: (id: string) => request<AppointmentResponse>(`/appointments/${id}/urgent-meeting`, { method: 'POST' }),
  endUrgentMeeting: (id: string) => request<AppointmentResponse>(`/appointments/${id}/urgent-meeting`, { method: 'DELETE' }),
  setPatientGuidance: (id: string, message: string, urgent: boolean) =>
    request<AppointmentResponse>(`/appointments/${id}/guidance`, { method: 'PATCH', body: JSON.stringify({ message, urgent }) }),
  setMeetingLink: (id: string, meetingUrl: string) =>
    request<AppointmentResponse>(`/appointments/${id}/meeting-link`, { method: 'PATCH', body: JSON.stringify({ meetingUrl }) }),

  // Admin: doctor approval (role: ADMIN)
  listAdminDoctors: (status?: DoctorProfileAdmin['status']) =>
    request<DoctorProfileAdmin[]>(`/admin/doctors${status ? `?status=${status}` : ''}`),
  updateDoctorStatus: (id: string, status: DoctorProfileAdmin['status']) =>
    request<DoctorProfileAdmin>(`/admin/doctors/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Admin: Groq engine settings (role: ADMIN)
  getGroqSettings: () => request<GroqSettingsResponse>('/admin/settings/groq'),
  updateGroqSettings: (body: { apiKey?: string; model?: string; temperature?: number }) =>
    request<GroqSettingsResponse>('/admin/settings/groq', { method: 'PUT', body: JSON.stringify(body) }),
  testGroqConnection: () => request<{ ok: boolean; message: string }>('/admin/settings/groq/test-connection', { method: 'POST' }),
  listGroqModels: () => request<string[]>('/admin/settings/groq/models'),

  submitContactInquiry: (body: { name: string; email: string; message: string }) =>
    request<ContactInquiry>('/contact', { method: 'POST', body: JSON.stringify(body) }),

  // Admin: contact inquiry inbox (role: ADMIN)
  listContactInquiries: () => request<ContactInquiry[]>('/admin/contact-inquiries'),
  markInquiryHandled: (id: string) =>
    request<ContactInquiry>(`/admin/contact-inquiries/${id}/handled`, { method: 'PATCH' }),
};

