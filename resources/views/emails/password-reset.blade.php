<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8" />
  <title>Passwort zurücksetzen</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f3f4f6;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Hauptkarte -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px; background-color:#ffffff; border-radius:16px;
                      box-shadow:0 12px 30px rgba(15, 23, 42, 0.08); overflow:hidden;">

          <!-- Header mit zentriertem Logo -->
          <tr>
            <td style="padding:24px 32px 8px 32px;" align="center">
              <img src="https://app.ppsbusinesscards.de/assets/pps_logo.png" alt="PPS Karten Logo"
                style="display:block; max-width:200px; width:100%; height:auto;" />
            </td>
          </tr>

          <!-- Inhalt -->
          <tr>
            <td style="padding:8px 32px 24px 32px;">

              <!-- Überschrift -->
              <p style="margin:0 0 20px 0; font-family:Arial, sans-serif; font-size:22px; 
                        line-height:1.4; color:#111827; font-weight:bold; text-align:center;">
                Passwort zurücksetzen
              </p>

              <!-- Begrüßung -->
              <p style="margin:0 0 14px 0; font-family:Arial, sans-serif; font-size:16px; 
                        line-height:1.7; color:#4b5563;">
                Hallo {{ $user->first_name ?? $user->name ?? 'User' }},
              </p>

              <!-- Einleitungstext -->
              <p style="margin:0 0 14px 0; font-family:Arial, sans-serif; font-size:16px; 
                        line-height:1.7; color:#4b5563;">
                du hast angefordert, dein Passwort für deinen Zugang zu unserer Webapp zurückzusetzen.
              </p>

              <!-- Erklärung -->
              <p style="margin:0 0 24px 0; font-family:Arial, sans-serif; font-size:16px; 
                        line-height:1.7; color:#6b7280;">
                Klicke auf den folgenden Button, um ein neues Passwort zu vergeben.
                Aus Sicherheitsgründen ist dieser Link nur für eine begrenzte Zeit gültig.
              </p>

              <!-- CTA Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f9fafb; border-radius:12px;">
                <tr>
                  <td style="padding:20px;" align="center">
                    <p style="margin:0 0 12px 0; font-family:Arial, sans-serif; font-size:16px; color:#374151;">
                      Passwort jetzt zurücksetzen:
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#B9D8A5" align="center" style="border-radius:999px; text-align:center;">
                          <a href="{{ $url }}" style="display:inline-block; padding:12px 32px; font-family:Arial, sans-serif; 
                                    font-size:14px; font-weight:bold; text-decoration:none; 
                                    color:#111827;">
                            Neues Passwort vergeben
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Sicherheitshinweis -->
              <p style="margin:24px 0 0 0; font-family:Arial, sans-serif; font-size:14px; 
                        line-height:1.7; color:#9ca3af;">
                Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.
                Dein bisheriges Passwort bleibt in diesem Fall unverändert. Bei Fragen wende dich bitte an deinen
                Company Admin.
              </p>

            </td>
          </tr>

          <!-- Footer: Impressum & Datenschutz -->
          <tr>
            <td style="background-color:#f9fafb; padding:16px 24px 18px 24px; text-align:center;">
              <p style="margin:0; font-family:Arial, sans-serif; font-size:11px; line-height:1.6; color:#9ca3af;">
                <a href="https://ppskarten.de/impressum-pps-gmbh-bergen-plastikkarten-andreas-maier/"
                  style="color:#9ca3af; text-decoration:underline;">
                  Impressum
                </a>
                &nbsp;&middot;&nbsp;
                <a href="https://ppskarten.de/datenschutzerklaerung/" style="color:#9ca3af; text-decoration:underline;">
                  Datenschutz
                </a>
              </p>
            </td>
          </tr>

        </table>
        <!-- Ende Hauptkarte -->

      </td>
    </tr>
  </table>
</body>

</html>