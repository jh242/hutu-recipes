import React, { useState, useRef, useEffect } from "react";

export const Recorder = (props: { onRecordingComplete: (blob: Blob) => any }) => {
  const chunks = useRef<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.onstart = () => {
        chunks.current = [];
        setIsRecording(true);
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      recorder.ondataavailable = async (e) => {
        chunks.current.push(e.data);
      };
      setMediaRecorder(recorder);
    };

    init();
  }, []);

  const handleStartRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.start(1000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }

    const blob = new Blob(chunks.current, {
      type: "audio/wav",
    });
    props.onRecordingComplete(blob);
  };

  return (
    <div>
      <button onClick={handleStartRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={handleStopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
    </div>
  );
};

export default Recorder;
