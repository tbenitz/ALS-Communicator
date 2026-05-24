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
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 16px; background: #334155; outline: none; border-radius: 8px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 32px; height: 32px; border-radius: 50%; background: #22c55e; cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.5); }

        @keyframes pulse-border { 0% { border-color: #3b82f6; } 50% { border-color: #93c5fd; } 100% { border-color: #3b82f6; } }
        .edit-mode-btn { border: 3px dashed #3b82f6; animation: pulse-border 2s infinite; }

        .suggestion-btn { background: #166534; border: 2px solid #22c55e; font-size: 1.05rem; white-space: normal; word-break: break-word; overflow-wrap: break-word; hyphens: auto; display: flex; align-items: center; justify-content: center; padding: 0.75rem; transition: all 0.2s; border-radius: 0.75rem; color: #f8fafc; font-weight: 700; box-shadow: 0 4px 6px rgba(0,0,0,0.3); min-height: 64px; text-align: center; }
        .suggestion-btn:hover { background: #15803d; transform: scale(1.01); }

        .msg { padding: 0.5rem 0.75rem; border-radius: 1rem; margin-bottom: 0.5rem; max-width: 90%; position: relative; word-wrap: break-word; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .msg-other { background: #334155; align-self: flex-start; color: #f8fafc; border-bottom-left-radius: 0.25rem; }
        .msg-you { background: #166534; align-self: flex-end; color: #f0fdf4; border-bottom-right-radius: 0.25rem; }
        .save-phrase-btn { font-size: 0.7rem; background: #0f172a; color: #cbd5e1; padding: 4px 8px; border-radius: 8px; margin-top: 6px; display: inline-block; cursor: pointer; border: 1px solid #475569; transition: background 0.2s; }
        .save-phrase-btn:hover { background: #1e293b; color: #fff; border-color: #94a3b8; }

        .modal-overlay { backdrop-filter: blur(5px); }
        .modal-content { background: #1e293b; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75); }
        @keyframes pulse-text { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        .live-text { animation: pulse-text 1.5s infinite; }

        canvas { image-rendering: pixelated; }

        #conversationHistory, #conversationHistoryMobile {
            overflow-y: auto !important;
            scrollbar-width: thin;
            scrollbar-color: #64748b #1e293b;
        }

        @media (max-width: 767px) {
            .main-area { flex-direction: column; }
            .conv-log-mobile {
                margin-top: 8px;
                border-top: 1px solid #334155;
                padding: 8px 0;
                max-height: 180px;
            }
        }
    </style>
</head>
<body class="flex flex-col h-[100dvh] overflow-hidden bg-[#121212] text-slate-200">

    <header class="flex justify-between items-center bg-gray-900 p-2 md:p-4 border-b border-gray-800 shrink-0 z-20 shadow-md">
        <h1 class="text-lg md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">🗣️ <span class="inline">ALS Communicator</span></h1>
        <button id="openSettingsBtn" class="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm text-sm md:text-base">
            ⚙️ <span class="hidden sm:inline">Settings</span>
        </button>
    </header>

    <main class="flex-grow flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 min-h-0 overflow-hidden main-area">

        <div class="w-full md:w-1/2 flex flex-col gap-2 shrink-0 md:shrink md:h-full min-h-0">
            <div class="relative shrink-0 flex flex-col gap-1">
                <textarea id="textInput" class="w-full bg-slate-800 text-white border-2 border-slate-600 rounded-xl p-2 md:p-4 text-xl md:text-3xl focus:border-green-500 outline-none resize-none h-16 md:h-36 shadow-inner transition-colors" placeholder="Type here..."></textarea>
                <div id="predictiveBar" class="h-10 md:h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center px-2 gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap hidden shadow-sm text-sm md:text-base"></div>
            </div>
     
            <div class="shrink-0 grid grid-cols-5 gap-1 md:gap-2">
                <button id="genBtn" class="col-span-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-md transition-all flex flex-col items-center justify-center py-2 md:py-3 disabled:opacity-50 text-xs md:text-lg">
                    <span id="btnText" class="flex flex-col items-center"><span class="text-lg md:text-2xl mb-0.5">🔊</span>Speak</span>
                </button>
                <button id="listenBtn" class="col-span-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md py-2 transition-all flex flex-col items-center justify-center text-center text-xs md:text-lg">
                    <span class="text-lg md:text-2xl mb-0.5">🎤</span>Mic OFF
                </button>
                <button id="grokSuggestBtn" class="col-span-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md py-2 transition-all flex flex-col items-center justify-center text-center text-xs md:text-lg">
                    <span class="text-lg md:text-2xl mb-0.5">🤖</span>AI Reply
                </button>
                <button id="replayBtn" class="col-span-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md py-2 transition-all flex flex-col items-center justify-center text-center text-xs md:text-lg">
                    <span class="text-lg md:text-2xl mb-0.5">🔄</span>Replay
                </button>
                <button id="clearBtn" class="col-span-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md py-2 transition-all flex flex-col items-center justify-center text-center text-xs md:text-lg">
                    <span class="text-lg md:text-2xl mb-0.5">❌</span>Clear
                </button>
            </div>

            <div class="shrink-0 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative h-8 md:h-12">
                <canvas id="waveformCanvas" class="absolute inset-0 w-full h-full hidden opacity-80"></canvas>
                <div id="liveTranscript" class="z-10 absolute inset-0 flex items-center px-2 md:px-3 text-indigo-300 italic text-xs md:text-sm font-bold live-text hidden text-shadow-md truncate"></div>
            </div>

            <div class="shrink-0 flex flex-col bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 min-h-0 flex-grow max-h-[160px] md:max-h-[240px]">
                <div id="suggestStatus" class="text-[10px] md:text-xs text-slate-400 font-semibold px-1 uppercase tracking-wider mb-1 shrink-0">AI Suggestions (Waiting...)</div>
                <div id="grokSuggestions" class="overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-2 pr-1 content-start flex-grow"></div>
            </div>
        </div>

        <div class="w-full md:w-1/2 flex flex-col bg-slate-800 rounded-xl border border-slate-700 min-h-[350px] md:h-full shadow-sm mt-1 md:mt-0 min-h-0">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-1.5 md:p-2 bg-slate-900 border-b border-slate-700 gap-2 shrink-0">
                <div class="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0" id="categoryScroll"></div>
                <div class="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button id="addCategoryBtn" class="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 md:py-1.5 rounded-lg font-bold border border-slate-500 transition-all text-xs md:text-sm shadow-sm">+ Cat</button>
                    <button id="addPhraseBtn" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 md:py-1.5 rounded-lg font-bold border border-blue-500 transition-all text-xs md:text-sm hidden shadow-sm">+ Phrase</button>
                    <button id="editToggleBtn" class="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 md:py-1.5 rounded-lg font-bold border border-slate-500 transition-all text-xs md:text-sm shadow-sm">✏️ Edit</button>
                </div>
            </div>
     
            <div class="flex justify-between items-center px-3 pt-1.5 md:pt-2 pb-1 shrink-0">
                <h2 id="currentCategoryTitle" class="text-lg md:text-xl font-bold text-slate-200">Basics</h2>
                <button id="editCategoryBtn" class="text-red-400 hover:text-red-300 hover:bg-red-900/30 text-[10px] md:text-xs font-bold bg-slate-900 px-2 py-1 rounded border border-red-900/50 hidden transition-colors">Delete Category</button>
            </div>
     
            <div id="phraseGrid" class="flex-grow overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-2 p-2 md:p-3 content-start min-h-0"></div>
        </div>

    </main>

    <div class="md:hidden conv-log-mobile bg-slate-900/80 p-2 border-t border-slate-700">
        <div class="text-center font-bold text-slate-300 text-xs uppercase tracking-wider mb-1">Conversation Log</div>
        <div id="conversationHistoryMobile" class="h-48 overflow-y-auto p-2 flex flex-col gap-1.5"></div>
    </div>

    <div id="desktopConvContainer" class="hidden md:flex flex-col bg-slate-900/80 border-t border-slate-700 shrink-0 transition-all duration-300" style="max-height: 20vh;">
        <div class="flex justify-between items-center bg-gray-950 px-4 py-1.5 border-b border-slate-800 shrink-0">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-400">Conversation Log</span>
            <button id="toggleConvBtn" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">▼ Hide</button>
        </div>
        <div id="conversationHistory" class="flex-grow overflow-y-auto p-2 md:p-3 flex flex-col gap-1.5 md:gap-2 min-h-0"></div>
    </div>

    <div id="settingsModal" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center hidden modal-overlay p-4">
        <div class="modal-content w-full max-w-2xl rounded-2xl p-5 md:p-8 flex flex-col gap-6 max-h-[95vh] overflow-y-auto">
            <div class="flex justify-between items-center border-b border-slate-600 pb-2">
                <h3 class="text-2xl md:text-3xl font-bold text-slate-100">Settings</h3>
                <button id="closeSettingsBtn" class="text-slate-400 hover:text-white text-3xl font-bold transition-colors">&times;</button>
            </div>

            <div class="flex flex-col gap-3 border-t border-slate-700 pt-4">
                <label class="font-bold text-slate-300 text-lg">AI Provider for Reply Suggestions</label>
                <select id="aiProviderSelect" class="bg-slate-800 border border-slate-600 rounded-xl p-3 text-white font-bold w-full">
                    <option value="grok">Grok (xAI - grok-4.20-0309-non-reasoning)</option>
                    <option value="v4-flash">DeepSeek (V4-Flash)</option>
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700 pt-4">
                <div class="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <label class="text-xs text-slate-400 font-bold uppercase mb-1">Reply Count: <span id="aiCountVal" class="text-purple-400">3</span></label>
                    <input type="range" id="aiCountSlider" min="2" max="6" step="1" value="3" class="accent-purple-500">
                </div>
                <div class="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <label class="text-xs text-slate-400 font-bold uppercase mb-1">Target Length: <span id="replyLenVal" class="text-purple-400">Short</span></label>
                    <input type="range" id="replyLenSlider" min="1" max="3" step="1" value="1" class="accent-purple-500">
                </div>
                <div class="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <label class="text-xs text-slate-400 font-bold uppercase mb-1">Context Window: <span id="aiContextVal" class="text-purple-400">5</span></label>
                    <input type="range" id="aiContextSlider" min="2" max="15" step="1" value="5" class="accent-purple-500">
                </div>
            </div>

            <div class="flex flex-col gap-3 bg-slate-900/70 p-4 rounded-2xl border border-green-600">
                <div class="flex justify-between items-center">
                    <label class="font-bold text-slate-100 text-xl flex items-center gap-2">🔊 Audio Volume Boost</label>
                    <span id="audioBoostVal" class="text-green-400 font-bold text-xl">2.5x</span>
                </div>
                <input type="range" id="audioBoostSlider" min="0.5" max="12.0" step="0.1" value="2.5" class="my-1 accent-green-500">
            </div>

            <div class="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                <label class="text-xs text-slate-400 font-bold uppercase mb-1">Mic Gate Threshold: <span id="micSensVal" class="text-indigo-400">50%</span></label>
                <input type="range" id="micSensSlider" min="10" max="100" step="5" value="50" class="accent-indigo-500">
            </div>

            <div class="flex flex-col gap-1 border-t border-slate-700 pt-4">
                <label class="font-bold text-slate-300 text-lg">TTS Engine</label>
                <select id="ttsProviderSelect" class="w-full bg-slate-800 border border-slate-600 text-white font-bold p-3 rounded-xl">
                    <option value="os">OS Voice (Works offline)</option>
                    <option value="elevenlabs">ElevenLabs (Higher quality, needs internet)</option>
                </select>
            </div>

            <div id="osVoiceSection" class="flex flex-col gap-1">
                <label class="font-bold text-slate-300 text-lg">System Output Voice</label>
                <select id="voiceSelect" class="w-full bg-slate-800 border border-slate-600 text-white font-bold p-3 rounded-xl"></select>
            </div>

            <div id="elevenlabsSection" class="flex flex-col gap-4 border-t border-slate-700 pt-4 hidden">
                <div class="flex flex-col gap-1">
                    <label class="font-bold text-slate-300 text-lg">ElevenLabs API Key</label>
                    <input type="password" id="elevenApiKey" placeholder="sk_..." class="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-xl">
                    <button id="saveApiKeyBtn" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl mt-2 text-sm self-start">Save Key</button>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-center">
                        <label class="font-bold text-slate-300 text-lg">Voice Model Profile</label>
                        <button id="refreshElevenVoicesBtn" class="text-xs bg-slate-700 px-2 py-1 rounded">🔄 Refresh</button>
                    </div>
                    <select id="elevenVoiceSelect" class="w-full bg-slate-800 border border-slate-600 text-white font-bold rounded-xl p-2 mt-1"></select>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700">
                    <div><label class="text-xs text-slate-400 font-bold">Stability: <span id="stabVal">0.75</span></label><input type="range" id="stabSlider" min="0" max="1" step="0.05" value="0.75"></div>
                    <div><label class="text-xs text-slate-400 font-bold">Clarity: <span id="simVal">0.85</span></label><input type="range" id="simSlider" min="0" max="1" step="0.05" value="0.85"></div>
                    <div><label class="text-xs text-slate-400 font-bold">Style: <span id="styleVal">0.00</span></label><input type="range" id="styleSlider" min="0" max="1" step="0.05" value="0"></div>
                    <div><label class="text-xs text-slate-400 font-bold">Boost: <span id="boostVal">On</span></label><input type="range" id="boostSlider" min="0" max="1" step="1" value="1"></div>
                </div>
            </div>

            <div class="flex flex-col gap-1 border-t border-slate-700 pt-3">
                <label class="font-bold text-slate-300 text-lg flex items-center gap-2"><input type="checkbox" id="useUnsentContext" class="w-5 h-5 accent-green-500" checked>Use textbox content as extra context</label>
            </div>

            <div class="flex flex-col gap-1 border-t border-slate-700 pt-3">
                <label class="font-bold text-slate-300 text-lg">Canned Phrase Click Action</label>
                <div class="flex gap-3 h-12 mt-1">
                    <button id="btnActionSpeak" class="flex-1 bg-blue-600 border-2 border-blue-400 text-white font-bold rounded-xl transition-all shadow-md">Speak Instantly</button>
                    <button id="btnActionType" class="flex-1 bg-slate-800 border-2 border-slate-600 text-slate-400 font-bold rounded-xl transition-all shadow-md">Append Text</button>
                </div>
            </div>

            <div class="flex flex-col gap-1 border-t border-slate-700 pt-3">
                <label class="font-bold text-slate-300 text-lg flex items-center gap-2"><input type="checkbox" id="useAssemblyAI" class="w-5 h-5 accent-green-500">Enable Diarized AssemblyAI Mic Engine Mode</label>
            </div>

            <div class="flex gap-2 border-t border-slate-700 pt-4">
                <button id="exportBtn" class="flex-1 bg-slate-700 text-white font-bold py-2 rounded-xl text-sm">📤 Backup Phrases</button>
                <button id="importBtn" class="flex-1 bg-slate-700 text-white font-bold py-2 rounded-xl text-sm">📥 Restore Backup</button>
                <input type="file" id="importFileInput" class="hidden" accept=".json">
                <button id="clearHistoryBtn" class="flex-1 bg-red-900/40 text-red-300 font-bold py-2 rounded-xl text-sm border border-red-900">🗑️ Reset Logs</button>
            </div>

            <button id="closeSettingsBtnBottom" class="mt-2 bg-slate-700 text-white font-bold py-3 rounded-xl">Close Settings</button>
        </div>
    </div>

    <div id="phraseModal" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center hidden modal-overlay p-4">
        <div class="modal-content w-full max-w-lg rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 class="text-xl md:text-2xl font-bold border-b border-slate-600 pb-2 text-slate-100" id="modalTitle">Edit Phrase</h3>
            <div class="flex flex-col gap-1">
                <label class="font-bold text-slate-300 text-xs md:text-sm uppercase tracking-wider">Phrase String:</label>
                <textarea id="modalPhraseText" class="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-lg md:text-xl text-white outline-none h-24 resize-none shadow-inner"></textarea>
            </div>
            <div class="flex flex-col gap-1">
                <label class="font-bold text-slate-300 text-xs md:text-sm uppercase tracking-wider">Group Target:</label>
                <select id="modalCategorySelect" class="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white outline-none"></select>
            </div>
            <div class="flex justify-between mt-4 gap-2">
                <button id="modalDeleteBtn" class="bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-md">🗑️ Delete</button>
                <div class="flex gap-2 w-full justify-end">
                    <button id="modalCancelBtn" class="bg-slate-600 text-white font-bold py-3 px-6 rounded-xl shadow-md">Cancel</button>
                    <button id="modalSaveBtn" class="bg-green-600 text-white font-bold py-3 px-10 rounded-xl shadow-md">Save</button>
                </div>
            </div>
        </div>
    </div>

<script>
// ====================== ARCHITECTURE INITIALIZATION ======================
const GROK_API_URL = '/api/grok';
const DEEPSEEK_API_URL = '/api/deepseek';
const ASSEMBLYAI_TOKEN_URL = '/api/token';

const textInput = document.getElementById('textInput');
const predictiveBar = document.getElementById('predictiveBar');
const genBtn = document.getElementById('genBtn');
const btnText = document.getElementById('btnText');
const replayBtn = document.getElementById('replayBtn');
const listenBtn = document.getElementById('listenBtn');
const grokSuggestBtn = document.getElementById('grokSuggestBtn');
const grokSuggestionsEl = document.getElementById('grokSuggestions');
const suggestStatus = document.getElementById('suggestStatus');
const convHistoryEl = document.getElementById('conversationHistory');
const convHistoryMobileEl = document.getElementById('conversationHistoryMobile');
const liveTranscript = document.getElementById('liveTranscript');
const categoryScroll = document.getElementById('categoryScroll');
const phraseGridEl = document.getElementById('phraseGrid');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');
const editToggleBtn = document.getElementById('editToggleBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const editCategoryBtn = document.getElementById('editCategoryBtn');
const addPhraseBtn = document.getElementById('addPhraseBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeSettingsBtnBottom = document.getElementById('closeSettingsBtnBottom');
const settingsModal = document.getElementById('settingsModal');
const ttsProviderSelect = document.getElementById('ttsProviderSelect');
const osVoiceSection = document.getElementById('osVoiceSection');
const elevenlabsSection = document.getElementById('elevenlabsSection');
const elevenApiKeyInput = document.getElementById('elevenApiKey');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const elevenVoiceSelect = document.getElementById('elevenVoiceSelect');
const refreshElevenVoicesBtn = document.getElementById('refreshElevenVoicesBtn');
const desktopConvContainer = document.getElementById('desktopConvContainer');
const toggleConvBtn = document.getElementById('toggleConvBtn');

const stabSlider = document.getElementById('stabSlider');
const simSlider = document.getElementById('simSlider');
const styleSlider = document.getElementById('styleSlider');
const boostSlider = document.getElementById('boostSlider');
const audioBoostSlider = document.getElementById('audioBoostSlider');

const stabVal = document.getElementById('stabVal');
const simVal = document.getElementById('simVal');
const styleVal = document.getElementById('styleVal');
const boostVal = document.getElementById('boostVal');
const audioBoostVal = document.getElementById('audioBoostVal');
const voiceSelect = document.getElementById('voiceSelect');
const btnActionSpeak = document.getElementById('btnActionSpeak');
const btnActionType = document.getElementById('btnActionType');

const replyLenSlider = document.getElementById('replyLenSlider');
const replyLenVal = document.getElementById('replyLenVal');
const aiCountSlider = document.getElementById('aiCountSlider');
const aiCountVal = document.getElementById('aiCountVal');
const aiContextSlider = document.getElementById('aiContextSlider');
const aiContextVal = document.getElementById('aiContextVal');
const micSensSlider = document.getElementById('micSensSlider');
const micSensVal = document.getElementById('micSensVal');

const useUnsentContext = document.getElementById('useUnsentContext');
const useAssemblyAIChk = document.getElementById('useAssemblyAI');
const aiProviderSelect = document.getElementById('aiProviderSelect');

let phraseCategories = JSON.parse(localStorage.getItem('alsPhrases')) || {
    "Basics": ["Yes.", "No.", "Please.", "Thank you.", "I don't know.", "Maybe.", "Can you repeat that?", "Give me a minute.", "Okay.", "Wait.", "Stop.", "Go.", "I changed my mind."],
    "Needs": ["I am hungry.", "I am thirsty.", "Bathroom, please.", "I am tired.", "Can I have some water?", "I need my medication.", "I need a shower.", "Wipe my mouth.", "Wipe my eyes.", "Blow my nose.", "I need my glasses."],
    "Care & Comfort": ["Adjust my position.", "I am in pain.", "I need help.", "It is too hot.", "It is too cold.", "Scratch my itch.", "Scratch my face.", "Scratch my head.", "My muscles are cramping.", "Adjust my head.", "Move my arm.", "Move my leg.", "Prop up my feet.", "I need to stretch."],
    "Medical & Breathing": ["Suction, please.", "Adjust my mask.", "My mask is leaking.", "Check my ventilator.", "Use the cough assist.", "I can't breathe well.", "Clear my throat.", "Check my feeding tube.", "Flush my tube.", "I have phlegm.", "Raise the head of the bed.", "Lower the bed."],
    "Numbers & Time": ["What time is it?", "Now.", "Later.", "Soon.", "In a minute.", "Today.", "Tomorrow.", "Yesterday.", "Morning.", "Afternoon.", "Evening.", "Night.", "A.M.", "P.M.", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "Greetings & Social": ["Hello!", "How are you?", "Goodbye.", "Good morning.", "Good night.", "See you later.", "It is good to see you.", "What have you been up to?", "Tell me a story.", "Tell me a joke.", "I love you."],
    "Emotions & Feelings": ["I am happy.", "I am sad.", "I am frustrated.", "I am angry.", "I am anxious.", "I am bored.", "I am overwhelmed.", "Please be patient with me.", "Leave me alone for a bit.", "Stay here with me."],
    "Tech & Environment": ["Turn on the TV.", "Turn off the TV.", "Change the channel.", "Volume up.", "Volume down.", "Play some music.", "Turn on the lights.", "Turn off the lights.", "Open the blinds.", "Close the door.", "Open the door.", "My screen needs calibrating.", "Adjust my screen."],
    "Food & Drink Specifics": ["Coffee, please.", "Tea, please.", "More, please.", "I am full.", "It is too hot to eat.", "It is too cold.", "Give me a smaller bite.", "Give me a smaller sip.", "Thicken my drink.", "Feed me slower."]
};
let currentCategory = Object.keys(phraseCategories)[0] || "Basics";
let conversationHistory = JSON.parse(localStorage.getItem('alsConversation')) || [];
let isEditMode = false;
let clickAction = localStorage.getItem('clickAction') || 'speak';
let lastSpoken = '';
let intentionallyStopped = true;
let isTTSPlaying = false;
let editingPhraseIndex = -1;
let editingCategorySource = '';
let ttsProvider = localStorage.getItem('ttsProvider') || 'os';
let elevenApiKey = localStorage.getItem('elevenApiKey') || '';
let selectedElevenVoiceId = localStorage.getItem('selectedElevenVoiceId') || '';
let elevenSettings = JSON.parse(localStorage.getItem('elevenSettings')) || { stability: 0.75, similarity_boost: 0.85, style: 0.0, speaker_boost: true };
let availableVoices = [];
let elevenVoices = [];
let aiProvider = localStorage.getItem('aiProvider') || 'grok';
let audioBoostLevel = parseFloat(localStorage.getItem('audioBoostLevel')) || 2.5;
let audioContextGlobal = null;
let isLogMinimized = false;
let useAssemblyAI = localStorage.getItem('useAssemblyAI') === 'true';

let assemblyWS = null;
let assemblyStream = null;
let assemblyProcessor = null;
let assemblyAudioContext = null;
let isAssemblyListening = false;
let aiRequestInProgress = false;
let predictiveDebounce = null;

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; 
let inactivityTimeoutTracker = null;

function resetInactivityTimer() {
    if (inactivityTimeoutTracker) clearTimeout(inactivityTimeoutTracker);
    inactivityTimeoutTracker = setTimeout(() => {
        if (useAssemblyAI && isAssemblyListening) stopAssemblyAI();
        else if (!intentionallyStopped && recognition) {
            intentionallyStopped = true;
            recognition.stop();
            updateMicUI(false);
        }
    }, INACTIVITY_LIMIT_MS);
}

function scrollToBottom() {
    setTimeout(() => {
        if (convHistoryEl) convHistoryEl.scrollTop = convHistoryEl.scrollHeight;
        if (convHistoryMobileEl) convHistoryMobileEl.scrollTop = convHistoryMobileEl.scrollHeight;
    }, 10);
}

toggleConvBtn.onclick = () => {
    isLogMinimized = !isLogMinimized;
    if (isLogMinimized) {
        desktopConvContainer.style.maxHeight = "36px";
        toggleConvBtn.textContent = "▲ Show";
        convHistoryEl.style.display = "none";
    } else {
        desktopConvContainer.style.maxHeight = "20vh";
        toggleConvBtn.textContent = "▼ Hide";
        convHistoryEl.style.display = "flex";
        scrollToBottom();
    }
};

// ====================== FIXED PREDICTIVE TEXT ======================
function getCurrentWordInfo(text) {
    const beforeCursor = text;
    const words = beforeCursor.split(/(\s+)/);
    const lastNonSpace = words.filter(w => w.trim()).pop() || '';
    const endsWithSpace = beforeCursor.endsWith(' ') || beforeCursor === '';
    return { lastWord: lastNonSpace, endsWithSpace };
}

function getPredictionsForWord(partialWord) {
    const word = partialWord.toLowerCase();
    
    const completions = {
        'h': ['hello', 'help', 'how', 'happy', 'hot', 'hungry'],
        'he': ['hello', 'help', 'head', 'here'],
        'hel': ['hello', 'help'],
        'hell': ['hello'],
        'ho': ['how', 'hot', 'home'],
        'w': ['what', 'when', 'where', 'why', 'water', 'wait', 'want'],
        'wh': ['what', 'when', 'where', 'why'],
        'wha': ['what'],
        'c': ['can', 'could', 'close', 'coffee'],
        'ca': ['can'],
        'co': ['could', 'coffee', 'cold'],
        't': ['the', 'thank', 'turn', 'time', 'today', 'tomorrow'],
        'th': ['the', 'thank', 'this', 'that'],
        'tha': ['thank', 'that'],
        'than': ['thank'],
        'i': ['i', 'is', 'in', 'it'],
        'n': ['no', 'now', 'need', 'night'],
        'ne': ['need', 'next'],
        'nee': ['need'],
        'y': ['yes', 'you', 'yesterday'],
        'ye': ['yes', 'yesterday'],
        's': ['stop', 'some', 'suction', 'soon', 'see', 'scratch'],
        'st': ['stop'],
        'so': ['some', 'soon'],
        'p': ['please', 'play', 'pain'],
        'pl': ['please', 'play'],
        'ple': ['please'],
        'm': ['more', 'my', 'maybe', 'morning', 'music', 'medication', 'mask'],
        'mo': ['more', 'morning'],
        'b': ['bathroom', 'bed', 'blinds', 'bite'],
        'ba': ['bathroom'],
        'g': ['go', 'give', 'good', 'goodbye'],
        'go': ['go', 'good', 'goodbye'],
        'goo': ['good', 'goodbye'],
        'd': ['door', 'doctor', 'drink', 'dont'],
        'do': ['door', 'dont'],
        'f': ['feel', 'full', 'feed', 'feet'],
        'fe': ['feel', 'feed', 'feet'],
        'r': ['raise', 'repeat'],
        'ra': ['raise'],
        'o': ['open', 'okay', 'on', 'off'],
        'op': ['open'],
        'l': ['later', 'leave', 'lights', 'lower', 'leg'],
        'la': ['later'],
        'le': ['leave', 'leg', 'lower'],
        'li': ['lights'],
        'e': ['evening'],
        'v': ['volume', 'ventilator'],
        'vo': ['volume'],
        'a': ['am', 'and', 'afternoon', 'arm', 'anxious', 'adjust'],
        'an': ['and', 'anxious'],
        'ad': ['adjust'],
    };
    
    if (completions[word]) return completions[word];
    
    const allWords = Object.values(completions).flat();
    const uniqueWords = [...new Set(allWords)];
    
    if (word.length >= 2) {
        return uniqueWords.filter(w => w.startsWith(word)).slice(0, 6);
    }
    
    return uniqueWords.slice(0, 6);
}

function getNextWordPredictions(fullText) {
    const words = fullText.trim().split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase() || '';
    
    const nextWords = {
        'i': ['am', 'need', 'want', 'can', 'feel', 'think', 'have', 'changed'],
        'am': ['hungry', 'thirsty', 'tired', 'cold', 'hot', 'in', 'full', 'happy', 'sad', 'anxious'],
        'need': ['help', 'water', 'my', 'a', 'to', 'some', 'more'],
        'want': ['to', 'some', 'more', 'water'],
        'can': ['you', 'i', 'please', 'have'],
        'please': ['help', 'give', 'tell', 'stop', 'adjust'],
        'thank': ['you'],
        'the': ['tv', 'channel', 'lights', 'door', 'blinds', 'bed', 'time'],
        'my': ['arm', 'leg', 'head', 'medication', 'glasses', 'mask', 'screen', 'nose', 'mouth'],
        'turn': ['on', 'off', 'the', 'up', 'down'],
        'how': ['are', 'is', 'much'],
        'what': ['time', 'is'],
        'give': ['me', 'a'],
        'some': ['water', 'help', 'more'],
        'more': ['please', 'water'],
        'very': ['much'],
        'a': ['minute', 'shower', 'bite', 'sip', 'story', 'joke'],
        'its': ['too', 'good'],
        'too': ['hot', 'cold'],
        'see': ['you'],
        'good': ['morning', 'night', 'bye'],
        'tell': ['me', 'a'],
        'scratch': ['my'],
        'adjust': ['my', 'the'],
        'move': ['my'],
        'open': ['the', 'door'],
        'close': ['the', 'door'],
        'volume': ['up', 'down'],
        'play': ['some'],
        'feed': ['me'],
        'wipe': ['my'],
        'blow': ['my'],
        'prop': ['up'],
        'raise': ['the'],
        'lower': ['the'],
        'leave': ['me'],
        'stay': ['here'],
        'with': ['me'],
        'goodbye': [],
        'yes': [],
        'no': [],
        'okay': [],
        'hello': [],
        'coffee': ['please'],
        'tea': ['please'],
        'bathroom': ['please'],
    };
    
    if (nextWords[lastWord]) {
        return nextWords[lastWord].slice(0, 6);
    }
    
    const commonNext = ['please', 'the', 'me', 'you', 'my', 'some', 'more', 'now', 'help'];
    return commonNext.slice(0, 5);
}

async function updatePredictive() {
    const text = textInput.value;
    if (!text || text.trim() === "") {
        predictiveBar.classList.add('hidden');
        return;
    }
    
    const { lastWord, endsWithSpace } = getCurrentWordInfo(text);
    
    let predictions = [];
    
    if (!endsWithSpace && lastWord.length > 0) {
        predictions = getPredictionsForWord(lastWord);
    } else if (endsWithSpace) {
        predictions = getNextWordPredictions(text);
        if (predictions.length === 0) {
            try {
                const words = text.trim().split(/\s+/).slice(-5).join(' ');
                const res = await fetch(DEEPSEEK_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "deepseek-v4-flash",
                        messages: [{ role: "user", content: `Complete with 1-3 next words only: "${words}"` }],
                        max_tokens: 20,
                        temperature: 0.3
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    const content = data.choices?.[0]?.message?.content || '';
                    predictions = content.replace(/["']/g,'').split(/\s+/).filter(w => w.length > 0).slice(0, 5);
                }
            } catch(e) {}
        }
    }
    
    predictiveBar.innerHTML = '';
    if (predictions.length === 0) {
        predictiveBar.classList.add('hidden');
        return;
    }
    
    predictions.forEach(word => {
        const btn = document.createElement('button');
        btn.className = 'bg-slate-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm shrink-0 font-bold transition-colors';
        btn.textContent = word;
        btn.onclick = () => {
            if (!endsWithSpace && lastWord.length > 0) {
                const words = text.split(/(\s+)/);
                for (let i = words.length - 1; i >= 0; i--) {
                    if (words[i].trim()) {
                        words[i] = word + (text.endsWith(' ') ? ' ' : '');
                        break;
                    }
                }
                textInput.value = words.join('');
            } else {
                textInput.value = text.trimEnd() + ' ' + word + ' ';
            }
            predictiveBar.classList.add('hidden');
            textInput.focus();
            resetInactivityTimer();
        };
        predictiveBar.appendChild(btn);
    });
    predictiveBar.classList.remove('hidden');
}

textInput.addEventListener('input', () => {
    if (predictiveDebounce) clearTimeout(predictiveDebounce);
    predictiveDebounce = setTimeout(updatePredictive, 150);
});

// ====================== TTS ENGINES ======================
async function speakWithElevenLabs(text) {
    if (!elevenApiKey || !selectedElevenVoiceId) { speakWithOS(text); return; }
    try {
        genBtn.disabled = true;
        btnText.innerHTML = '<span class="text-xs md:text-lg">🔊...</span>';
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedElevenVoiceId}/stream`, {
            method: 'POST',
            headers: { 'Accept': 'audio/mpeg', 'xi-api-key': elevenApiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, model_id: "eleven_monolingual_v1", voice_settings: elevenSettings })
        });
        if (!response.ok) throw new Error();
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => { URL.revokeObjectURL(audioUrl); finishTTS(); };
        audio.onerror = () => { URL.revokeObjectURL(audioUrl); finishTTS(); };
        if (audioBoostLevel > 1) {
            if (!audioContextGlobal) audioContextGlobal = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContextGlobal.state === 'suspended') await audioContextGlobal.resume();
            const source = audioContextGlobal.createMediaElementSource(audio);
            const gainNode = audioContextGlobal.createGain();
            gainNode.gain.value = audioBoostLevel;
            source.connect(gainNode).connect(audioContextGlobal.destination);
        }
        audio.play();
        lastSpoken = text;
    } catch (err) { speakWithOS(text); }
}

function speakWithOS(text) {
    if (!text || !window.speechSynthesis) { finishTTS(); return; }
    lastSpoken = text;
    window.speechSynthesis.cancel();
    genBtn.disabled = true;
    btnText.innerHTML = '<span class="text-xs md:text-lg">🔊...</span>';
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (availableVoices.length === 0 && window.speechSynthesis) availableVoices = speechSynthesis.getVoices();
        const savedVoiceURI = localStorage.getItem('selectedVoiceURI');
        if (savedVoiceURI && availableVoices.length) {
            const exactVoice = availableVoices.find(v => v.voiceURI === savedVoiceURI);
            if (exactVoice) utterance.voice = exactVoice;
        } else { utterance.lang = 'en-US'; }
        utterance.volume = Math.min(1.0, audioBoostLevel);
        utterance.rate = 0.92;
        utterance.onend = finishTTS;
        utterance.onerror = () => finishTTS();
        window.speechSynthesis.speak(utterance);
    }, 100);
}

async function fetchElevenVoices() {
    if (!elevenApiKey) return;
    try {
        const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': elevenApiKey } });
        if (res.ok) { elevenVoices = (await res.json()).voices || []; renderElevenVoiceSelect(); }
    } catch (e) {}
}

function renderElevenVoiceSelect() {
    elevenVoiceSelect.innerHTML = '';
    elevenVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voice_id; opt.textContent = `${v.name} ${v.category ? `(${v.category})` : ''}`;
        if (v.voice_id === selectedElevenVoiceId) opt.selected = true;
        elevenVoiceSelect.appendChild(opt);
    });
}

function speak(text) {
    if (!text) return;
    addToConversation('you', text);
    if (ttsProvider === 'elevenlabs') speakWithElevenLabs(text);
    else speakWithOS(text);
}

function finishTTS() {
    genBtn.disabled = false;
    btnText.innerHTML = '<span class="flex flex-col items-center"><span class="text-lg md:text-2xl mb-0.5">🔊</span>Speak</span>';
    isTTSPlaying = false;
}

// ====================== PHRASE GRID ENGINE ======================
function handlePhraseTap(phrase) {
    resetInactivityTimer();
    if (clickAction === 'speak') {
        textInput.value = phrase;
        speak(phrase);
        predictiveBar.classList.add('hidden');
    } else {
        textInput.value += (textInput.value && !textInput.value.endsWith(' ') ? ' ' : '') + phrase + ' ';
        textInput.scrollTop = textInput.scrollHeight;
        textInput.focus();
    }
}

function saveToStorage() { localStorage.setItem('alsPhrases', JSON.stringify(phraseCategories)); }
function saveConversation() { localStorage.setItem('alsConversation', JSON.stringify(conversationHistory)); }

function renderCategories() {
    categoryScroll.innerHTML = '';
    Object.keys(phraseCategories).forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.className = `shrink-0 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-lg font-bold rounded-xl transition-all ${cat === currentCategory ? 'bg-green-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`;
        btn.onclick = () => { currentCategory = cat; currentCategoryTitle.textContent = cat; renderCategories(); renderPhrases(); };
        categoryScroll.appendChild(btn);
    });
    currentCategoryTitle.textContent = currentCategory;
}

function renderPhrases() {
    phraseGridEl.innerHTML = '';
    addPhraseBtn.classList.toggle('hidden', !isEditMode);
    editCategoryBtn.classList.toggle('hidden', !isEditMode);
    editToggleBtn.className = isEditMode ? 'bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold border border-blue-500 shadow-sm' : 'bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg font-bold border border-slate-500 shadow-sm';
    editToggleBtn.innerHTML = isEditMode ? 'Done' : '✏️ Edit';
    if(phraseCategories[currentCategory]) {
        phraseCategories[currentCategory].forEach((phrase, idx) => {
            const btn = document.createElement('button');
            btn.textContent = phrase;
            btn.className = `p-2 md:p-4 text-[13px] sm:text-base md:text-xl font-bold rounded-xl shadow-md min-h-[56px] md:min-h-[80px] flex items-center justify-center text-center ${isEditMode ? 'bg-slate-800 text-blue-300 edit-mode-btn cursor-pointer' : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'}`;
            btn.onclick = () => {
                if (isEditMode) openModal(phrase, currentCategory, idx);
                else handlePhraseTap(phrase);
            };
            phraseGridEl.appendChild(btn);
        });
    }
}

function renderConversationHistory() {
    convHistoryEl.innerHTML = '';
    convHistoryMobileEl.innerHTML = '';
    const seenMessages = new Set();
    const uniqueHistory = conversationHistory.filter(msg => {
        const key = `${msg.speaker}|${msg.text}`;
        if (seenMessages.has(key)) return false;
        seenMessages.add(key);
        return true;
    });
    if (uniqueHistory.length !== conversationHistory.length) { conversationHistory = uniqueHistory; saveConversation(); }
    conversationHistory.forEach(msg => {
        appendMessageUI(msg.speaker, msg.text, convHistoryEl);
        appendMessageUI(msg.speaker, msg.text, convHistoryMobileEl);
    });
    if (!isLogMinimized) scrollToBottom();
}

function appendMessageUI(speaker, text, container) {
    const div = document.createElement('div');
    div.className = `msg ${speaker === 'you' ? 'msg-you' : 'msg-other'}`;
    let displayText = text, speakerLabel = '';
    if (text.startsWith('(Speaker ') || text.startsWith('(You)') || text.startsWith('(Partner)')) {
        const match = text.match(/^\(([^)]+)\)\s*(.*)/);
        if (match) { speakerLabel = match[1]; displayText = match[2]; }
    }
    let htmlContent = `<div>`;
    if (speakerLabel && speaker !== 'you') htmlContent += `<span class="text-xs text-indigo-400 font-bold">${speakerLabel}: </span>`;
    htmlContent += `${displayText}</div>`;
    if (speaker === 'you') htmlContent += `<button class="save-phrase-btn" onclick="window.openSaveFromHistory('${displayText.replace(/'/g, "\\'")}')">💾 Save Phrase</button>`;
    div.innerHTML = htmlContent;
    container.appendChild(div);
}

function addToConversation(speaker, text) {
    const lastEntry = conversationHistory[conversationHistory.length - 1];
    if (lastEntry && lastEntry.speaker === speaker && lastEntry.text === text) return;
    conversationHistory.push({ speaker, text });
    saveConversation();
    renderConversationHistory();
}

function openModal(phraseText, category, index) {
    editingPhraseIndex = index; editingCategorySource = category;
    document.getElementById('modalTitle').textContent = "Edit Phrase";
    document.getElementById('modalDeleteBtn').classList.remove('hidden');
    document.getElementById('modalPhraseText').value = phraseText;
    const sel = document.getElementById('modalCategorySelect');
    sel.innerHTML = '';
    Object.keys(phraseCategories).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat;
        if (cat === category) opt.selected = true;
        sel.appendChild(opt);
    });
    document.getElementById('phraseModal').classList.remove('hidden');
}

// ====================== CONTEXT GENERATOR ======================
async function generateGrokSuggestions() {
    if (aiRequestInProgress) return;
    aiRequestInProgress = true;
    let numReplies = parseInt(aiCountSlider.value);
    const contextLimit = parseInt(aiContextSlider.value);
    const lengthLabels = ["extremely short (1-4 words max)", "medium length (one complete quick casual phrase)", "long full context detailed natural statements"];
    const targetLengthRule = lengthLabels[parseInt(replyLenSlider.value) - 1];
    const activeLabel = aiProvider === 'v4-flash' ? 'DEEPSEEK V4-FLASH' : 'GROK FAST';
    grokSuggestionsEl.innerHTML = `<div class="col-span-full text-center text-slate-400 py-6 font-bold tracking-wide">Generating ${activeLabel} suggestions...</div>`;
    suggestStatus.textContent = `AI Suggestions (Generating...)`;
    let recentConv = conversationHistory.slice(-contextLimit).map(m => `${m.speaker === 'you' ? 'ALS User' : 'Partner'}: ${m.text}`).join('\n');
    if (useUnsentContext.checked && textInput.value.trim()) recentConv += `\n[Highest Priority Context: "${textInput.value.trim()}"]`;
    try {
        const messages = [{ role: 'user', content: `You are a human with ALS. Generate exactly ${numReplies} natural conversational options (${targetLengthRule}). One per line:\n${recentConv}` }];
        const targetURL = aiProvider === 'v4-flash' ? DEEPSEEK_API_URL : GROK_API_URL;
        const payload = aiProvider === 'v4-flash' ? { messages, max_tokens: 250, temperature: 0.75, model: "deepseek-v4-flash" } : { model: 'grok-4.1-fast-non-reasoning', messages, max_tokens: 250, temperature: 0.6 };
        const response = await fetch(targetURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const suggestions = data.choices[0].message.content.trim().split('\n').map(s => s.trim().replace(/^[\d\.\-\*\"\s]+/,'').replace(/\"/g,'')).filter(s => s.length > 1);
        grokSuggestionsEl.innerHTML = '';
        suggestStatus.textContent = `AI Suggestions (${aiProvider === 'v4-flash' ? 'V4-Flash' : 'Grok Fast'})`;
        suggestions.slice(0, numReplies).forEach(phrase => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn'; btn.textContent = phrase;
            btn.onclick = () => handlePhraseTap(phrase);
            grokSuggestionsEl.appendChild(btn);
        });
    } catch (err) { 
        suggestStatus.textContent = 'AI Suggestions failed - try again'; 
        grokSuggestionsEl.innerHTML = '<div class="col-span-full text-center text-red-400 py-6">Failed. Click again.</div>'; 
    } finally { aiRequestInProgress = false; }
}

// ====================== ASSEMBLYAI VIA /api/token ======================
async function getAssemblyToken() {
    try {
        console.log("Fetching AssemblyAI token...");
        const res = await fetch(ASSEMBLYAI_TOKEN_URL);
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Token error:", res.status, errorText);
            return null;
        }
        const data = await res.json();
        console.log("Token received");
        return data.token;
    } catch (e) { console.error("Token fetch error:", e); return null; }
}

async function startAssemblyAI() {
    if (isAssemblyListening) return;
    try {
        const token = await getAssemblyToken();
        if (!token) {
            alert("Could not connect to speech service. Please try again.");
            updateMicUI(false);
            return;
        }
        const diarizeEnabled = useAssemblyAIChk.checked;
        const url = `wss://streaming.assemblyai.com/v3/ws?token=${encodeURIComponent(token)}&speech_model=universal-streaming-english&sample_rate=16000&encoding=pcm_s16le${diarizeEnabled ? '&speaker_labels=true&max_speakers=6' : ''}`;
        assemblyWS = new WebSocket(url);
        assemblyWS.onopen = () => { isAssemblyListening = true; updateMicUI(true); resetInactivityTimer(); };
        assemblyWS.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "Turn") {
                    const text = data.transcript || "";
                    if (!text.trim()) return;
                    const speakerLabel = data.speaker_label ? `Speaker ${data.speaker_label}` : "Partner";
                    if (data.end_of_turn) {
                        const finalText = diarizeEnabled ? `(${speakerLabel}) ${text.trim()}` : text.trim();
                        addToConversation('other', finalText);
                        liveTranscript.textContent = `🗣️ ${text.trim()}`;
                        setTimeout(() => liveTranscript.classList.add('hidden'), 1500);
                    } else {
                        liveTranscript.textContent = `🗣️ ${speakerLabel}: ${text.trim()}`;
                        liveTranscript.classList.remove('hidden');
                    }
                }
            } catch(e) {}
        };
        assemblyWS.onerror = () => stopAssemblyAI();
        assemblyWS.onclose = () => { if (isAssemblyListening) stopAssemblyAI(); };
        assemblyStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true } });
        assemblyAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const source = assemblyAudioContext.createMediaStreamSource(assemblyStream);
        assemblyProcessor = assemblyAudioContext.createScriptProcessor(4096, 1, 1);
        assemblyProcessor.onaudioprocess = (e) => {
            if (!assemblyWS || assemblyWS.readyState !== WebSocket.OPEN) return;
            const input = e.inputBuffer.getChannelData(0);
            const pcm = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) { const s = Math.max(-1, Math.min(1, input[i])); pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF; }
            assemblyWS.send(pcm.buffer);
        };
        source.connect(assemblyProcessor);
        assemblyProcessor.connect(assemblyAudioContext.destination);
    } catch (err) { stopAssemblyAI(); alert("Microphone error: " + (err.message || "Permission denied")); }
}

function stopAssemblyAI() {
    if (assemblyProcessor) { assemblyProcessor.disconnect(); assemblyProcessor = null; }
    if (assemblyAudioContext) { assemblyAudioContext.close().catch(() => {}); assemblyAudioContext = null; }
    if (assemblyStream) { assemblyStream.getTracks().forEach(t => t.stop()); assemblyStream = null; }
    if (assemblyWS) { if (assemblyWS.readyState === WebSocket.OPEN) try { assemblyWS.send(JSON.stringify({ terminate_session: true })); } catch(e) {} assemblyWS.close(); assemblyWS = null; }
    isAssemblyListening = false;
    updateMicUI(false);
}

// ====================== NATIVE PERIPHERALS ======================
function updateMicUI(isListening) {
    if (isListening) {
        listenBtn.classList.replace('bg-indigo-600', 'bg-red-600');
        listenBtn.classList.add('animate-pulse');
        listenBtn.innerHTML = '<span class="text-lg md:text-xl leading-none mb-0.5 md:mb-1">🔴</span>Mic ON';
    } else {
        listenBtn.classList.replace('bg-red-600', 'bg-indigo-600');
        listenBtn.classList.remove('animate-pulse');
        listenBtn.innerHTML = '<span class="text-lg md:text-xl leading-none mb-0.5 md:mb-1">🎤</span>Mic OFF';
    }
}

let recognition = null;
listenBtn.onclick = () => {
    if (useAssemblyAI) { if (isAssemblyListening) stopAssemblyAI(); else startAssemblyAI(); }
    else {
        if (!intentionallyStopped) { intentionallyStopped = true; if (recognition) try { recognition.stop(); } catch(e) {} updateMicUI(false); }
        else { intentionallyStopped = false; updateMicUI(true); if (!recognition) recognition = createRecognition(); if (recognition) try { recognition.start(); } catch(e) {} resetInactivityTimer(); }
    }
};

function createRecognition() {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) return null;
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true;
    rec.onresult = (event) => {
        if (isTTSPlaying) return;
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        if (transcript.trim()) {
            resetInactivityTimer();
            liveTranscript.textContent = '🗣️ ' + transcript;
            liveTranscript.classList.remove('hidden');
            if (event.results[event.results.length - 1].isFinal) {
                addToConversation('other', transcript.trim());
                setTimeout(() => liveTranscript.classList.add('hidden'), 1200);
            }
        }
    };
    rec.onerror = () => { intentionallyStopped = true; updateMicUI(false); };
    rec.onend = () => { if (!intentionallyStopped) try { rec.start(); } catch(e) { intentionallyStopped = true; updateMicUI(false); } };
    return rec;
}

// ====================== EVENT HANDLERS ======================
openSettingsBtn.onclick = () => settingsModal.classList.remove('hidden');
closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
closeSettingsBtnBottom.onclick = () => settingsModal.classList.add('hidden');

textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); genBtn.click(); } });

genBtn.onclick = () => {
    const text = textInput.value.trim();
    if (text) { speak(text); textInput.value = ''; predictiveBar.classList.add('hidden'); }
};

replayBtn.onclick = () => { if (lastSpoken) speak(lastSpoken); };
document.getElementById('clearBtn').onclick = () => { textInput.value = ''; predictiveBar.classList.add('hidden'); };
editToggleBtn.onclick = () => { isEditMode = !isEditMode; renderPhrases(); };

addCategoryBtn.onclick = () => {
    const newCat = prompt("Enter new category name:");
    if (newCat && newCat.trim() && !phraseCategories[newCat.trim()]) { phraseCategories[newCat.trim()] = []; currentCategory = newCat.trim(); saveToStorage(); renderCategories(); renderPhrases(); }
    else if (newCat) alert("Category already exists.");
};
editCategoryBtn.onclick = () => {
    if(confirm(`DELETE "${currentCategory}"?`)) { delete phraseCategories[currentCategory]; currentCategory = Object.keys(phraseCategories)[0] || ""; saveToStorage(); renderCategories(); renderPhrases(); }
};
addPhraseBtn.onclick = () => { openModal(textInput.value || "", currentCategory, -1); document.getElementById('modalTitle').textContent = "Add New Phrase"; document.getElementById('modalDeleteBtn').classList.add('hidden'); };

document.getElementById('modalCancelBtn').onclick = () => document.getElementById('phraseModal').classList.add('hidden');
document.getElementById('modalSaveBtn').onclick = () => {
    const newText = document.getElementById('modalPhraseText').value.trim();
    const targetCategory = document.getElementById('modalCategorySelect').value;
    if(!newText) return alert("Cannot be empty");
    if (editingPhraseIndex > -1) phraseCategories[editingCategorySource].splice(editingPhraseIndex, 1);
    phraseCategories[targetCategory].push(newText);
    saveToStorage();
    document.getElementById('phraseModal').classList.add('hidden');
    currentCategory = targetCategory;
    renderCategories(); renderPhrases();
};
document.getElementById('modalDeleteBtn').onclick = () => {
    if (editingPhraseIndex > -1 && confirm("Delete?")) { phraseCategories[editingCategorySource].splice(editingPhraseIndex, 1); saveToStorage(); document.getElementById('phraseModal').classList.add('hidden'); renderPhrases(); }
};

audioBoostSlider.oninput = () => { audioBoostLevel = parseFloat(audioBoostSlider.value); audioBoostVal.textContent = audioBoostLevel.toFixed(1)+'x'; localStorage.setItem('audioBoostLevel', audioBoostLevel); };
aiCountSlider.oninput = () => aiCountVal.textContent = aiCountSlider.value;
replyLenSlider.oninput = () => { const labels = ["Short","Medium","Long"]; replyLenVal.textContent = labels[parseInt(replyLenSlider.value)-1]; };
aiContextSlider.oninput = () => aiContextVal.textContent = aiContextSlider.value;
micSensSlider.oninput = () => micSensVal.textContent = micSensSlider.value+'%';

document.getElementById('exportBtn').onclick = () => { const blob = new Blob([JSON.stringify({phrases:phraseCategories,history:conversationHistory},null,2)],{type:"application/json"}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`ALS_Backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); };
document.getElementById('importBtn').onclick = () => document.getElementById('importFileInput').click();
document.getElementById('importFileInput').onchange = (e) => { const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=(ev)=>{ try{const data=JSON.parse(ev.target.result); if(data.phrases)phraseCategories=data.phrases; if(data.history)conversationHistory=data.history; saveToStorage();saveConversation(); currentCategory=Object.keys(phraseCategories)[0]; renderCategories();renderPhrases();renderConversationHistory(); settingsModal.classList.add('hidden'); }catch(err){alert("Error reading file.");} }; reader.readAsText(file); };
document.getElementById('clearHistoryBtn').onclick = () => { if(confirm("Delete all history?")){conversationHistory=[];saveConversation();renderConversationHistory();settingsModal.classList.add('hidden');} };

function updateActionUI() {
    if (clickAction === 'speak') { btnActionSpeak.className='flex-1 bg-blue-600 border-2 border-blue-400 text-white font-bold rounded-xl shadow-md'; btnActionType.className='flex-1 bg-slate-800 border-2 border-slate-600 text-slate-400 font-bold rounded-xl shadow-md'; }
    else { btnActionType.className='flex-1 bg-blue-600 border-2 border-blue-400 text-white font-bold rounded-xl shadow-md'; btnActionSpeak.className='flex-1 bg-slate-800 border-2 border-slate-600 text-slate-400 font-bold rounded-xl shadow-md'; }
}
btnActionSpeak.onclick = () => { clickAction='speak'; localStorage.setItem('clickAction','speak'); updateActionUI(); };
btnActionType.onclick = () => { clickAction='type'; localStorage.setItem('clickAction','type'); updateActionUI(); };

ttsProviderSelect.onchange = () => { ttsProvider=ttsProviderSelect.value; localStorage.setItem('ttsProvider',ttsProvider); osVoiceSection.classList.toggle('hidden',ttsProvider!=='os'); elevenlabsSection.classList.toggle('hidden',ttsProvider!=='elevenlabs'); };

function populateVoiceList() {
    if (typeof speechSynthesis==='undefined') return;
    availableVoices = speechSynthesis.getVoices();
    voiceSelect.innerHTML='';
    let enVoices=availableVoices.filter(v=>v.lang.startsWith('en'));
    if(!enVoices.length)enVoices=availableVoices;
    const saved=localStorage.getItem('selectedVoiceURI');
    enVoices.forEach(v=>{const o=document.createElement('option');o.textContent=`${v.name}(${v.lang})`;o.value=v.voiceURI;if(v.voiceURI===saved)o.selected=true;voiceSelect.appendChild(o);});
}
if('speechSynthesis'in window){populateVoiceList();speechSynthesis.onvoiceschanged=populateVoiceList;}
voiceSelect.onchange=()=>localStorage.setItem('selectedVoiceURI',voiceSelect.value);

stabSlider.oninput=()=>{elevenSettings.stability=parseFloat(stabSlider.value);stabVal.textContent=elevenSettings.stability.toFixed(2);localStorage.setItem('elevenSettings',JSON.stringify(elevenSettings));};
simSlider.oninput=()=>{elevenSettings.similarity_boost=parseFloat(simSlider.value);simVal.textContent=elevenSettings.similarity_boost.toFixed(2);localStorage.setItem('elevenSettings',JSON.stringify(elevenSettings));};
styleSlider.oninput=()=>{elevenSettings.style=parseFloat(styleSlider.value);styleVal.textContent=elevenSettings.style.toFixed(2);localStorage.setItem('elevenSettings',JSON.stringify(elevenSettings));};
boostSlider.oninput=()=>{elevenSettings.speaker_boost=parseFloat(boostSlider.value)>0.5;boostVal.textContent=elevenSettings.speaker_boost?'On':'Off';localStorage.setItem('elevenSettings',JSON.stringify(elevenSettings));};

saveApiKeyBtn.onclick=async()=>{const key=elevenApiKeyInput.value.trim();if(key){elevenApiKey=key;localStorage.setItem('elevenApiKey',elevenApiKey);await fetchElevenVoices();}};
refreshElevenVoicesBtn.onclick=fetchElevenVoices;
elevenVoiceSelect.onchange=()=>{selectedElevenVoiceId=elevenVoiceSelect.value;localStorage.setItem('selectedElevenVoiceId',selectedElevenVoiceId);};

window.openSaveFromHistory=(text)=>{isEditMode=true;openModal(text,currentCategory,-1);document.getElementById('modalTitle').textContent="Save Phrase";document.getElementById('modalDeleteBtn').classList.add('hidden');};

aiProviderSelect.onchange=()=>{aiProvider=aiProviderSelect.value;localStorage.setItem('aiProvider',aiProvider);};
useAssemblyAIChk.onchange=()=>{useAssemblyAI=useAssemblyAIChk.checked;localStorage.setItem('useAssemblyAI',useAssemblyAI);if(isAssemblyListening&&!useAssemblyAI)stopAssemblyAI();};

// INIT
audioBoostSlider.value=audioBoostLevel;audioBoostVal.textContent=audioBoostLevel.toFixed(1)+'x';
aiProviderSelect.value=aiProvider;
useAssemblyAIChk.checked=useAssemblyAI;
ttsProviderSelect.value=ttsProvider;
osVoiceSection.classList.toggle('hidden',ttsProvider!=='os');
elevenlabsSection.classList.toggle('hidden',ttsProvider!=='elevenlabs');
updateElevenSliders();
stabSlider.value=elevenSettings.stability;simSlider.value=elevenSettings.similarity_boost;styleSlider.value=elevenSettings.style;boostSlider.value=elevenSettings.speaker_boost?1:0;
function updateElevenSliders(){}
updateActionUI();
renderCategories();
renderPhrases();
renderConversationHistory();
populateVoiceList();
if(elevenApiKey)fetchElevenVoices();
grokSuggestBtn.onclick=generateGrokSuggestions;
console.log("✅ Ready");
</script>
</body>
</html>
