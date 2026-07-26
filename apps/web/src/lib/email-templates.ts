export function confirmacionTemplate(props: {
  pacienteNombre: string;
  fecha: string;
  hora: string;
  empresaNombre: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <table style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">¡Cita Confirmada!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px;">
        <p style="font-size: 16px;">Hola <strong>${props.pacienteNombre}</strong>,</p>
        <p style="font-size: 15px;">Tu cita en <strong>${props.empresaNombre}</strong> ha sido agendada exitosamente.</p>
        <table style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <tr><td style="padding: 4px 0; color: #64748b;">Fecha:</td><td style="padding: 4px 0; font-weight: bold;">${props.fecha}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Hora:</td><td style="padding: 4px 0; font-weight: bold;">${props.hora}</td></tr>
        </table>
        <p style="font-size: 14px; color: #64748b;">Te recordamos asistir 10 minutos antes de tu hora agendada.</p>
      </td>
    </tr>
    <tr>
      <td style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} ${props.empresaNombre}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function recordatorioTemplate(props: {
  pacienteNombre: string;
  fecha: string;
  hora: string;
  empresaNombre: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
  <table style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: #f59e0b; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">📅 Recordatorio de Cita</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px;">
        <p style="font-size: 16px;">Hola <strong>${props.pacienteNombre}</strong>,</p>
        <p style="font-size: 15px;">Te recordamos que tienes una cita en aproximadamente <strong>2 horas</strong>.</p>
        <table style="background: #fefce8; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <tr><td style="padding: 4px 0; color: #64748b;">Fecha:</td><td style="padding: 4px 0; font-weight: bold;">${props.fecha}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Hora:</td><td style="padding: 4px 0; font-weight: bold;">${props.hora}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Lugar:</td><td style="padding: 4px 0; font-weight: bold;">${props.empresaNombre}</td></tr>
        </table>
        <p style="font-size: 14px; color: #64748b;">Por favor, llega 10 minutos antes. Si no puedes asistir, contáctanos para reagendar.</p>
      </td>
    </tr>
    <tr>
      <td style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} ${props.empresaNombre}
      </td>
    </tr>
  </table>
</body>
</html>`;
}
