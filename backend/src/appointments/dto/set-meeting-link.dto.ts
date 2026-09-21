import { IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

export class SetMeetingLinkDto {
  // Empty string clears the link. Otherwise it must be a full https:// URL - this is rendered as a
  // clickable link for the patient, so anything like "javascript:" must never get through.
  @IsString()
  @MaxLength(500)
  @ValidateIf((o) => typeof o.meetingUrl === 'string' && o.meetingUrl.trim() !== '')
  @IsUrl({ protocols: ['https'], require_protocol: true, require_tld: true })
  meetingUrl: string;
}
