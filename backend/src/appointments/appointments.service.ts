import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { AppointmentStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BookAppointmentDto } from "./dto/book-appointment.dto";

type CurrentUser = { id: string; role: Role };

// How early a participant may enter the Jitsi room, and how long after the scheduled
// time it stays open (calls can run long or start a little late).
const JOIN_WINDOW_MINUTES_BEFORE = 10;
const JOIN_WINDOW_MINUTES_AFTER = 180;
// How long an "urgent, meet now" request keeps the call room open for both people.
const URGENT_MEETING_MINUTES = 180;

function makeJitsiRoomName() {
  // Random, unguessable room name — the "Join Meeting" button (SRS 3.3) links here.
  // No reliance on the appointment id, which would let a booking-id-guesser join a call.
  return `docucare-${randomBytes(12).toString("hex")}`;
}

// Every endpoint returns appointments in this same shape (with patient/doctor names), so the
// frontend never has to guess which relations are present.
const APPOINTMENT_INCLUDE = {
  patient: { select: { id: true, fullName: true } },
  doctor: { select: { id: true, fullName: true } },
  triageSession: {
    select: {
      summary: true,
      urgencyTag: true,
      recommendedSpecialty: true,
      detectedSymptoms: true,
      messages: true,
    },
  },
} as const;

/**
 * Decides what a viewer may see of the video-call details. The join window is enforced here on the
 * server: outside it the built-in room name (and the patient's copy of any external meeting link)
 * is withheld entirely, so it can't be used early just by reading the API response.
 * The doctor always sees their own meeting link so they can edit it.
 */
function withJoinPolicy<
  T extends {
    scheduledAt: Date;
    status: AppointmentStatus;
    jitsiRoomName: string;
    meetingUrl: string | null;
    urgentMeetingAt: Date | null;
  },
>(appointment: T, role: Role) {
  const scheduled = appointment.scheduledAt.getTime();
  const now = Date.now();
  const accepted = appointment.status === AppointmentStatus.ACCEPTED;

  const inScheduledWindow =
    now >= scheduled - JOIN_WINDOW_MINUTES_BEFORE * 60_000 &&
    now <= scheduled + JOIN_WINDOW_MINUTES_AFTER * 60_000;

  // The doctor asked to meet right now: the room is open immediately, whatever the booked time is.
  const urgentAt = appointment.urgentMeetingAt?.getTime();
  const urgentMeeting =
    accepted && urgentAt !== undefined && now >= urgentAt && now <= urgentAt + URGENT_MEETING_MINUTES * 60_000;

  const canJoin = accepted && (inScheduledWindow || urgentMeeting);

  return {
    ...appointment,
    jitsiRoomName: canJoin ? appointment.jitsiRoomName : null,
    meetingUrl: role === Role.DOCTOR || canJoin ? appointment.meetingUrl : null,
    canJoin,
    urgentMeeting,
  };
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async book(patientId: string, dto: BookAppointmentDto) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
      include: { doctorProfile: true },
    });

    if (!slot) {
      throw new NotFoundException("Availability slot not found.");
    }
    if (slot.isBooked) {
      throw new BadRequestException("This slot has already been booked.");
    }
    if (slot.startTime <= new Date()) {
      throw new BadRequestException("This time slot has already passed - please pick another.");
    }
    if (slot.doctorProfile.status !== "APPROVED") {
      throw new BadRequestException("This doctor is not currently accepting appointments.");
    }

    // The triage session becomes the doctor's "Patient AI Brief", so it must be the booking
    // patient's own - never someone else's medical conversation.
    let detachFromAppointmentId: string | null = null;
    if (dto.triageSessionId) {
      const session = await this.prisma.triageSession.findUnique({
        where: { id: dto.triageSessionId },
        include: { appointment: { select: { id: true, status: true } } },
      });
      if (!session || session.patientId !== patientId) {
        throw new BadRequestException("Triage session not found.");
      }
      if (session.appointment) {
        const inactive =
          session.appointment.status === AppointmentStatus.CANCELLED ||
          session.appointment.status === AppointmentStatus.REJECTED;
        if (!inactive) {
          throw new BadRequestException(
            "You already have an appointment for this consultation. Start a new AI chat to book another doctor.",
          );
        }
        // Earlier booking was cancelled/rejected - re-booking from the same chat is fine,
        // the brief just moves to the new appointment (triageSessionId is unique).
        detachFromAppointmentId = session.appointment.id;
      }
    }

    // Transaction: claim the slot and create the appointment together so two patients
    // racing for the same slot can't both succeed.
    return this.prisma.$transaction(async (tx) => {
      const stillFree = await tx.availabilitySlot.updateMany({
        where: { id: slot.id, isBooked: false },
        data: { isBooked: true },
      });
      if (stillFree.count === 0) {
        throw new BadRequestException("This slot has already been booked.");
      }

      if (detachFromAppointmentId) {
        await tx.appointment.update({
          where: { id: detachFromAppointmentId },
          data: { triageSessionId: null },
        });
      }

      const created = await tx.appointment.create({
        data: {
          patientId,
          doctorId: slot.doctorProfile.userId,
          slotId: slot.id,
          scheduledAt: slot.startTime,
          status: AppointmentStatus.PENDING,
          jitsiRoomName: makeJitsiRoomName(),
          triageSessionId: dto.triageSessionId,
        },
        include: APPOINTMENT_INCLUDE,
      });
      return withJoinPolicy(created, Role.PATIENT);
    });
  }

  async listMine(user: CurrentUser) {
    const where =
      user.role === Role.DOCTOR
        ? { doctorId: user.id }
        : { patientId: user.id };

    const rows = await this.prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
      include: APPOINTMENT_INCLUDE,
    });
    return rows.map((a) => withJoinPolicy(a, user.role));
  }

  async getById(user: CurrentUser, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: APPOINTMENT_INCLUDE,
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found.");
    }
    const ownerId =
      user.role === Role.DOCTOR ? appointment.doctorId : appointment.patientId;
    if (ownerId !== user.id) {
      throw new ForbiddenException(
        "You do not have access to this appointment.",
      );
    }

    return withJoinPolicy(appointment, user.role);
  }

  private async getOwnedAppointment(
    appointmentId: string,
    userId: string,
    asRole: "patient" | "doctor",
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException("Appointment not found.");
    }
    const ownerId =
      asRole === "patient" ? appointment.patientId : appointment.doctorId;
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "You do not have access to this appointment.",
      );
    }
    return appointment;
  }

  async updateStatus(
    doctorUserId: string,
    appointmentId: string,
    status: "ACCEPTED" | "REJECTED",
  ) {
    const appointment = await this.getOwnedAppointment(
      appointmentId,
      doctorUserId,
      "doctor",
    );

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot change status of an appointment that is already ${appointment.status}.`,
      );
    }

    if (status === "REJECTED" && appointment.slotId) {
      // Free the slot back up so another patient can book it.
      await this.prisma.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as AppointmentStatus },
    });
  }

  async complete(
    doctorUserId: string,
    appointmentId: string,
    doctorNotes?: string,
  ) {
    const appointment = await this.getOwnedAppointment(
      appointmentId,
      doctorUserId,
      "doctor",
    );

    if (appointment.status !== AppointmentStatus.ACCEPTED) {
      throw new BadRequestException(
        "Only an accepted appointment can be marked completed.",
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.COMPLETED, doctorNotes },
    });
  }

  /** Saves consultation notes without changing the appointment's status. */
  async saveNotes(doctorUserId: string, appointmentId: string, doctorNotes: string) {
    const appointment = await this.getOwnedAppointment(appointmentId, doctorUserId, "doctor");

    if (
      appointment.status !== AppointmentStatus.ACCEPTED &&
      appointment.status !== AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        "Notes can only be saved for an accepted or completed appointment.",
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { doctorNotes },
      include: APPOINTMENT_INCLUDE,
    });
    return withJoinPolicy(updated, Role.DOCTOR);
  }

  /**
   * A doctor's advice to the patient for the time before the consultation ("what to do right now").
   * It is stored on the appointment and returned to the patient with it, so it shows up immediately
   * on their dashboard - it is deliberately NOT gated by the video join window.
   */
  async setGuidance(doctorUserId: string, appointmentId: string, message: string, urgent = false) {
    const appointment = await this.getOwnedAppointment(appointmentId, doctorUserId, "doctor");

    if (
      appointment.status !== AppointmentStatus.PENDING &&
      appointment.status !== AppointmentStatus.ACCEPTED &&
      appointment.status !== AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Guidance can't be sent for an appointment that is ${appointment.status.toLowerCase()}.`,
      );
    }

    const text = message.trim();
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: text
        ? { patientGuidance: text, guidanceUrgent: urgent, guidanceUpdatedAt: new Date() }
        : { patientGuidance: null, guidanceUrgent: false, guidanceUpdatedAt: null },
      include: APPOINTMENT_INCLUDE,
    });
    return withJoinPolicy(updated, Role.DOCTOR);
  }

  /** Doctor asks to meet the patient right now: opens the call room for both immediately. */
  async startUrgentMeeting(doctorUserId: string, appointmentId: string) {
    const appointment = await this.getOwnedAppointment(appointmentId, doctorUserId, "doctor");

    if (appointment.status !== AppointmentStatus.ACCEPTED) {
      throw new BadRequestException(
        "Accept the appointment first - an urgent meeting can only be started on an accepted appointment.",
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { urgentMeetingAt: new Date() },
      include: APPOINTMENT_INCLUDE,
    });
    return withJoinPolicy(updated, Role.DOCTOR);
  }

  /** Withdraws the urgent request; the room goes back to opening at the booked time. */
  async endUrgentMeeting(doctorUserId: string, appointmentId: string) {
    await this.getOwnedAppointment(appointmentId, doctorUserId, "doctor");
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { urgentMeetingAt: null },
      include: APPOINTMENT_INCLUDE,
    });
    return withJoinPolicy(updated, Role.DOCTOR);
  }

  /** Attaches (or clears, with an empty string) a Zoom / Google Meet / Teams link for this appointment. */
  async setMeetingLink(doctorUserId: string, appointmentId: string, meetingUrl: string) {
    const appointment = await this.getOwnedAppointment(appointmentId, doctorUserId, "doctor");

    if (appointment.status !== AppointmentStatus.ACCEPTED) {
      throw new BadRequestException("A meeting link can only be set on an accepted appointment.");
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetingUrl: meetingUrl.trim() === "" ? null : meetingUrl.trim() },
      include: APPOINTMENT_INCLUDE,
    });
    return withJoinPolicy(updated, Role.DOCTOR);
  }

  async cancel(patientUserId: string, appointmentId: string) {
    const appointment = await this.getOwnedAppointment(
      appointmentId,
      patientUserId,
      "patient",
    );

    if (
      appointment.status !== AppointmentStatus.PENDING &&
      appointment.status !== AppointmentStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        `Cannot cancel an appointment that is ${appointment.status}.`,
      );
    }

    if (appointment.slotId) {
      await this.prisma.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });
  }
}
