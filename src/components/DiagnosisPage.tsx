import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Info, Clock, Activity, Thermometer } from 'lucide-react';

interface TumorInfo {
  name: string;
  description: string;
  survivalRate: {
    oneYear: number;
    fiveYear: number;
    tenYear: number;
  };
  riskLevel: 'low' | 'moderate' | 'high';
  commonSymptoms: string[];
  treatmentOptions: string[];
}

const tumorDatabase: Record<string, TumorInfo> = {
  'Glioma': {
    name: 'Glioma',
    description: 'Tumors that begin in glial cells that surround and support neurons in the brain.',
    survivalRate: {
      oneYear: 42,
      fiveYear: 17,
      tenYear: 10
    },
    riskLevel: 'high',
    commonSymptoms: [
      'Headaches',
      'Seizures',
      'Memory loss',
      'Physical weakness',
      'Cognitive decline'
    ],
    treatmentOptions: [
      'Surgery',
      'Radiation therapy',
      'Chemotherapy',
      'Targeted drug therapy',
      'Clinical trials'
    ]
  },
  'Meningioma': {
    name: 'Meningioma',
    description: 'Tumors that arise from the meninges — the membranes that surround the brain and spinal cord.',
    survivalRate: {
      oneYear: 85,
      fiveYear: 70,
      tenYear: 62
    },
    riskLevel: 'moderate',
    commonSymptoms: [
      'Headaches',
      'Hearing loss',
      'Vision problems',
      'Memory loss',
      'Seizures'
    ],
    treatmentOptions: [
      'Observation',
      'Surgery',
      'Radiation therapy',
      'Radiosurgery'
    ]
  },
  'Pituitary tumor': {
    name: 'Pituitary Tumor',
    description: 'Abnormal growths that develop in the pituitary gland at the base of the brain.',
    survivalRate: {
      oneYear: 92,
      fiveYear: 82,
      tenYear: 76
    },
    riskLevel: 'low',
    commonSymptoms: [
      'Headaches',
      'Vision problems',
      'Hormonal imbalances',
      'Fatigue',
      'Unexplained weight changes'
    ],
    treatmentOptions: [
      'Medication',
      'Surgery',
      'Radiation therapy',
      'Hormone replacement'
    ]
  },
  'No tumor detected': {
    name: 'No Tumor Detected',
    description: 'No evidence of tumor presence in the brain tissue.',
    survivalRate: {
      oneYear: 100,
      fiveYear: 100,
      tenYear: 100
    },
    riskLevel: 'low',
    commonSymptoms: [],
    treatmentOptions: []
  }
};

const DiagnosisPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [diagnosisConfidence, setDiagnosisConfidence] = useState<number | null>(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset detailed report view
    setShowDetailedReport(false);
    
    // Simulate diagnosis after file upload
    setTimeout(() => {
      const results = ['Glioma', 'Meningioma', 'No tumor detected', 'Pituitary tumor'];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      const randomConfidence = Math.floor(Math.random() * 20) + 80; // 80-99%
      setDiagnosisResult(randomResult);
      setDiagnosisConfidence(randomConfidence);
    }, 2000);
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
    setDiagnosisResult(null);
    setDiagnosisConfidence(null);
    setShowDetailedReport(false);
  };

  const generateDetailedReport = () => {
    setShowDetailedReport(true);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Brain Tumor Diagnosis
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Upload an MRI scan image to detect and classify potential brain tumors using our advanced AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50">
          <h2 className="text-2xl font-semibold mb-6">Upload MRI Scan</h2>
          
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload size={48} className="text-gray-400 mb-4" />
              <p className="text-center text-gray-400 mb-2">Drag and drop your MRI scan here</p>
              <p className="text-center text-gray-500 text-sm mb-4">or click to browse files</p>
              <p className="text-center text-gray-600 text-xs">Supported formats: JPG, PNG, DICOM</p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative h-80 rounded-xl overflow-hidden">
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="MRI Preview" 
                  className="w-full h-full object-contain bg-black"
                />
              )}
              <button 
                onClick={resetUpload}
                className="absolute top-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Guidelines for best results:</h3>
            <ul className="text-gray-400 space-y-2">
              <li className="flex items-start">
                <Info size={16} className="mr-2 mt-1 text-blue-400" />
                <span>Use high-resolution MRI scans for more accurate diagnosis</span>
              </li>
              <li className="flex items-start">
                <Info size={16} className="mr-2 mt-1 text-blue-400" />
                <span>Ensure the scan clearly shows the brain structure</span>
              </li>
              <li className="flex items-start">
                <Info size={16} className="mr-2 mt-1 text-blue-400" />
                <span>T1-weighted and T2-weighted MRI scans are both supported</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50">
          <h2 className="text-2xl font-semibold mb-6">Diagnosis Results</h2>
          
          {!diagnosisResult ? (
            <div className="h-80 flex flex-col items-center justify-center border border-zinc-800 rounded-xl">
              <AlertCircle size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-400 text-center">
                {file ? 'Analyzing your scan...' : 'Upload an MRI scan to see diagnosis results'}
              </p>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border border-zinc-800 rounded-xl p-6 overflow-y-auto">
              {diagnosisResult === 'No tumor detected' ? (
                <CheckCircle size={64} className="text-green-500 mb-6" />
              ) : (
                <AlertCircle size={64} className="text-amber-500 mb-6" />
              )}
              
              <h3 className="text-2xl font-bold mb-2">
                {diagnosisResult}
              </h3>
              
              <div className="w-full max-w-xs bg-zinc-800 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full ${
                    diagnosisResult === 'No tumor detected' ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${diagnosisConfidence}%` }}
                ></div>
              </div>
              
              <p className="text-gray-400 text-center mb-4">
                Confidence: <span className="font-semibold">{diagnosisConfidence}%</span>
              </p>
              
              {/* Survival Rate */}
              {diagnosisResult && tumorDatabase[diagnosisResult] && (
                <div className="w-full max-w-xs">
                  <h4 className="font-semibold text-center mb-2">Survival Rate</h4>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-zinc-800/70 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-400">1-Year</p>
                      <p className="font-bold text-lg">{tumorDatabase[diagnosisResult].survivalRate.oneYear}%</p>
                    </div>
                    <div className="bg-zinc-800/70 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-400">5-Year</p>
                      <p className="font-bold text-lg">{tumorDatabase[diagnosisResult].survivalRate.fiveYear}%</p>
                    </div>
                    <div className="bg-zinc-800/70 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-400">10-Year</p>
                      <p className="font-bold text-lg">{tumorDatabase[diagnosisResult].survivalRate.tenYear}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-500 text-xs text-center">
                This is a simulated result for demonstration purposes only. 
                Always consult with a medical professional for actual diagnosis.
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">What happens next?</h3>
            <p className="text-gray-400 mb-4">
              Our AI provides an initial assessment, but it's important to follow up with a healthcare professional for a complete diagnosis.
            </p>
            <button 
              onClick={generateDetailedReport}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={!diagnosisResult}
            >
              Generate Detailed Report
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Report Section */}
      {showDetailedReport && diagnosisResult && tumorDatabase[diagnosisResult] && (
        <div className="mt-12 bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Detailed Diagnosis Report
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classification Details */}
            <div className="bg-zinc-800/30 p-6 rounded-xl border border-zinc-700/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle size={20} className="mr-2 text-blue-400" />
                Classification
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tumor Type</p>
                  <p className="font-semibold text-lg">{tumorDatabase[diagnosisResult].name}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Description</p>
                  <p>{tumorDatabase[diagnosisResult].description}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Risk Level</p>
                  <p className={`font-semibold ${getRiskLevelColor(tumorDatabase[diagnosisResult].riskLevel)}`}>
                    {tumorDatabase[diagnosisResult].riskLevel.charAt(0).toUpperCase() + tumorDatabase[diagnosisResult].riskLevel.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Survival Rate Details */}
            <div className="bg-zinc-800/30 p-6 rounded-xl border border-zinc-700/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock size={20} className="mr-2 text-purple-400" />
                Survival Statistics
              </h3>
              
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">Survival Rate by Duration</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>1-Year Survival</span>
                      <span className="font-semibold">{tumorDatabase[diagnosisResult].survivalRate.oneYear}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${tumorDatabase[diagnosisResult].survivalRate.oneYear}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>5-Year Survival</span>
                      <span className="font-semibold">{tumorDatabase[diagnosisResult].survivalRate.fiveYear}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${tumorDatabase[diagnosisResult].survivalRate.fiveYear}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>10-Year Survival</span>
                      <span className="font-semibold">{tumorDatabase[diagnosisResult].survivalRate.tenYear}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full" 
                        style={{ width: `${tumorDatabase[diagnosisResult].survivalRate.tenYear}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Survival rates are based on historical data and may vary based on individual factors including age, overall health, and treatment response.
              </p>
            </div>
            
            {/* Treatment & Symptoms */}
            <div className="bg-zinc-800/30 p-6 rounded-xl border border-zinc-700/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Activity size={20} className="mr-2 text-pink-400" />
                Clinical Information
              </h3>
              
              {diagnosisResult !== 'No tumor detected' ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Common Symptoms</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {tumorDatabase[diagnosisResult].commonSymptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Treatment Options</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {tumorDatabase[diagnosisResult].treatmentOptions.map((treatment, index) => (
                        <li key={index}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <p className="text-center">No abnormalities detected that require treatment.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
            <div className="flex items-start">
              <Thermometer className="text-blue-400 mr-3 mt-1" size={20} />
              <div>
                <h4 className="font-semibold mb-1">Important Note</h4>
                <p className="text-sm text-gray-400">
                  This report is generated for informational purposes only and should not be used as a substitute for professional medical advice. 
                  Please consult with a qualified healthcare provider for proper diagnosis and treatment recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Brain Tumor Classification */}
      <div className="mt-12 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
        <h2 className="text-2xl font-semibold mb-4">About Brain Tumor Classification</h2>
        <p className="text-gray-400 mb-6">
          Our AI system is trained to identify and classify several types of brain tumors from MRI scans, including:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-800/50 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Glioma</h3>
            <p className="text-sm text-gray-400">
              Tumors that occur in the brain and spinal cord, starting in glial cells that surround nerve cells.
            </p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Meningioma</h3>
            <p className="text-sm text-gray-400">
              Tumors that arise from the meninges — the membranes that surround the brain and spinal cord.
            </p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Pituitary</h3>
            <p className="text-sm text-gray-400">
              Tumors that form in the pituitary gland, which is located at the base of the brain.
            </p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">No Tumor</h3>
            <p className="text-sm text-gray-400">
              Classification indicating no detectable tumor presence in the provided MRI scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisPage;