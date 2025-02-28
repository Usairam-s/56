import React, { useState, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { Mic, Volume2, Clock, TrendingUp, BarChart } from 'lucide-react';

export const PracticeMode: React.FC = () => {
  const { text, isRecording, toggleRecording, addPracticeSession } = useTeleprompterStore();
  const [volume, setVolume] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let timer: number;
    if (isRecording) {
      setStartTime(Date.now());
      timer = window.setInterval(() => {
        setDuration((Date.now() - (startTime || Date.now())) / 1000);
      }, 100);
    } else {
      setStartTime(null);
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording, startTime]);

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let dataArray: Uint8Array;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(average);
          requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    if (isRecording) {
      setupAudio();
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isRecording]);

  const handleStopRecording = () => {
    if (isRecording && startTime) {
      const session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: Math.round(duration),
        wordsPerMinute: calculateWPM(text, duration),
        accuracy: calculateAccuracy(),
      };
      addPracticeSession(session);
    }
    toggleRecording();
  };

  const calculateWPM = (text: string, duration: number): number => {
    const words = text.trim().split(/\s+/).length;
    const minutes = duration / 60;
    return Math.round(words / minutes);
  };

  const calculateAccuracy = (): number => {
    // Placeholder for speech recognition accuracy
    return Math.round(Math.random() * 20 + 80);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Practice Mode
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-200">Duration</span>
          </div>
          <span className="font-mono text-lg text-indigo-600 dark:text-indigo-400">
            {duration.toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-200">Volume</span>
          </div>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-100"
              style={{ width: `${(volume / 255) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleStopRecording}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Practice'}
        </button>

        {isRecording && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Recording in progress... Speak clearly and maintain a consistent pace.
          </div>
        )}
      </div>
    </div>
  );
};