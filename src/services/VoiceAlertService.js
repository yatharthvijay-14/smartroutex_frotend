// SmartRouteX Web Speech API AI Voice Co-Pilot Engine
export function speakVoiceAlert(text) {
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Pick female or crisp English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira"))
    ) || voices.find(v => v.lang.startsWith("en"));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech Synthesis warning:", err.message);
  }
}
