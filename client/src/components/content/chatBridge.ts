/** Navigate to chat with a pre-filled message for Yulia */
export function bridgeToYulia(message: string) {
  window.location.href = '/chat?message=' + encodeURIComponent(message);
}

/** Navigate to chat without a pre-filled message */
export function goToChat() {
  window.location.href = '/chat';
}
