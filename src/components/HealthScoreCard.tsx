import React, { useState, useEffect } from 'react';
import { calculateHealthScore, HealthScoreResponse, HealthDataPayload } from '../services/api';

interface HealthScoreCardProps {
  healthData: HealthDataPayload;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthData }) => {
  const [scoreData, setScoreData] = useState<HealthScoreResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if at least one health metric is provided
    const hasData = Object.values(healthData).some(
      (val) => val !== null && val !== undefined && (Array.isArray(val) ? val.length > 0 : true)
    );

    if (!hasData) return;

    const fetchSqcore = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await calculateHealthScore(healthData);
        setScoreData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to calculate health score.');
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [healthData]);

  if (loading) {
    return (
      <div className="p-5 border rounded-xl bg-white shadow-sm text-sm text-gray-500 animate-pulse">
        Calculating Health Score...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-xl bg-red-50 text-xs text-red-600">
        {error}
      </div>
    );
  }

  if (!scoreData || scoreData.overallScore === null) {
    return null;
  }

  return (
    <div className="p-5 border rounded-xl bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Application Wellness Score</h3>
          <p className="text-xs text-gray-500">
            Based on {scoreData.indicatorsUsed} of {scoreData.indicatorsTotal} available indicators
          </p>
        </div>
        <div className="text-3xl font-bold text-blue-600">
          {scoreData.overallScore}
          <span className="text-sm font-normal text-gray-400">/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(scoreData.components).map(([key, comp]) => (
          <div key={key} className="text-xs space-y-1">
            <div className="flex justify-between font-medium text-gray-700">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span>{comp.score}/{comp.maxScore} pts</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  comp.status === 'good' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500">{comp.note}</p>
          </div>
        ))}
      </div>

      {scoreData.positiveIndicators.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-emerald-700 mb-1">Positive Indicators:</h4>
          <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
            {scoreData.positiveIndicators.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {scoreData.attentionIndicators.length > 0 && (
        <div className="pt-1">
          <h4 className="text-xs font-semibold text-amber-700 mb-1">Areas for Attention:</h4>
          <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
            {scoreData.attentionIndicators.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-gray-400 border-t pt-3 italic">
        {scoreData.disclaimer}
      </p>
    </div>
  );
};