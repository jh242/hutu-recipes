export const playAudio = async (context: AudioContext, data: ArrayBuffer) => {
  // Use the Web Audio API to play the ArrayBuffer directly
  const buffer = await context.decodeAudioData(data);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
};
