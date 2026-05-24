<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALS Communicator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #121212; color: #e2e8f0; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 16px; background: #334155; outline: none; border-radius: 8px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 32px; height: 32px; border-radius: 50%; background: #22c55e; cursor: pointer; }
        @keyframes pulse-border { 0% { border-color: #3b82f6; } 50% { border-color: #93c5fd; } 100% { border-color: #3b82f6; } }
        .edit-mode-btn { border: 3px dashed #3b82f6; animation: pulse-border 2s infinite; }
        .suggestion-btn { background: #166534; border: 2px solid #22c55e; font-size: 1.05rem; white-space: normal; word-break: break-word; display: flex; align-items: center; justify-content: center; padding: 0.75rem; border-radius: 0.75rem; color: #f8fafc; font-weight: 700; min-height: 64px; }
        .msg { padding: 0.5rem 0.75rem; border-radius: 1rem; margin-bottom: 0.5rem; max-width: 90%; word-wrap: break-word; }
        .msg-other { background: #334155; align-self: flex-start; }
        .msg-you { background: #166534; align-self: flex-end; color: #f0fdf4; }
        .live-text { animation: pulse-text 1.5s infinite; }
        @keyframes pulse-text { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    </style>
</head>
<body class="flex flex-col h-[100dvh] overflow-hidden bg-[#121212] text-slate-200">

    <!-- HEADER -->
    <header class="flex justify-between items-center bg-gray-900 p-4 border-b border-gray-800">
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">🗣️ ALS Communicator</h1>
        <button id="openSettingsBtn" class="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg font-bold flex items-center gap-2">⚙️ Settings</button>
    </header>

    <main class="flex-grow flex flex-col md:flex-row gap-4 p-4 min-h-0 overflow-hidden">
        <!-- LEFT PANEL -->
        <div class="w-full md:w-1/2 flex flex-col gap-3">
            <textarea id="textInput" class="w-full bg-slate-800 border-2 border-slate-600 rounded-2xl p-4 text-2xl focus:border-green-500 outline-none resize-none h-32 shadow-inner" placeholder="Type here..."></textarea>
            <div id="predictiveBar" class="hidden h-12 bg-slate-900 rounded-xl border border-slate-700 flex items-center px-3 gap-2 overflow-x-auto hide-scrollbar"></div>

            <div class="grid grid-cols-5 gap-2">
                <button id="genBtn" class="bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl py-4 flex flex-col items-center shadow-md"><span class="text-3xl mb-1">🔊</span><span class="text-sm">Speak</span></button>
                <button id="listenBtn" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl py-4 flex flex-col items-center shadow-md"><span class="text-3xl mb-1">🎤</span><span class="text-sm">Mic OFF</span></button>
                <button id="grokSuggestBtn" class="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl py-4 flex flex-col items-center shadow-md"><span class="text-3xl mb-1">🤖</span><span class="text-sm">AI Reply</span></button>
                <button id="replayBtn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-4 flex flex-col items-center shadow-md"><span class="text-3xl mb-1">🔄</span><span class="text-sm">Replay</span></button>
                <button id="clearBtn" class="bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl py-4 flex flex-col items-center shadow-md"><span class="text-3xl mb-1">❌</span><span class="text-sm">Clear</span></button>
            </div>

            <div class="bg-slate-900 rounded-xl border border-slate-700 relative h-14 flex items-center px-4">
                <canvas id="waveformCanvas" class="absolute inset-0 hidden"></canvas>
                <div id="liveTranscript" class="z-10 text-indigo-300 font-bold live-text hidden">Listening...</div>
            </div>

            <div class="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex-1 overflow-hidden flex flex-col">
                <div id="suggestStatus" class="text-xs uppercase tracking-widest text-slate-400 mb-2">AI Suggestions</div>
                <div id="grokSuggestions" class="grid grid-cols-2 gap-3 overflow-y-auto flex-1"></div>
            </div>
        </div>

        <!-- RIGHT PANEL - PHRASES -->
        <div class="w-full md:w-1/2 flex flex-col bg-slate-800 rounded-2xl border border-slate-700">
            <div class="flex gap-2 p-3 border-b border-slate-700 overflow-x-auto hide-scrollbar" id="categoryScroll"></div>
            <div class="px-4 py-3 flex justify-between items-center border-b border-slate-700">
                <h2 id="currentCategoryTitle" class="text-xl font-bold">Basics</h2>
                <button id="editToggleBtn" class="px-5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold">✏️ Edit</button>
            </div>
            <div id="phraseGrid" class="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3"></div>
        </div>
    </main>

    <!-- Conversation Log -->
    <div class="bg-slate-900 border-t border-slate-700 p-3 md:p-4" style="max-height: 22vh;">
        <div class="flex justify-between text-xs uppercase tracking-wider text-slate-400 mb-2">
            <span>Conversation Log</span>
        </div>
        <div id="conversationHistory" class="h-40 overflow-y-auto flex flex-col gap-2 text-sm"></div>
    </div>

    <!-- SETTINGS MODAL (kept minimal but functional) -->
    <div id="settingsModal" class="fixed inset-0 bg-black/80 hidden flex items-center justify-center z-50">
        <div class="bg-[#1e293b] w-full max-w-lg rounded-3xl p-8">
            <h3 class="text-2xl font-bold mb-6">Settings</h3>
            <button id="closeSettingsBtn" class="absolute top-4 right-4 text-3xl">×</button>
            <!-- Add your full settings content here if needed -->
            <div class="text-center text-slate-400 mt-8">Backend configured on Vercel</div>
        </div>
    </div>

<script>
// ====================== CONFIG ======================
const API_TOKEN = '/api/token';
const API_GROK = '/api/grok';
const API_DEEPSEEK = '/api/deepseek';

// ====================== STATE ======================
let phraseCategories = JSON.parse(localStorage.getItem('alsPhrases')) || {
    "Basics": ["Yes.", "No.", "Please.", "Thank you.", "I don't know.", "Maybe.", "Can you repeat that?", "Give me a minute."],
    "Needs": ["I am hungry.", "I am thirsty.", "Bathroom, please.", "I need help."],
    // ... add all your categories here
};

let currentCategory = "Basics";
let conversationHistory = JSON.parse(localStorage.getItem('alsConversation')) || [];
let lastSpoken = "";
let isEditMode = false;
let assemblyWS = null;
let isAssemblyListening = false;

// ====================== UTILITIES ======================
const $ = id => document.getElementById(id);

// ====================== ASSEMBLYAI INTEGRATION ======================
async function getAssemblyToken() {
    try {
        const res = await fetch(API_TOKEN);
        if (!res.ok) throw new Error('Token fetch failed');
        const data = await res.json();
        return data.token;
    } catch (e) {
        console.error("Token error:", e);
        alert("Failed to connect to speech service. Check Vercel backend.");
        return null;
    }
}

async function startAssemblyAI() {
    if (isAssemblyListening) return stopAssemblyAI();

    const token = await getAssemblyToken();
    if (!token) return;

    const wsUrl = `wss://streaming.assemblyai.com/v3/ws?token=${token}&speech_model=universal-streaming-english&sample_rate=16000&encoding=pcm_s16le&speaker_labels=true`;

    assemblyWS = new WebSocket(wsUrl);

    assemblyWS.onopen = () => {
        isAssemblyListening = true;
        updateMicUI(true);
        console.log("✅ AssemblyAI Connected");
    };

    assemblyWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "Turn" && data.transcript) {
            const speaker = data.speaker_label ? `Speaker ${data.speaker_label}` : "Partner";
            const text = data.transcript.trim();

            if (data.end_of_turn) {
                addToConversation('other', `(${speaker}) ${text}`);
                $('liveTranscript').classList.add('hidden');
            } else {
                $('liveTranscript').textContent = `🗣️ ${speaker}: ${text}`;
                $('liveTranscript').classList.remove('hidden');
            }
        }
    };

    assemblyWS.onerror = () => stopAssemblyAI();
    assemblyWS.onclose = () => stopAssemblyAI();

    // Get microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
            channelCount: 1, 
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true 
        } 
    });

    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
        if (!assemblyWS || assemblyWS.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            pcm[i] = Math.max(-32768, Math.min(32767, input[i] * 32767));
        }
        assemblyWS.send(pcm.buffer);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
}

function stopAssemblyAI() {
    if (assemblyWS) {
        assemblyWS.close();
        assemblyWS = null;
    }
    isAssemblyListening = false;
    updateMicUI(false);
}

function updateMicUI(listening) {
    const btn = $('listenBtn');
    if (listening) {
        btn.classList.replace('bg-indigo-600', 'bg-red-600');
        btn.innerHTML = `<span class="text-3xl mb-1">🔴</span><span class="text-sm">Mic ON</span>`;
    } else {
        btn.classList.replace('bg-red-600', 'bg-indigo-600');
        btn.innerHTML = `<span class="text-3xl mb-1">🎤</span><span class="text-sm">Mic OFF</span>`;
    }
}

// ====================== AI REPLIES ======================
async function generateGrokSuggestions() {
    const status = $('suggestStatus');
    status.textContent = "Generating...";

    try {
        const context = conversationHistory.slice(-6).map(m => `${m.speaker}: ${m.text}`).join('\n');
        
        const res = await fetch(API_GROK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: "user", content: `Generate 5 natural short replies for ALS patient conversation:\n${context}` }]
            })
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        const suggestions = data.choices?.[0]?.message?.content.split('\n').filter(s => s.trim().length > 3) || [];

        renderSuggestions(suggestions.slice(0, 6));
    } catch (e) {
        console.error(e);
        renderSuggestions(["How are you feeling?", "Do you need help?", "I love you.", "Can I get you water?", "Anything else?"]);
    }
}

function renderSuggestions(suggestions) {
    const container = $('grokSuggestions');
    container.innerHTML = '';
    suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = s.trim();
        btn.onclick = () => {
            const text = s.trim();
            speak(text);
            addToConversation('you', text);
        };
        container.appendChild(btn);
    });
    $('suggestStatus').textContent = 'AI Suggestions';
}

// ====================== TTS & CORE ======================
function speak(text) {
    if (!text) return;
    lastSpoken = text;
    addToConversation('you', text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.93;
    utterance.pitch = 1.05;
    speechSynthesis.speak(utterance);
}

function addToConversation(speaker, text) {
    conversationHistory.push({ speaker, text });
    localStorage.setItem('alsConversation', JSON.stringify(conversationHistory));
    renderHistory();
}

function renderHistory() {
    const el = $('conversationHistory');
    el.innerHTML = '';
    conversationHistory.slice(-12).forEach(m => {
        const div = document.createElement('div');
        div.className = `msg ${m.speaker === 'you' ? 'msg-you' : 'msg-other'}`;
        div.textContent = m.text;
        el.appendChild(div);
    });
    el.scrollTop = el.scrollHeight;
}

// ====================== EVENT LISTENERS ======================
$('listenBtn').onclick = () => {
    if (isAssemblyListening) stopAssemblyAI();
    else startAssemblyAI();
};

$('grokSuggestBtn').onclick = generateGrokSuggestions;
$('genBtn').onclick = () => {
    const text = $('textInput').value.trim();
    if (text) speak(text);
    $('textInput').value = '';
};

$('replayBtn').onclick = () => { if (lastSpoken) speak(lastSpoken); };
$('clearBtn').onclick = () => $('textInput').value = '';

// Init
renderHistory();
generateGrokSuggestions(); // initial suggestions
console.log("✅ ALS Communicator - AssemblyAI + Vercel Ready");
</script>
</body>
</html>
