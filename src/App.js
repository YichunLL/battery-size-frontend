import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";

const BASE_URL = "https://battery-size-cnn.onrender.com"; // ✅ Ensure this is correct

export default function BatterySizePredictor() {
  const [inputs, setInputs] = useState({
    Length_pack: "",
    Width_pack: "",
    Height_pack: "",
    Energy: "",
    Total_Voltage: ""
  });
  const [prediction, setPrediction] = useState(null);
  const [deepSeekAnalysis, setDeepSeekAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const inputLabels = {
    Length_pack: "Length (mm)",
    Width_pack: "Width (mm)",
    Height_pack: "Height (mm)",
    Energy: "Energy (kWh)",
    Total_Voltage: "Total Voltage (V)"
  };

  const formatNumber = (num) => num ? num.toLocaleString("en-US", { maximumFractionDigits: 2, notation: "standard" }) : "-";

  const cleanLatex = (text) => text
    .replace(/\\\(|\\\)/g, "")
    .replace(/\$.*?\$/g, "")
    .replace(/\^/g, "^ ")
    .replace(/\\times/g, "×")
    .replace(/\\frac{(.*?)}{(.*?)}/g, "($1)/($2)")
    .replace(/\,\text{.*?}/g, "");

  const handleInputChange = (key, value) => {
    setInputs({ ...inputs, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setDeepSeekAnalysis(null);

      const formattedInputs = {
        Length_pack: parseFloat(inputs.Length_pack),
        Width_pack: parseFloat(inputs.Width_pack),
        Height_pack: parseFloat(inputs.Height_pack),
        Energy: parseFloat(inputs.Energy),
        Total_Voltage: parseFloat(inputs.Total_Voltage)
      };

      const response = await axios.post(`${BASE_URL}/predict`, formattedInputs);

      if (!response.data) {
        throw new Error("Invalid response format from API");
      }

      setPrediction(response.data.predictions);
      setDeepSeekAnalysis(cleanLatex(response.data.deepseek_analysis)); // ✅ Remove LaTeX formatting
    } catch (err) {
      setError("❌ Failed to get prediction. Please check API connection.");
      console.error("API Error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-10 text-white">
      <Card className="w-full max-w-3xl p-12 shadow-xl bg-white rounded-3xl text-center text-gray-800">
        <CardContent className="w-full flex flex-col items-center">
          <h1 className="text-4xl font-extrabold mb-6 text-green-700 text-center">
            🔋 Battery Size Predictor with ChatGotion AI
          </h1>
          <p className="mb-6 text-gray-700 text-lg text-center max-w-2xl">
            This model predicts **optimal battery cell dimensions** based on battery pack parameters using a **Convolutional Neural Network (CNN)**.
            <br />
            **ChatGotion AI** enhances predictions by providing insights into:
          </p>
          <ul className="mb-6 text-gray-700 text-lg text-left max-w-2xl list-disc pl-5">
            <li><strong>Battery Cell Design</strong> - Optimizing cell configurations for better efficiency.</li>
            <li><strong>Packing Efficiency</strong> - Evaluating if predicted cell sizes maximize space utilization.</li>
            <li><strong>Power Density</strong> - Assessing if power density meets modern battery performance standards.</li>
          </ul>

          <div className="grid grid-cols-1 gap-8 w-full max-w-md">
            {Object.keys(inputs).map((key) => (
              <div key={key} className="flex flex-col items-center w-full">
                <label className="mb-2 text-gray-800 font-semibold text-lg">
                  {inputLabels[key]}
                </label>
                <input
                  type="number"
                  className="border border-gray-400 rounded-lg p-4 text-center w-full text-lg"
                  value={inputs[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={`Enter ${inputLabels[key].toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} className="mt-10 bg-green-600 text-white p-4 rounded-lg">
            ⚙️ Predict & Optimize
          </Button>

          {prediction && (
            <div className="mt-10 w-full bg-gray-100 p-4 rounded-lg text-gray-800">
              <h2 className="text-xl font-semibold">📊 NN Model Predictions</h2>
              <ul>
                <li><strong>Length Cell:</strong> {formatNumber(prediction.Length_cell)} mm</li>
                <li><strong>Width Cell:</strong> {formatNumber(prediction.Width_cell)} mm</li>
                <li><strong>Height Cell:</strong> {formatNumber(prediction.Height_cell)} mm</li>
                <li><strong>Power Density:</strong> {formatNumber(prediction.Power_density)} Wh/kg</li>
              </ul>
            </div>
          )}

          {deepSeekAnalysis && (
            <div className="mt-10 w-full bg-gray-100 p-4 rounded-lg text-gray-800">
              <h2 className="text-xl font-semibold">🔍 ChatGotion AI Optimization</h2>
              <pre className="whitespace-pre-wrap text-left">{deepSeekAnalysis}</pre>
            </div>
          )}

          {error && (
            <p className="mt-8 text-center text-red-500 font-medium text-lg">
              <span role="img" aria-label="error">❌</span> {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
