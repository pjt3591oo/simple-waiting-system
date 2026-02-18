'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// --- Interfaces & Helpers ---
interface WaitingStatus {
  rank: number | null;
  totalCount: number;
  token: string | null;
  processingCount: number;
  estimatedWaitTime: number | null;
}

function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds}초`;
}

// --- SVG Icons ---
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

// --- Main Component ---
export default function WaitingStatusPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [status, setStatus] = useState<WaitingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const fetchWaitingStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/waiting/check?userId=${userId}`);
        if (!response.ok) {
          throw new Error((await response.json()).message || 'Failed to fetch status');
        }
        const data: WaitingStatus = await response.json();
        setStatus(data);
        if (data.token) {
          localStorage.setItem('waiting-token', data.token);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err: any) {
        setError(err.message);
        if (intervalId) clearInterval(intervalId);
      } finally {
        if (loading) setLoading(false);
      }
    };

    if (userId) {
      fetchWaitingStatus();
      intervalId = setInterval(fetchWaitingStatus, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userId, loading]);

  const handleGoToReservation = () => router.push('/reservation');

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Loading status for <span className="font-semibold">{userId}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const isInQueue = status?.rank !== null;
  const progress = (status && isInQueue && status.totalCount > 0) 
    ? ((status.totalCount - status.rank) / status.totalCount) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Position in the Queue</h1>
          <p className="text-gray-500">User: <span className="font-semibold">{userId}</span></p>
        </div>

        {status && isInQueue && !status.token ? (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-center text-indigo-600 mb-1"><UsersIcon /></div>
                <p className="text-sm text-gray-600">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900">{status.rank !== null ? status.rank + 1 : 'N/A'}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-center text-indigo-600 mb-1"><ClockIcon /></div>
                <p className="text-sm text-gray-600">Est. Wait Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {status.estimatedWaitTime !== null ? formatWaitTime(status.estimatedWaitTime) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Gauge */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm font-medium text-gray-700">{status.totalCount} in queue</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{status?.token ? "Your token is ready!" : (status?.rank === null ? "You are not currently in the waiting list." : "You are in the processing queue!")}</p>
          </div>
        )}
        
        {/* Token Area */}
        {status?.token && (
          <div className="mt-6">
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-center">
              <p className="font-semibold text-green-800">Your token is ready!</p>
              <p className="text-xs text-green-700 break-all mt-2">{status.token}</p>
            </div>
            <button
              onClick={handleGoToReservation}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
            >
              Proceed to Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}