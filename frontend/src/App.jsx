import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000"
    : "/api");
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

function normalizeVoiceCommand(text) {
  const cleaned = text.trim().toLowerCase();

  // Speech recognition often changes these phrases slightly.
  const replacements = {
    "what time is this": "what time is it",
    "what's the time": "what time is it",
    "tell joke": "tell me a joke",
    "open the google": "open google",
    "what's your name": "what is your name",
    "who created you": "who made you",
    "what's my name": "what is my name",
    "today's date": "what date is today",
  };

  return replacements[cleaned] || cleaned;
}

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("jarvis-chat-history");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Could not read chat history:", error);
      }
    }

    return [{ role: "assistant", text: "Systems online. Welcome Sir." }];
  });

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [systemTime, setSystemTime] = useState("--:--");
  const [systemDate, setSystemDate] = useState("Loading date...");
  const [emotion, setEmotion] = useState("Neutral");
  const [cameraStatus, setCameraStatus] = useState("Initializing camera...");
  const [voiceStatus, setVoiceStatus] = useState("Click Enable Jarvis Mode once");
  const [heardText, setHeardText] = useState("Nothing heard yet");
  const [speakerStatus, setSpeakerStatus] = useState("Click Test Speaker");
  const [voiceCount, setVoiceCount] = useState(0);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    localStorage.setItem("jarvis-chat-history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchSavedName();
    fetchTime();
    fetchEmotion();

    const timeInterval = setInterval(fetchTime, 1000);
    const emotionInterval = setInterval(fetchEmotion, 4000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(emotionInterval);
    };
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSpeakerStatus("Speech synthesis is not supported in this browser");
      return undefined;
    }

    function updateVoices() {
      const voices = window.speechSynthesis.getVoices();
      setVoiceCount(voices.length);

      if (voices.length > 0) {
        setSpeakerStatus(`Speaker ready with ${voices.length} voices`);
      } else {
        setSpeakerStatus("Loading system voices...");
      }
    }

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) {
      setVoiceStatus("Wake word voice mode is not supported in this browser");
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Listening for Jarvis...");
    };

    recognition.onend = () => {
      setIsListening(false);

      if (shouldKeepListeningRef.current) {
        window.setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error("Voice restart failed:", error);
            setVoiceStatus("Voice restart failed. Click Enable Jarvis Mode again");
            setIsVoiceEnabled(false);
            shouldKeepListeningRef.current = false;
          }
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceStatus("Microphone blocked. Allow mic access and click Enable Jarvis Mode");
        setIsVoiceEnabled(false);
        shouldKeepListeningRef.current = false;
        return;
      }

      if (event.error === "audio-capture") {
        setVoiceStatus("No microphone detected");
        setIsVoiceEnabled(false);
        shouldKeepListeningRef.current = false;
        return;
      }

      if (event.error === "no-speech") {
        setVoiceStatus("Listening for Jarvis...");
        return;
      }

      if (event.error === "network") {
        setVoiceStatus("Speech service unavailable in this browser. Open this page in Google Chrome");
        setHeardText("No speech received because browser voice service failed");
        setIsVoiceEnabled(false);
        shouldKeepListeningRef.current = false;
        return;
      }

      setVoiceStatus(`Voice error: ${event.error}`);
    };

    recognition.onresult = (event) => {
      let liveTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0].transcript.trim();

        if (!result.isFinal) {
          liveTranscript += ` ${transcript}`;
          continue;
        }

        const spokenText = transcript;
        const lowered = spokenText.toLowerCase();

        setHeardText(spokenText || "No clear speech detected");

        // If Jarvis is spoken, remove it. If not, still allow the command because
        // browser speech recognition often misses the wake word.
        const commandWithoutWakeWord = spokenText.replace(/\bjarvis\b[\s,:-]*/i, "").trim();
        const command = normalizeVoiceCommand(commandWithoutWakeWord || spokenText);

        if (!command) {
          setMessages((current) => [
            ...current,
            { role: "assistant", text: "Yes Sir. Awaiting your command." },
          ]);
          speakText("Yes Sir. Awaiting your command.");
          setVoiceStatus("Wake word detected. Say your command");
          continue;
        }

        setInput(command);
        if (lowered.includes("jarvis")) {
          setVoiceStatus(`Wake word detected: ${command}`);
        } else {
          setVoiceStatus(`Voice command detected: ${command}`);
        }
        handleSendMessage(command);
      }

      if (liveTranscript.trim()) {
        setHeardText(liveTranscript.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldKeepListeningRef.current = false;
      recognition.stop();
    };
  }, []);

  async function enableJarvisMode() {
    if (!SpeechRecognition || !recognitionRef.current) {
      setVoiceStatus("Wake word voice mode is not supported in this browser");
      return;
    }

    try {
      // Ask for mic access once. After permission, we stop the raw stream because
      // speech recognition itself will keep using the microphone.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Microphone permission failed:", error);
      setVoiceStatus("Microphone permission denied");
      return;
    }

    try {
      shouldKeepListeningRef.current = true;
      setIsVoiceEnabled(true);
      setVoiceStatus("Starting Jarvis Mode...");
      setHeardText("Waiting for your voice...");
      recognitionRef.current.start();
    } catch (error) {
      console.error("Voice start failed:", error);
      setVoiceStatus("Could not start voice mode. Try clicking again");
      setIsVoiceEnabled(false);
      shouldKeepListeningRef.current = false;
    }
  }

  function disableJarvisMode() {
    shouldKeepListeningRef.current = false;
    setIsVoiceEnabled(false);
    setIsListening(false);
    setVoiceStatus("Jarvis Mode paused");

    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.error("Voice stop failed:", error);
    }
  }

  async function fetchSavedName() {
    try {
      const response = await fetch(`${API_BASE_URL}/get-name`);
      const data = await response.json();
      setSavedName(data.name || "");
    } catch (error) {
      console.error("Could not fetch saved name:", error);
    }
  }

  async function fetchTime() {
    try {
      const response = await fetch(`${API_BASE_URL}/time`);
      const data = await response.json();
      setSystemTime(data.time || "--:--");
      setSystemDate(data.date || "Date unavailable");
    } catch (error) {
      console.error("Could not fetch time:", error);
    }
  }

  async function fetchEmotion() {
    try {
      const response = await fetch(`${API_BASE_URL}/emotion`);
      const data = await response.json();
      setEmotion(data.emotion || "Neutral");
    } catch (error) {
      console.error("Could not fetch emotion:", error);
    }
  }

  async function startCamera() {
    const oldStream = videoRef.current?.srcObject;
    if (oldStream) {
      oldStream.getTracks().forEach((track) => track.stop());
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("Camera API is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStatus("Camera online");
      }
    } catch (error) {
      console.error("Camera access failed:", error);

      if (error.name === "NotAllowedError") {
        setCameraStatus("Camera blocked. Click the camera icon in Chrome and allow access");
        return;
      }

      if (error.name === "NotFoundError") {
        setCameraStatus("No camera device found");
        return;
      }

      if (error.name === "NotReadableError") {
        setCameraStatus("Camera is busy in another app");
        return;
      }

      setCameraStatus("Camera unavailable");
    }
  }

  function speakText(text) {
    const synth = window.speechSynthesis;
    if (!synth) {
      setSpeakerStatus("Speech synthesis is not supported");
      return;
    }

    synth.cancel();

    // Chrome sometimes pauses speech until resume is called after user interaction.
    synth.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const englishVoice =
      voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) || voices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      setSpeakerStatus("Speaking response...");
    };
    utterance.onend = () => {
      setSpeakerStatus("Speaker finished response");
    };
    utterance.onerror = () => {
      setSpeakerStatus("Speaker error. Check Chrome sound permission and system volume");
    };
    synth.speak(utterance);
  }

  function testSpeaker() {
    setSpeakerStatus("Testing speaker...");
    speakText("Systems online. Speaker test complete.");
  }

  async function handleSendMessage(messageFromVoice = "") {
    const finalMessage = (messageFromVoice || input).trim();

    if (!finalMessage) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: finalMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalMessage }),
      });

      const data = await response.json();

      setTimeout(async () => {
        setMessages((current) => [
          ...current,
          { role: "assistant", text: data.reply || "No response available." },
        ]);

        setIsTyping(false);
        speakText(data.reply || "");
        await fetchSavedName();

        if (data.action === "open_google") {
          window.open("https://www.google.com", "_blank");
        }
      }, 700);
    } catch (error) {
      console.error("Chat request failed:", error);
      setIsTyping(false);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "Connection to control server failed." },
      ]);
    }
  }

  function clearChat() {
    const defaultMessage = { role: "assistant", text: "Systems online. Welcome Sir." };
    setMessages([defaultMessage]);
    localStorage.setItem("jarvis-chat-history", JSON.stringify([defaultMessage]));
  }

  const statusText = useMemo(() => {
    if (savedName) {
      return `User identified: ${savedName}`;
    }
    return "User identity not stored";
  }, [savedName]);

  return (
    <div className="app-shell">
      <div className="background-grid" />
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <main className="dashboard">
        <header className="top-bar glass-panel">
          <div>
            <p className="eyebrow">FUTURISTIC COLLEGE DEMO</p>
            <h1>Nova JARVIS Assistant</h1>
            <p className="subtitle">
              Dark AI dashboard with simple Flask logic underneath
            </p>
          </div>

          <div className="system-meta">
            <div className="meta-box">
              <span className="meta-label">Time</span>
              <strong>{systemTime}</strong>
            </div>
            <div className="meta-box">
              <span className="meta-label">Status</span>
              <strong>ONLINE</strong>
            </div>
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="left-column">
            <div className="glass-panel orb-panel">
              <div className="orb-wrapper">
                <div className="radar-ring ring-one" />
                <div className="radar-ring ring-two" />
                <div className="radar-ring ring-three" />
                <div className="ai-orb">
                  <div className="orb-core" />
                </div>
              </div>

              <div className="orb-info">
                <span className="panel-label">CORE SYSTEM</span>
                <h2>Neural Interface</h2>
                <p>Voice, chat, and camera modules synchronized.</p>
              </div>
            </div>

            <div className="glass-panel status-panel">
              <div className="panel-heading">
                <span className="panel-label">EMOTION STATUS</span>
                <h2>Live Analysis</h2>
              </div>

              <div className="status-cards">
                <div className="status-card">
                  <span className="status-title">Emotion</span>
                  <strong>{emotion}</strong>
                </div>
                <div className="status-card">
                  <span className="status-title">Memory</span>
                  <strong>{statusText}</strong>
                </div>
                <div className="status-card">
                  <span className="status-title">Date</span>
                  <strong>{systemDate}</strong>
                </div>
                <div className="status-card">
                  <span className="status-title">Voice Mode</span>
                  <strong>{voiceStatus}</strong>
                </div>
                <div className="status-card">
                  <span className="status-title">Heard Speech</span>
                  <strong>{heardText}</strong>
                </div>
                <div className="status-card">
                  <span className="status-title">Speaker</span>
                  <strong>{speakerStatus}</strong>
                </div>
                <div className="status-card">
                  <span className="status-title">Voices Loaded</span>
                  <strong>{voiceCount}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="center-column glass-panel chat-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">CHAT WINDOW</span>
                <h2>Conversation Console</h2>
              </div>
              <button className="ghost-button" onClick={clearChat}>
                Clear Chat
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message-bubble ${message.role}`}
                >
                  <span className="message-role">
                    {message.role === "assistant" ? "AI" : "YOU"}
                  </span>
                  <p>{message.text}</p>
                </div>
              ))}

              {isTyping && (
                <div className="message-bubble assistant typing-bubble">
                  <span className="message-role">AI</span>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chat-controls">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask something like: what time is it"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />

              <div className="button-row">
                <button className="primary-button" onClick={() => handleSendMessage()}>
                  Send
                </button>
                {isVoiceEnabled ? (
                  <button
                    className={`voice-pill voice-toggle ${isListening ? "listening" : ""}`}
                    onClick={disableJarvisMode}
                  >
                    {isListening ? "Jarvis Mode Active" : "Jarvis Mode Starting"}
                  </button>
                ) : (
                  <button className="voice-pill voice-toggle" onClick={enableJarvisMode}>
                    Enable Jarvis Mode
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="glass-panel camera-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">CAMERA FEED</span>
                  <h2>Visual Input</h2>
                </div>
              </div>

              <div className="camera-frame">
                <video ref={videoRef} autoPlay playsInline muted />
                <div className="camera-overlay">
                  <span className="scan-line" />
                </div>
              </div>

              <p className="camera-status">{cameraStatus}</p>
              <div className="camera-actions">
                <button className="ghost-button" onClick={startCamera}>
                  Retry Camera
                </button>
                <button className="ghost-button" onClick={testSpeaker}>
                  Test Speaker
                </button>
              </div>
            </div>

            <div className="glass-panel quick-panel">
              <span className="panel-label">QUICK COMMANDS</span>
              <div className="command-list">
                <button onClick={() => handleSendMessage("hello")}>hello</button>
                <button onClick={() => handleSendMessage("what time is it")}>
                  what time is it
                </button>
                <button onClick={() => handleSendMessage("tell me a joke")}>
                  tell me a joke
                </button>
                <button onClick={() => handleSendMessage("open google")}>
                  open google
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
