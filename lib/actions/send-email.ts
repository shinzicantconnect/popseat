'use server'

import 'server-only'
import { Resend } from 'resend'

export interface SendTicketEmailParams {
  toEmail?: string
  movieTitle: string
  seats: string[]
  totalPrice: number
  bookingCode?: string
  cinemaHall?: string
  startTime?: string
}

/**
 * Sends a branded PopSeat e-ticket confirmation email via Resend.
 *
 * NOTE: The onboarding@resend.dev sender domain is only permitted to deliver
 * to the Resend account-owner's verified email address. For production, set a
 * custom verified domain and update the `from` field accordingly.
 */
export async function sendTicketEmail({
  toEmail,
  movieTitle,
  seats = [],
  totalPrice,
  bookingCode = 'POPSEAT-PASS',
  cinemaHall = 'Main Cinema Hall',
  startTime,
}: SendTicketEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[sendTicketEmail] RESEND_API_KEY is not set — skipping email.')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  // Resend onboarding domain can only deliver to the verified account owner
  const recipient = 'edsimonmendoza@gmail.com'

  const formattedDate = startTime
    ? new Date(startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date Confirmed'

  const formattedTime = startTime
    ? new Date(startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : ''

  const seatCount = seats.length
  const pricePerSeat =
    seatCount > 0 ? (totalPrice / seatCount).toFixed(2) : totalPrice.toFixed(2)

  const seatCells = seats
    .map(
      (s) =>
        `<td style="padding:0 4px 8px 0;">
          <div style="background:#1a0000;border:1px solid #7f1d1d;border-radius:6px;padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#ffffff;letter-spacing:1px;text-align:center;white-space:nowrap;">
            ${s}
          </div>
        </td>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PopSeat Cinema Ticket</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:32px 12px;">
  <tr>
    <td align="center">

      <!-- Outer ticket card -->
      <table role="presentation" width="100%" style="max-width:520px;" cellspacing="0" cellpadding="0">

        <!-- Red gradient top bar -->
        <tr>
          <td style="background:linear-gradient(90deg,#7f1d1d,#991b1b,#7f1d1d);height:6px;border-radius:16px 16px 0 0;"></td>
        </tr>

        <!-- Main ticket body -->
        <tr>
          <td style="background:#111111;border-left:1px solid #222;border-right:1px solid #222;">

            <!-- Header: Logo + Status -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 32px 20px;">
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background:#1a0000;border:1px solid #7f1d1d;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;color:#ef4444;letter-spacing:3px;font-family:Arial,sans-serif;">
                        CINEMA
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:4px;font-size:26px;font-weight:900;letter-spacing:2px;color:#ffffff;font-family:Arial Black,Arial,sans-serif;">
                        POP<span style="color:#ef4444;">SEAT</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" valign="top">
                  <div style="background:#052e16;border:1px solid #166534;border-radius:20px;padding:6px 14px;display:inline-block;">
                    <span style="font-size:11px;font-weight:700;color:#4ade80;letter-spacing:1px;font-family:Arial,sans-serif;">ADMISSION CONFIRMED</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr><td style="padding:0 32px;"><div style="border-top:1px solid #222;"></div></td></tr>
            </table>

            <!-- Film block -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 32px 20px;">
              <tr>
                <td>
                  <div style="font-size:10px;font-weight:700;color:#ef4444;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:8px;">
                    FEATURE PRESENTATION
                  </div>
                  <div style="font-size:28px;font-weight:900;color:#ffffff;line-height:1.1;font-family:Arial Black,Arial,sans-serif;margin-bottom:16px;">
                    ${movieTitle}
                  </div>

                  <table role="presentation" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding-right:24px;padding-bottom:8px;">
                        <div style="font-size:10px;color:#666;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:3px;">CINEMA HALL</div>
                        <div style="font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${cinemaHall}</div>
                      </td>
                      ${startTime ? `
                      <td style="padding-right:24px;padding-bottom:8px;">
                        <div style="font-size:10px;color:#666;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:3px;">DATE</div>
                        <div style="font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${formattedDate}</div>
                      </td>
                      <td style="padding-bottom:8px;">
                        <div style="font-size:10px;color:#666;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:3px;">SHOWTIME</div>
                        <div style="font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${formattedTime}</div>
                      </td>
                      ` : ''}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Perforated separator -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="20" style="background:#0a0a0a;border-radius:0 20px 20px 0;"></td>
                <td style="padding:4px 0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td style="border-top:2px dashed #2a2a2a;height:1px;"></td></tr>
                  </table>
                </td>
                <td width="20" style="background:#0a0a0a;border-radius:20px 0 0 20px;"></td>
              </tr>
            </table>

            <!-- Ticket stub: seats + ref + price -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:20px 32px 24px;">
              <tr>
                <td>
                  <div style="font-size:10px;font-weight:700;color:#666;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:10px;">
                    RESERVED SEATS (${seatCount})
                  </div>
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                    <tr>
                      ${seatCells || `<td><div style="font-size:13px;color:#fff;font-family:Arial,sans-serif;">General Admission</div></td>`}
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50%" style="padding-right:12px;">
                        <div style="background:#0d0d0d;border:1px solid #222;border-radius:10px;padding:14px 16px;">
                          <div style="font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:6px;">BOOKING REFERENCE</div>
                          <div style="font-size:14px;font-weight:700;color:#ef4444;font-family:'Courier New',Courier,monospace;letter-spacing:1px;">${bookingCode}</div>
                          <div style="font-size:10px;color:#444;font-family:Arial,sans-serif;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Present at turnstile</div>
                        </div>
                      </td>
                      <td width="50%" style="padding-left:12px;">
                        <div style="background:#0d0d0d;border:1px solid #222;border-radius:10px;padding:14px 16px;">
                          <div style="font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:6px;">AMOUNT PAID</div>
                          <div style="font-size:22px;font-weight:900;color:#4ade80;font-family:Arial Black,Arial,sans-serif;">PHP ${Number(totalPrice).toFixed(2)}</div>
                          <div style="font-size:10px;color:#444;font-family:Arial,sans-serif;margin-top:4px;letter-spacing:1px;">PHP ${pricePerSeat} x ${seatCount} seat${seatCount !== 1 ? 's' : ''}</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Red gradient bottom bar -->
        <tr>
          <td style="background:linear-gradient(90deg,#7f1d1d,#991b1b,#7f1d1d);height:6px;border-radius:0 0 16px 16px;"></td>
        </tr>

        <!-- Footer text -->
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <div style="font-size:11px;color:#444;font-family:Arial,sans-serif;line-height:1.6;">
              This ticket was sent to <span style="color:#888;">${recipient}</span> via Resend.<br />
              Non-transferable. Valid only for the screening indicated above.<br />
              <span style="color:#333;">PopSeat Cinemas &mdash; ${new Date().getFullYear()}</span>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
`

  try {
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: 'Pop Seat <onboarding@resend.dev>',
      to: recipient,
      subject: `Ticket Confirmed: ${movieTitle} [${bookingCode}]`,
      html,
    })

    if (error) {
      console.warn('[sendTicketEmail] Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('[sendTicketEmail] Ticket email sent. ID:', data?.id)
    return { success: true, id: data?.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[sendTicketEmail] Dispatch error:', message)
    return { success: false, error: message }
  }
}
