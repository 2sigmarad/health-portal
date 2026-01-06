import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Upload, TrendingUp, TrendingDown, Activity, Heart, Droplet, FileText, Download, Plus, X, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Load data from localStorage on mount
  const [healthData, setHealthData] = useState(() => {
    const saved = localStorage.getItem('healthData');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      labs: [],
      dexa: [],
      vo2max: []
    };
  });

  // Save to localStorage whenever healthData changes
  useEffect(() => {
    localStorage.setItem('healthData', JSON.stringify(healthData));
  }, [healthData]);

  // Get latest values for overview cards
  const latestLab = healthData.labs[healthData.labs.length - 1];
  const latestDexa = healthData.dexa[healthData.dexa.length - 1];
  const latestVo2 = healthData.vo2max[healthData.vo2max.length - 1];

  // Calculate trends
  const getTrend = (data, key) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    return ((latest - previous) / previous * 100).toFixed(1);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const parseCSVLabs = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          try {
            const rows = results.data;
            const dates = rows[0].slice(1).filter(d => d); // Get dates from first row
            
            const newLabData = [];
            
            // Find key lab metrics
            const metrics = {
              'Cholesterol S/P': 'cholesterol',
              'Triglycerides': 'triglycerides',
              'LDL': 'ldl',
              'HDL': 'hdl',
              'Glucose': 'glucose',
              'HGB A1C': 'hba1c'
            };
            
            // Parse each date column
            dates.forEach((date, dateIndex) => {
              const colIndex = dateIndex + 1;
              const labEntry = { date: formatDate(date) };
              
              // Extract values for each metric
              rows.forEach(row => {
                const metricName = row[0];
                if (metrics[metricName] && row[colIndex]) {
                  const value = parseFloat(row[colIndex]);
                  if (!isNaN(value)) {
                    labEntry[metrics[metricName]] = value;
                  }
                }
              });
              
              // Only add if we have at least one value
              if (Object.keys(labEntry).length > 1) {
                newLabData.push(labEntry);
              }
            });
            
            resolve(newLabData);
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });
    });
  };

  const parsePDFText = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseDEXAPDF = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';
        }
        
        // Extract key values using regex patterns based on DexaBody format
        const dateMatch = fullText.match(/(?:Measured|Date)[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
        const bodyFatMatch = fullText.match(/(?:Total\s+)?Body\s+Fat[^\d]+([\d.]+)\s*%/i);
        const leanMassMatch = fullText.match(/Lean\s+(?:Mass\s+)?Tissue[^\d]+([\d.]+)\s*lbs/i);
        const fatMassMatch = fullText.match(/Fat\s+(?:Mass\s+)?Tissue[^\d]+([\d.]+)\s*lbs/i);
        const visceralMatch = fullText.match(/Visceral\s+Fat[^\d]+([\d.]+)/i);
        const tScoreMatch = fullText.match(/T-Score[:\s]+([\d.-]+)/i);
        
        if (dateMatch) {
          const dexaEntry = {
            date: formatDate(dateMatch[1]),
            bodyFat: bodyFatMatch ? parseFloat(bodyFatMatch[1]) : null,
            leanMass: leanMassMatch ? parseFloat(leanMassMatch[1]) / 2.205 : null, // Convert lbs to kg
            fatTissue: fatMassMatch ? parseFloat(fatMassMatch[1]) : null,
            visceralFat: visceralMatch ? parseFloat(visceralMatch[1]) : null,
            boneDensity: tScoreMatch ? parseFloat(tScoreMatch[1]) : null
          };
          
          // Remove null values
          Object.keys(dexaEntry).forEach(key => {
            if (dexaEntry[key] === null) delete dexaEntry[key];
          });
          
          resolve([dexaEntry]);
        } else {
          reject(new Error('Could not find date in DEXA PDF. Please make sure it\'s a DexaBody report.'));
        }
      } catch (error) {
        reject(new Error(`PDF parsing failed: ${error.message}`));
      }
    });
  };

  const parseVO2MaxPDF = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';
        }
        
        // Extract VO2 max value and date
        const dateMatch = fullText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        const vo2Match = fullText.match(/Max\s+Values[^]*?VO2\s+([\d.]+)|VO2\s+([\d.]+)/i);
        const hrMaxMatch = fullText.match(/(?:Max\s+Values[^]*?Heart\s+Rate\s+(\d+)|Heart\s+Rate\s+(\d+))/i);
        const restingHRMatch = fullText.match(/Resting.*?(\d+)\s*bpm/i);
        
        if (dateMatch && vo2Match) {
          const vo2Entry = {
            date: formatDate(dateMatch[1]),
            vo2max: parseFloat(vo2Match[1] || vo2Match[2]),
            heartRateMax: hrMaxMatch ? parseInt(hrMaxMatch[1] || hrMaxMatch[2]) : null,
            restingHR: restingHRMatch ? parseInt(restingHRMatch[1]) : 60
          };
          
          // Remove null values
          Object.keys(vo2Entry).forEach(key => {
            if (vo2Entry[key] === null) delete vo2Entry[key];
          });
          
          resolve([vo2Entry]);
        } else {
          reject(new Error('Could not find VO2 max data in PDF. Please check the file format.'));
        }
      } catch (error) {
        reject(new Error(`PDF parsing failed: ${error.message}`));
      }
    });
  };

  const formatDate = (dateStr) => {
    // Handle various date formats and convert to YYYY-MM
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        return `${year}-${month}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleFiles = async (files) => {
    const file = files[0];
    setUploadStatus('Processing...');
    
    try {
      let newData;
      
      if (uploadType === 'labs' && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
        newData = await parseCSVLabs(file);
        setHealthData(prev => ({
          ...prev,
          labs: [...prev.labs, ...newData].sort((a, b) => a.date.localeCompare(b.date))
        }));
        setUploadStatus(`Successfully imported ${newData.length} lab results!`);
      } else if (uploadType === 'dexa' && file.name.endsWith('.pdf')) {
        newData = await parseDEXAPDF(file);
        setHealthData(prev => ({
          ...prev,
          dexa: [...prev.dexa, ...newData].sort((a, b) => a.date.localeCompare(b.date))
        }));
        setUploadStatus('Successfully imported DEXA scan data!');
      } else if (uploadType === 'vo2max' && file.name.endsWith('.pdf')) {
        newData = await parseVO2MaxPDF(file);
        setHealthData(prev => ({
          ...prev,
          vo2max: [...prev.vo2max, ...newData].sort((a, b) => a.date.localeCompare(b.date))
        }));
        setUploadStatus('Successfully imported VO2 Max test results!');
      } else {
        setUploadStatus('Unsupported file type. Please use CSV for labs, PDF for DEXA and VO2max.');
        return;
      }
      
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus('');
        setUploadType('');
      }, 2000);
      
    } catch (error) {
      console.error('Parse error:', error);
      setUploadStatus(`Error parsing file: ${error.message}`);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(healthData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Health Command Center
              </h1>
              <p className="text-slate-400 mt-1 text-sm">Track. Analyze. Optimize.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <Upload size={18} />
                <span className="font-medium">Upload Data</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <Download size={18} />
                <span className="font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'labs', label: 'Lab Results', icon: Droplet },
              { id: 'dexa', label: 'Body Composition', icon: TrendingUp },
              { id: 'vo2max', label: 'Cardio Fitness', icon: Heart },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {healthData.labs.length === 0 && healthData.dexa.length === 0 && healthData.vo2max.length === 0 ? (
          <div className="text-center py-20">
            <Activity size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Health Data Yet</h2>
            <p className="text-slate-400 mb-6">Upload your lab results, DEXA scans, and VO2 max tests to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Upload size={20} />
              Upload Your First Data
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* VO2max Card */}
                  {latestVo2 && (
                    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                          <Heart size={24} className="text-red-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getTrend(healthData.vo2max, 'vo2max') > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {getTrend(healthData.vo2max, 'vo2max') > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {Math.abs(getTrend(healthData.vo2max, 'vo2max'))}%
                        </div>
                      </div>
                      <div className="text-4xl font-bold mb-1">{latestVo2?.vo2max}</div>
                      <div className="text-slate-400 text-sm">VO₂ Max (ml/kg/min)</div>
                      <div className="mt-4 text-xs text-slate-500">Latest: {latestVo2.date}</div>
                    </div>
                  )}

                  {/* Body Fat Card */}
                  {latestDexa && (
                    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <Activity size={24} className="text-blue-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getTrend(healthData.dexa, 'bodyFat') < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {getTrend(healthData.dexa, 'bodyFat') < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                          {Math.abs(getTrend(healthData.dexa, 'bodyFat'))}%
                        </div>
                      </div>
                      <div className="text-4xl font-bold mb-1">{latestDexa?.bodyFat}%</div>
                      <div className="text-slate-400 text-sm">Body Fat Percentage</div>
                      <div className="mt-4 text-xs text-slate-500">Latest: {latestDexa.date}</div>
                    </div>
                  )}

                  {/* Cholesterol Card */}
                  {latestLab && (
                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Droplet size={24} className="text-purple-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getTrend(healthData.labs, 'cholesterol') < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {getTrend(healthData.labs, 'cholesterol') < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                          {Math.abs(getTrend(healthData.labs, 'cholesterol'))}%
                        </div>
                      </div>
                      <div className="text-4xl font-bold mb-1">{latestLab?.cholesterol}</div>
                      <div className="text-slate-400 text-sm">Total Cholesterol (mg/dL)</div>
                      <div className="mt-4 text-xs text-slate-500">Latest: {latestLab.date}</div>
                    </div>
                  )}
                </div>

                {/* Overview Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* VO2max Trend */}
                  {healthData.vo2max.length > 0 && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Heart className="text-red-400" size={20} />
                        Cardiovascular Fitness
                      </h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={healthData.vo2max}>
                          <defs>
                            <linearGradient id="colorVo2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Area type="monotone" dataKey="vo2max" stroke="#ef4444" strokeWidth={3} fill="url(#colorVo2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Body Composition */}
                  {healthData.dexa.length > 0 && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Activity className="text-blue-400" size={20} />
                        Body Composition
                      </h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={healthData.dexa}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="bodyFat" stroke="#3b82f6" strokeWidth={2} name="Body Fat %" />
                          {healthData.dexa[0]?.leanMass && (
                            <Line type="monotone" dataKey="leanMass" stroke="#10b981" strokeWidth={2} name="Lean Mass (kg)" />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Lab Results Tracking</h2>
                  <button
                    onClick={() => { setUploadType('labs'); setShowUploadModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Plus size={18} />
                    Add Lab Results
                  </button>
                </div>

                {healthData.labs.length === 0 ? (
                  <div className="text-center py-12 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
                    <Droplet size={48} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400">No lab results yet. Upload a CSV file to get started.</p>
                  </div>
                ) : (
                  <>
                    {/* Lab Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', optimal: '< 200' },
                        { key: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', optimal: '< 100' },
                        { key: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', optimal: '> 40' },
                        { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', optimal: '< 150' },
                        { key: 'glucose', label: 'Fasting Glucose', unit: 'mg/dL', optimal: '70-100' },
                        { key: 'hba1c', label: 'HbA1c', unit: '%', optimal: '< 5.7' },
                      ].map(metric => {
                        if (!latestLab?.[metric.key]) return null;
                        return (
                          <div key={metric.key} className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-slate-400">{metric.label}</div>
                              <div className="text-xs text-slate-500">Optimal: {metric.optimal}</div>
                            </div>
                            <div className="text-2xl font-bold mb-1">{latestLab?.[metric.key]} <span className="text-sm text-slate-400">{metric.unit}</span></div>
                            {healthData.labs.length > 1 && (
                              <div className={`flex items-center gap-1 text-sm ${getTrend(healthData.labs, metric.key) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {getTrend(healthData.labs, metric.key) < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {Math.abs(getTrend(healthData.labs, metric.key))}% from last test
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Lab Chart */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                      <h3 className="text-xl font-semibold mb-4">Lab Trends Over Time</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={healthData.labs}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Legend />
                          {latestLab?.cholesterol && <Line type="monotone" dataKey="cholesterol" stroke="#a855f7" strokeWidth={2} name="Total Cholesterol" />}
                          {latestLab?.ldl && <Line type="monotone" dataKey="ldl" stroke="#ef4444" strokeWidth={2} name="LDL" />}
                          {latestLab?.hdl && <Line type="monotone" dataKey="hdl" stroke="#10b981" strokeWidth={2} name="HDL" />}
                          {latestLab?.glucose && <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} name="Glucose" />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'dexa' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">DEXA Scan Analysis</h2>
                  <button
                    onClick={() => { setUploadType('dexa'); setShowUploadModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Plus size={18} />
                    Add DEXA Scan
                  </button>
                </div>

                {healthData.dexa.length === 0 ? (
                  <div className="text-center py-12 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
                    <Activity size={48} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400">No DEXA scans yet. Upload a PDF to get started.</p>
                  </div>
                ) : (
                  <>
                    {/* DEXA Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'bodyFat', label: 'Body Fat %', unit: '%' },
                        { key: 'leanMass', label: 'Lean Mass', unit: 'kg' },
                        { key: 'boneDensity', label: 'Bone Density', unit: 'T-Score' },
                        { key: 'visceralFat', label: 'Visceral Fat', unit: 'cm²' },
                      ].map(metric => {
                        if (!latestDexa?.[metric.key]) return null;
                        return (
                          <div key={metric.key} className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
                            <div className="text-sm text-slate-400 mb-2">{metric.label}</div>
                            <div className="text-3xl font-bold mb-1">{latestDexa?.[metric.key]} <span className="text-sm text-slate-400">{metric.unit}</span></div>
                            {healthData.dexa.length > 1 && (
                              <div className={`flex items-center gap-1 text-sm ${
                                (metric.key === 'bodyFat' || metric.key === 'visceralFat') 
                                  ? (getTrend(healthData.dexa, metric.key) < 0 ? 'text-green-400' : 'text-red-400')
                                  : (getTrend(healthData.dexa, metric.key) > 0 ? 'text-green-400' : 'text-red-400')
                              }`}>
                                {((metric.key === 'bodyFat' || metric.key === 'visceralFat') 
                                  ? getTrend(healthData.dexa, metric.key) < 0 
                                  : getTrend(healthData.dexa, metric.key) > 0) ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {Math.abs(getTrend(healthData.dexa, metric.key))}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* DEXA Charts */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                      <h3 className="text-xl font-semibold mb-4">Body Composition Trends</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={healthData.dexa}>
                          <defs>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="bodyFat" stroke="#3b82f6" fill="url(#colorFat)" name="Body Fat %" />
                          {healthData.dexa[0]?.leanMass && (
                            <Area type="monotone" dataKey="leanMass" stroke="#10b981" fill="url(#colorMass)" name="Lean Mass (kg)" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'vo2max' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Cardiovascular Fitness Assessment</h2>
                  <button
                    onClick={() => { setUploadType('vo2max'); setShowUploadModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Plus size={18} />
                    Add VO₂ Max Test
                  </button>
                </div>

                {healthData.vo2max.length === 0 ? (
                  <div className="text-center py-12 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
                    <Heart size={48} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400">No VO₂ Max tests yet. Upload a PDF to get started.</p>
                  </div>
                ) : (
                  <>
                    {/* VO2max Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { key: 'vo2max', label: 'VO₂ Max', unit: 'ml/kg/min', desc: 'Cardiovascular fitness' },
                        { key: 'heartRateMax', label: 'Max Heart Rate', unit: 'bpm', desc: 'Peak exercise capacity' },
                        { key: 'restingHR', label: 'Resting HR', unit: 'bpm', desc: 'Cardiovascular efficiency' },
                      ].map(metric => {
                        if (!latestVo2?.[metric.key]) return null;
                        return (
                          <div key={metric.key} className="bg-black/40 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
                            <div className="text-sm text-slate-400 mb-2">{metric.label}</div>
                            <div className="text-4xl font-bold mb-1">{latestVo2?.[metric.key]} <span className="text-base text-slate-400">{metric.unit}</span></div>
                            <div className="text-xs text-slate-500 mb-3">{metric.desc}</div>
                            {healthData.vo2max.length > 1 && (
                              <div className={`flex items-center gap-1 text-sm ${
                                metric.key === 'restingHR' 
                                  ? (getTrend(healthData.vo2max, metric.key) < 0 ? 'text-green-400' : 'text-red-400')
                                  : (getTrend(healthData.vo2max, metric.key) > 0 ? 'text-green-400' : 'text-red-400')
                              }`}>
                                {metric.key === 'restingHR'
                                  ? (getTrend(healthData.vo2max, metric.key) < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />)
                                  : (getTrend(healthData.vo2max, metric.key) > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
                                {Math.abs(getTrend(healthData.vo2max, metric.key))}% from last test
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* VO2max Chart */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                      <h3 className="text-xl font-semibold mb-4">VO₂ Max Progress</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={healthData.vo2max}>
                          <defs>
                            <linearGradient id="colorVo2Detailed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Area type="monotone" dataKey="vo2max" stroke="#ef4444" strokeWidth={3} fill="url(#colorVo2Detailed)" name="VO₂ Max" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Upload Health Data</h3>
              <button onClick={() => { setShowUploadModal(false); setUploadType(''); setUploadStatus(''); }} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {!uploadType && (
              <div className="space-y-4">
                <p className="text-slate-400 mb-6">What type of data would you like to upload?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { type: 'labs', label: 'Lab Results', icon: Droplet, desc: 'CSV spreadsheet' },
                    { type: 'dexa', label: 'DEXA Scan', icon: Activity, desc: 'PDF report' },
                    { type: 'vo2max', label: 'VO₂ Max Test', icon: Heart, desc: 'PDF report' },
                  ].map(option => (
                    <button
                      key={option.type}
                      onClick={() => setUploadType(option.type)}
                      className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                    >
                      <option.icon className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
                      <div className="font-semibold mb-1">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uploadType && (
              <div>
                <button 
                  onClick={() => { setUploadType(''); setUploadStatus(''); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  Back to selection
                </button>

                {uploadStatus && (
                  <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                    uploadStatus.includes('Success') ? 'bg-green-500/20 border border-green-500/30' : 
                    uploadStatus.includes('Error') ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-blue-500/20 border border-blue-500/30'
                  }`}>
                    {uploadStatus.includes('Success') ? <CheckCircle className="text-green-400" size={20} /> :
                     uploadStatus.includes('Error') ? <AlertCircle className="text-red-400" size={20} /> :
                     <Activity className="text-blue-400 animate-spin" size={20} />}
                    <span>{uploadStatus}</span>
                  </div>
                )}

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-lg mb-2">Drop your {uploadType === 'labs' ? 'CSV' : 'PDF'} file here</p>
                  <p className="text-sm text-slate-400 mb-4">or</p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      onChange={handleFileInput}
                      accept={uploadType === 'labs' ? '.csv,.xlsx' : '.pdf'}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-4">
                    {uploadType === 'labs' ? 'Supported: CSV, Excel' : 'Supported: PDF'}
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-slate-300">
                      <strong className="text-white">File Format:</strong> 
                      {uploadType === 'labs' && ' CSV with lab names in rows, dates in columns (like your tracker)'}
                      {uploadType === 'dexa' && ' PDF from DexaBody or similar DEXA scan provider'}
                      {uploadType === 'vo2max' && ' PDF from VO2 max test (e.g., University of Utah PEAK format)'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}