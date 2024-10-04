"use client";
import React, { useState, useRef, useEffect } from "react";
import { uploadAudio } from "../app/Api/uploadAudio"; // Import the API helper

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [devices, setDevices] = useState([]); // Store available audio devices
  const [selectedDeviceId, setSelectedDeviceId] = useState(""); // Selected audio device
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    // Fetch available audio devices on component mount
    const getAudioDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = deviceInfos.filter(
          (device) => device.kind === "audioinput"
        );
        setDevices(audioInputDevices);
        // Select the first device by default
        if (audioInputDevices.length > 0) {
          setSelectedDeviceId(audioInputDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error fetching audio devices: ", err);
      }
    };

    getAudioDevices();
  }, []);

  // Handle microphone permission and start recording
  const handleMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
        audioChunks.current = [];
      };

      startRecording();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err.name === "NotAllowedError") {
        alert(
          "Microphone access was denied. Please allow microphone access in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        alert(
          "No microphone was found. Please ensure you have an audio input device connected."
        );
      } else {
        alert(
          "An error occurred while accessing your microphone. Please try again."
        );
      }
    }
  };

  const startRecording = () => {
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    mediaRecorderRef.current.pause();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    mediaRecorderRef.current.resume();
    setIsPaused(false);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleUpload = async () => {
    try {
      const result = await uploadAudio(audioBlob);
      console.log("Audio uploaded successfully:", result);
    } catch (err) {
      console.error("Error uploading audio:", err);
    }
  };

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(event.target.value); // Update the selected audio device
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-50">
      {/* Dropdown for selecting audio device */}
      <div className="mb-4">
        <label htmlFor="audioDevice" className="mr-2">
          Select Audio Input Device:
        </label>
        <select
          id="audioDevice"
          value={selectedDeviceId}
          onChange={handleDeviceChange}
          className="px-4 py-2 mb-4 text-black bg-white border rounded"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {!isRecording && (
        <button
          onClick={handleMicPermission}
          className="px-4 py-2 mb-4 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
        >
          Start Recording
        </button>
      )}
      {isRecording && !isPaused && (
        <button
          onClick={pauseRecording}
          className="px-4 py-2 mb-4 text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none"
        >
          Pause Recording
        </button>
      )}
      {isPaused && (
        <button
          onClick={resumeRecording}
          className="px-4 py-2 mb-4 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
        >
          Resume Recording
        </button>
      )}
      {isRecording && (
        <button
          onClick={stopRecording}
          className="px-4 py-2 mb-4 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
        >
          Stop Recording
        </button>
      )}
      {audioURL && <audio className="mb-4" controls src={audioURL}></audio>}
      {audioBlob && (
        <button
          onClick={handleUpload}
          className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600 focus:outline-none"
        >
          Upload Audio
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
