// SurvivalTime.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  Gender: string;
  Tumor_Type: string;
  Tumor_Grade: string;
  Tumor_Location: string;
  Treatment: string;
  Treatment_Outcome: string;
  Recurrence_Site: string;
  Age: number | '';
  Time_to_Recurrence_months: number | '';
}

const SurvivalTime: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    Gender: '',
    Tumor_Type: '',
    Tumor_Grade: '',
    Tumor_Location: '',
    Treatment: '',
    Treatment_Outcome: '',
    Recurrence_Site: '',
    Age: '',
    Time_to_Recurrence_months: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dropdown options (adjust values as needed)
  const genderOptions = ['Male', 'Female'];
  const tumorTypeOptions = [
    'Astrocytoma', 'Carcinoma', 'Ependymoma', 'Ganglioglioma', 'Germinoma', 'Glioblastoma',
    'Granuloma', 'Medulloblastoma', 'Meningioma', 'Neurocytoma', 'Oligodendroglioma',
    'Papilloma', 'Schwannoma', 'Tuberculoma'
  ].sort(); // Ensure the list is in alphabetical order
  
  const tumorTypeMapping: Record<string, string> = {
    'Glioblastoma': 'Glioblastoma',
    'Meningioma': 'Meningioma',
    'Astrocytoma': 'Astrocytoma',
    'Carcinoma': 'Glioblastoma',
    'Ependymoma': 'Astrocytoma',
    'Ganglioglioma': 'Astrocytoma',
    'Germinoma': 'Glioblastoma',
    'Granuloma': 'Meningioma',
    'Medulloblastoma': 'Astrocytoma',
    'Neurocytoma': 'Astrocytoma',
    'Oligodendroglioma': 'Astrocytoma',
    'Papilloma': 'Meningioma',
    'Schwannoma': 'Meningioma',
    'Tuberculoma': 'Meningioma'
  };
  const tumorGradeOptions = ['I', 'II', 'III', 'IV'];
  const tumorLocationOptions = ['Frontal lobe', 'Temporal lobe', 'Parietal lobe', 'Occipital lobe'];
  const treatmentOptions = ['Surgery', 'Chemotherapy', 'Radiation', 'Surgery + Radiation therapy', 'Chemotherapy + Radiation'];
  const treatmentOutcomeOptions = ['Complete response', 'Partial response', 'Progressive disease', 'Stable disease'];
  const recurrenceSiteOptions = ['Frontal lobe', 'Temporal lobe', 'Parietal lobe', 'Occipital lobe'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Age' || name === 'Time_to_Recurrence_months' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setError(null);
  
    const transformedData = {
      ...formData,
      Tumor_Type: tumorTypeMapping[formData.Tumor_Type] || 'Glioblastoma', // Map value before sending
    };
  
    try {
      const response = await axios.post('http://localhost:8000/predict', transformedData);
      setPrediction(response.data.predicted_survival_time_months);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Survival Time Prediction
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Enter patient details to predict the survival time based on our AI model.
        </p>
        {prediction !== null && (
  <div className="mt-6 flex flex-col items-center justify-center p-6 bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50">
    <AlertCircle size={48} className="text-red-500 mb-4" /> {/* Red exclamatory icon */}
    <h2 className="text-2xl font-bold mb-2">Predicted Survival Time</h2>
    <p className="text-gray-300 text-lg">
      {Math.floor(prediction)} months {Math.round((prediction % 1) * 30)} days
    </p>
  </div>
)}

      </div>
      
      <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Gender</label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              <option value="" disabled>Select Gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Tumor Type Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Tumor Type</label>
            <select
              name="Tumor_Type"
              value={formData.Tumor_Type}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              {["", ...tumorTypeOptions].map((option, index) => (
                <option key={index} value={option} disabled={option === ""}>
                  {option === "" ? "Select Tumor Type" : option}
                </option>
              ))}
            </select>
          </div>

          {/* Tumor Grade Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Tumor Grade</label>
            <select
              name="Tumor_Grade"
              value={formData.Tumor_Grade}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              <option value="" disabled>Select Tumor Grade</option>
              {tumorGradeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Tumor Location Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Tumor Location</label>
            <select
              name="Tumor_Location"
              value={formData.Tumor_Location}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              <option value="" disabled>Select Tumor Location</option>
              {tumorLocationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Treatment Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Treatment</label>
            <select
              name="Treatment"
              value={formData.Treatment}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              <option value="" disabled>Select Treatment</option>
              {treatmentOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Treatment Outcome Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Treatment Outcome</label>
            <select
              name="Treatment_Outcome"
              value={formData.Treatment_Outcome}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              <option value="" disabled>Select Outcome</option>
              {treatmentOutcomeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Recurrence Site Dropdown */}
          <div>
            <label className="block text-gray-300 mb-2">Recurrence Site</label>
            <select
              name="Recurrence_Site"
              value={formData.Recurrence_Site}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              required
            >
              <option value="" disabled>Select Recurrence Site</option>
              {recurrenceSiteOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Age Input */}
          <div>
            <label className="block text-gray-300 mb-2">Age</label>
            <input
              type="number"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              placeholder="45"
              required
            />
          </div>

          {/* Time to Recurrence Input */}
          <div>
            <label className="block text-gray-300 mb-2">Time to Recurrence (months)</label>
            <input
              type="number"
              name="Time_to_Recurrence_months"
              value={formData.Time_to_Recurrence_months}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-zinc-800 border border-zinc-700"
              placeholder="10"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Predicting...' : 'Predict Survival Time'}
        </button>
      </form>

      {error && (
        <div className="mt-6 flex items-center justify-center text-red-500">
          <AlertCircle size={24} className="mr-2" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SurvivalTime;
