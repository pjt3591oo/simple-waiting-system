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

// Updated time formatting for the new design
function formatWaitTimeForDisplay(seconds: number): { value: string; unit: string } {
  if (seconds < 60) {
    return { value: String(seconds), unit: 'sec' };
  }
  const minutes = Math.floor(seconds / 60);
  return { value: String(minutes), unit: 'min' };
}

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
  
  const handleLeaveQueue = () => {
    router.push('/');
  }

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">Loading your queue status...</p>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="max-w-[1000px] mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-red-600">An Error Occurred</h1>
        <p className="text-lg text-[#60708a] max-w-2xl mx-auto mt-3">{error}</p>
      </div>
    );
  }

  const isInQueue = status?.rank !== null;
  const hasToken = status?.token !== null;
  const progress = (status && isInQueue && !hasToken && status.totalCount > 0)
    ? (1 - (status.rank / status.totalCount)) * 100
    : hasToken ? 100 : 0;
  
  const waitTime = status?.estimatedWaitTime !== null ? formatWaitTimeForDisplay(status.estimatedWaitTime) : { value: '0', unit: 'min' };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111418]">
          {hasToken ? "You're next!" : "Your spot is secured."}
        </h1>
        <p className="text-lg text-[#60708a] max-w-2xl mx-auto">
          {hasToken
            ? "A representative is ready to assist you. Please proceed to the reservation area."
            : "Please keep this window open. We’ll notify you as soon as a representative is ready to assist you."}
        </p>
      </div>

      {/* Main Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#dbdfe6] overflow-hidden">
        <div className="p-8 md:p-12">
            {!hasToken && isInQueue ? (
                <>
                {/* Queue Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="flex flex-col items-center text-center p-6 bg-background-light rounded-xl border border-[#dbdfe6]/50">
                        <span className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Current Position</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black text-[#111418]">{status.rank! + 1}</span>
                            <span className="text-xl font-bold text-[#60708a]">th</span>
                        </div>
                        <p className="text-[#60708a] mt-2 font-medium">of {status.totalCount} in line</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-background-light rounded-xl border border-[#dbdfe6]/50">
                        <span className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Estimated Wait</span>
                         <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black text-[#111418]">{waitTime.value}</span>
                            <span className="text-xl font-bold text-[#60708a]">{waitTime.unit}</span>
                        </div>
                        <p className="text-[#60708a] mt-2 font-medium">Approximate time remaining</p>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-bold text-[#111418]">
                        <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                            Live Queue Progress
                        </span>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs tracking-tighter">{Math.round(progress)}% COMPLETED</span>
                    </div>
                    <div className="h-4 w-full bg-[#f0f2f5] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-[#60708a] uppercase tracking-wider px-1">
                        <span>Joined</span>
                        <span>Almost there</span>
                        <span>Service</span>
                    </div>
                </div>
                </>
            ) : (
                 <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-gray-800">Your token is ready!</h2>
                    <p className="text-gray-500 mt-2">You are no longer in the queue. Please proceed below.</p>
                </div>
            )}
        </div>
        {/* Action Bar */}
        <div className="bg-background-light/50 border-t border-[#dbdfe6] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold text-[#111418]">You are connected as <span className="text-primary">{userId}</span></p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                 {hasToken ? (
                    <button onClick={() => router.push('/reservation')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-black text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all">
                        Proceed to Reservation
                    </button>
                 ) : (
                    <button onClick={handleLeaveQueue} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-all">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Leave Queue
                    </button>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}