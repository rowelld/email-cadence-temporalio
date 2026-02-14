export async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  console.log(`Mock sending email to ${to}: Subject "${subject}", Body "${body}"`);
  return {
    success: true,
    messageId: 'm-' + Date.now(),
    timestamp: Date.now(),
  };
}