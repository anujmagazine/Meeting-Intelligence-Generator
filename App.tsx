
import React, { useState, useRef } from 'react';
import { analyzeMeeting } from './services/geminiService';
import { MeetingAnalysis, InputMode } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
// Fix: Added missing Lightbulb import
import { FileAudio, FileText, Loader2, Upload, Sparkles, BrainCircuit, Globe, Mic, Lightbulb } from 'lucide-react';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('audio');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/') || selectedFile.name.endsWith('.mp3') || selectedFile.name.endsWith('.m4a')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid audio file (MP3 or M4A).');
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const startAnalysis = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage('Intitializing Neural Core...');
    
    try {
      let result: MeetingAnalysis;
      
      if (inputMode === 'audio') {
        if (!file) {
          setError('Please select an audio file first.');
          setLoading(false);
          return;
        }
        setStatusMessage('Encoding audio stream for Gemini...');
        const base64 = await fileToBase64(file);
        setStatusMessage('Identifying speakers and decoding context...');
        result = await analyzeMeeting({
          data: base64,
          mimeType: file.type || 'audio/mpeg'
        });
      } else {
        if (!transcript.trim()) {
          setError('Please enter a meeting transcript.');
          setLoading(false);
          return;
        }
        setStatusMessage('Parsing transcript structures...');
        result = await analyzeMeeting(transcript);
      }
      
      setStatusMessage('Extracting non-obvious patterns...');
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const reset = () => {
    setAnalysis(null);
    setFile(null);
    setTranscript('');
    setError(null);
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
        <Loader2 className="w-24 h-24 text-blue-500 animate-spin relative z-10" />
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-display font-bold gradient-text">{statusMessage}</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Gemini 3 is synthesizing the audio dynamics and identifying the subtle nuances of your conversation...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-white/5 glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={reset}>
            <div className="p-1.5 bg-blue-500 rounded-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">LUMINA</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Documentation</a>
            {analysis && (
              <button 
                onClick={reset}
                className="text-sm font-bold bg-white/5 hover:bg-white/10 text-white px-4 py-1.5 rounded-full border border-white/10 transition-all"
              >
                New Session
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!analysis && !loading && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-display font-bold mb-6 tracking-tight">
                Meeting Intelligence <span className="gradient-text">Redefined.</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Go beyond basic summaries. Uncover power dynamics, creative sparks, and hidden risks buried within your meetings.
              </p>
            </div>

            <div className="glass rounded-[2rem] overflow-hidden">
              <div className="flex border-b border-white/5">
                <button 
                  onClick={() => setInputMode('audio')}
                  className={`flex-1 py-6 flex items-center justify-center gap-3 transition-colors ${inputMode === 'audio' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'hover:bg-white/5 text-slate-500'}`}
                >
                  <FileAudio className="w-5 h-5" />
                  <span className="font-bold">Audio Upload</span>
                </button>
                <button 
                  onClick={() => setInputMode('transcript')}
                  className={`flex-1 py-6 flex items-center justify-center gap-3 transition-colors ${inputMode === 'transcript' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' : 'hover:bg-white/5 text-slate-500'}`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-bold">Raw Transcript</span>
                </button>
              </div>

              <div className="p-10">
                {inputMode === 'audio' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'}`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*,.mp3,.m4a" />
                    <div className={`p-6 rounded-2xl mb-6 ${file ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                      <Upload className={`w-10 h-10 ${file ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    {file ? (
                      <div className="text-center">
                        <p className="text-xl font-bold text-white mb-2">{file.name}</p>
                        <p className="text-sm text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xl font-bold text-white mb-2">Drag and drop audio here</p>
                        <p className="text-sm text-slate-400">Supports .mp3, .m4a, .wav (Up to 50MB)</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Paste your raw meeting transcript, notes, or chat logs here..."
                      className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-3xl p-6 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none font-mono text-sm"
                    />
                  </div>
                )}

                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3">
                    <Globe className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <button 
                  onClick={startAnalysis}
                  disabled={loading || (inputMode === 'audio' ? !file : !transcript.trim())}
                  className="w-full mt-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-3xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <BrainCircuit className="w-6 h-6" />
                  Initiate Lumina Deep Analysis
                </button>
              </div>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-8 glass rounded-3xl border border-white/5">
                <Mic className="text-blue-400 mb-4 w-8 h-8" />
                <h3 className="font-display font-bold text-xl mb-2">Native Audio Support</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Direct processing of audio files with speaker separation and tone analysis.</p>
              </div>
              <div className="p-8 glass rounded-3xl border border-white/5">
                <Globe className="text-purple-400 mb-4 w-8 h-8" />
                <h3 className="font-display font-bold text-xl mb-2">Contextual Grounding</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Analysis that understands project goals and industry-specific nuances.</p>
              </div>
              <div className="p-8 glass rounded-3xl border border-white/5">
                <Lightbulb className="text-amber-400 mb-4 w-8 h-8" />
                <h3 className="font-display font-bold text-xl mb-2">Non-Obvious Insights</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Detects creative breakthrough points and identifies unspoken risks.</p>
              </div>
            </div>
          </div>
        )}

        {loading && <LoadingState />}

        {analysis && <AnalysisDashboard data={analysis} />}
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500 w-5 h-5" />
            <span className="font-display font-bold opacity-50">LUMINA Intelligence Platform</span>
          </div>
          <p className="text-slate-500 text-sm">Powered by Gemini 3 Flash. Built for the future of work.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
