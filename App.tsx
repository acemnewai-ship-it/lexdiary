
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import CaseCard from './components/CaseCard';
import { useCases } from './hooks/useCases';
import { CaseType, CaseStatus, Case, UserRole } from './types';
import { CASE_TYPES, REASONS_OF_HEARING, COURT_NAMES, NAV_ITEMS, CLIENT_NAV_ITEMS } from './constants';
import { Plus, Download, Search, Calendar as CalendarIcon, MessageSquare, Send, Sparkles, LogOut, Gavel, User as UserIcon, Shield } from 'lucide-react';
import { summarizeDailyCauseList, chatWithLegalAI } from './services/geminiService';

const App: React.FC = () => {
  const [auth, setAuth] = useState({ role: UserRole.NONE, isLoggedIn: false });
  const [activeTab, setActiveTab] = useState('dashboard');
  const { cases, addCase, disposeCase, deleteCase, exportToCSV, exportCauseListForDate } = useCases();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI State
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [newCase, setNewCase] = useState({
    caseType: CaseType.CIVIL,
    caseNo: '',
    courtName: COURT_NAMES[0],
    appellant: '',
    respondent: '',
    reasonOfHearing: REASONS_OF_HEARING[0],
    nextHearingDate: new Date().toISOString().split('T')[0],
    status: CaseStatus.ACTIVE
  });

  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      c.caseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appellant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.respondent.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cases, searchTerm]);

  const activeCases = cases.filter(c => c.status === CaseStatus.ACTIVE);
  const todayCases = activeCases.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.nextHearingDate === today;
  });

  const handleLogin = (role: UserRole) => {
    setAuth({ role, isLoggedIn: true });
    setActiveTab(role === UserRole.ADVOCATE ? 'dashboard' : 'track');
  };

  const handleLogout = () => {
    setAuth({ role: UserRole.NONE, isLoggedIn: false });
  };

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    addCase(newCase);
    setShowAddModal(false);
    setNewCase({
      caseType: CaseType.CIVIL,
      caseNo: '',
      courtName: COURT_NAMES[0],
      appellant: '',
      respondent: '',
      reasonOfHearing: REASONS_OF_HEARING[0],
      nextHearingDate: new Date().toISOString().split('T')[0],
      status: CaseStatus.ACTIVE
    });
  };

  const getBriefing = async () => {
    setIsAiLoading(true);
    try {
      const summary = await summarizeDailyCauseList(todayCases);
      setAiResponse(summary);
    } catch (error) {
      console.error(error);
      setAiResponse("Failed to get AI briefing.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiChat = async () => {
    if (!chatInput.trim()) return;
    setIsAiLoading(true);
    const query = chatInput;
    setChatInput('');
    try {
      const response = await chatWithLegalAI(query, cases);
      setAiResponse(response);
    } catch (error) {
      setAiResponse("Legal assistant encountered an error.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-xl shadow-indigo-200">L</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">LexDiary</h1>
            <p className="text-slate-500">Professional Case Management System</p>
          </div>
          
          <div className="grid gap-4 mt-8">
            <button 
              onClick={() => handleLogin(UserRole.ADVOCATE)}
              className="group bg-white border-2 border-slate-200 p-6 rounded-2xl flex items-center gap-4 hover:border-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-50"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">Advocate Login</h3>
                <p className="text-xs text-slate-400">Manage cases, diary & cause lists</p>
              </div>
            </button>

            <button 
              onClick={() => handleLogin(UserRole.CLIENT)}
              className="group bg-white border-2 border-slate-200 p-6 rounded-2xl flex items-center gap-4 hover:border-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-50"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">Client Login</h3>
                <p className="text-xs text-slate-400">Track your case status & dates</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdvocate = auth.role === UserRole.ADVOCATE;

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="fixed top-4 right-4 z-[60] md:top-auto md:bottom-20 lg:bottom-4 lg:right-4">
         <button onClick={handleLogout} className="bg-white p-2 rounded-full shadow-md border border-slate-200 text-slate-400 hover:text-rose-500 transition-colors">
           <LogOut className="w-5 h-5" />
         </button>
      </div>

      {isAdvocate && activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-500 text-sm font-medium">Welcome back, Counselor</p>
              <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Case
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Active</span>
              <p className="text-2xl font-bold text-indigo-600">{activeCases.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Today's List</span>
              <p className="text-2xl font-bold text-orange-500">{todayCases.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Disposed</span>
              <p className="text-2xl font-bold text-green-600">{cases.filter(c => c.status === CaseStatus.DISPOSED).length}</p>
            </div>
            <button 
              onClick={exportToCSV}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors group"
            >
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Export List</span>
              <Download className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
            </button>
          </div>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                Today's Cause List
              </h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => todayCases.length > 0 && exportCauseListForDate(new Date().toISOString().split('T')[0])}
                  disabled={todayCases.length === 0}
                  className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:underline disabled:opacity-30"
                >
                  <Download className="w-3 h-3" />
                  Save List
                </button>
                <button 
                  onClick={getBriefing}
                  disabled={isAiLoading || todayCases.length === 0}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Brief
                </button>
              </div>
            </div>

            {isAiLoading && <div className="p-8 text-center text-slate-400 animate-pulse">Loading AI analysis...</div>}
            
            {!isAiLoading && aiResponse && (
              <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-900 text-sm italic relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20"><Sparkles className="w-8 h-8" /></div>
                <div className="whitespace-pre-wrap">{aiResponse}</div>
                <button onClick={() => setAiResponse(null)} className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-600">Dismiss</button>
              </div>
            )}

            <div className="space-y-4">
              {todayCases.length > 0 ? (
                todayCases.map(c => (
                  <CaseCard key={c.id} caseData={c} onDispose={disposeCase} onDelete={deleteCase} />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No hearings scheduled for today.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {isAdvocate && activeTab === 'causelist' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Daily Cause List</h2>
          {Array.from(new Set<string>(activeCases.map(c => c.nextHearingDate))).sort().map(date => (
            <div key={date} className="space-y-3">
              <div className="sticky top-16 bg-slate-50 py-2 z-10 flex items-center gap-3">
                <span className="h-px bg-slate-200 flex-1"></span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </span>
                  <button 
                    onClick={() => exportCauseListForDate(date)}
                    className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
                    title="Download Cause List for this date"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
                <span className="h-px bg-slate-200 flex-1"></span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {activeCases.filter(c => c.nextHearingDate === date).map(c => (
                  <CaseCard key={c.id} caseData={c} onDispose={disposeCase} onDelete={deleteCase} />
                ))}
              </div>
            </div>
          ))}
          {activeCases.length === 0 && (
            <div className="text-center py-20 text-slate-400">No upcoming hearings. Add a case to get started.</div>
          )}
        </div>
      )}

      {isAdvocate && activeTab === 'cases' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800">All Cases</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search case no or parties..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCases.map(c => (
              <CaseCard key={c.id} caseData={c} onDispose={disposeCase} onDelete={deleteCase} />
            ))}
            {filteredCases.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">No cases found matching your search.</div>
            )}
          </div>
        </div>
      )}

      {isAdvocate && activeTab === 'ai' && (
        <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold leading-none">LexAI Assistant</h3>
              <p className="text-[10px] opacity-80 mt-1">AI-powered legal research & drafting help</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {aiResponse ? (
              <div className="flex flex-col gap-2">
                 <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-100">
                    {aiResponse}
                 </div>
                 <button onClick={() => setAiResponse(null)} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest px-4">Clear History</button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">How can I help you today?</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs">Ask me to analyze your case files, suggest arguments for an upcoming hearing, or draft a memo.</p>
                </div>
              </div>
            )}
            {isAiLoading && (
              <div className="flex gap-2 p-4">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your legal query..." 
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
              />
              <button 
                onClick={handleAiChat}
                disabled={isAiLoading}
                className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client View */}
      {!isAdvocate && (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Case Tracker</h2>
            <p className="text-slate-500 text-sm">Find your case details using your Case Number</p>
          </div>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Enter Case No (e.g. WP 1024/2024)" 
              className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-4 max-w-2xl mx-auto mt-8">
            {searchTerm.length > 2 ? (
              filteredCases.length > 0 ? (
                filteredCases.map(c => (
                  <CaseCard key={c.id} caseData={c} readOnly={true} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">No cases found with that number.</div>
              )
            ) : (
              <div className="text-center py-12 text-slate-300 italic">Start typing your case number to search...</div>
            )}
          </div>
        </div>
      )}

      {/* Modal for adding new case (Advocate Only) */}
      {showAddModal && isAdvocate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-lg md:rounded-2xl rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Add New Case</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddCase} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Court Name</label>
                <input 
                  type="text"
                  list="court-names"
                  placeholder="Select or type court name"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  value={newCase.courtName}
                  onChange={(e) => setNewCase({...newCase, courtName: e.target.value})}
                />
                <datalist id="court-names">
                  {COURT_NAMES.map(court => <option key={court} value={court} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Type</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    value={newCase.caseType}
                    onChange={(e) => setNewCase({...newCase, caseType: e.target.value as CaseType})}
                  >
                    {CASE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case No.</label>
                  <input 
                    required
                    type="text" 
                    placeholder="WP 1024/2024"
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    value={newCase.caseNo}
                    onChange={(e) => setNewCase({...newCase, caseNo: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appellant / Petitioner</label>
                <input 
                  required
                  type="text" 
                  placeholder="Enter name"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  value={newCase.appellant}
                  onChange={(e) => setNewCase({...newCase, appellant: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Respondent</label>
                <input 
                  required
                  type="text" 
                  placeholder="Enter name"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  value={newCase.respondent}
                  onChange={(e) => setNewCase({...newCase, respondent: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose of Hearing</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    value={newCase.reasonOfHearing}
                    onChange={(e) => setNewCase({...newCase, reasonOfHearing: e.target.value})}
                  >
                    {REASONS_OF_HEARING.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hearing Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    value={newCase.nextHearingDate}
                    onChange={(e) => setNewCase({...newCase, nextHearingDate: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                Save to Diary
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
