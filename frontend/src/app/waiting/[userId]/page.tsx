'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface WaitingStatus {
  rank: number;
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

export default function WaitingStatusPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [status, setStatus] = useState<WaitingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const Gauge = ({ rank, totalCount }: { rank: number; totalCount: number }) => {
    if (rank === null || totalCount === 0) {
      return null;
    }

    const progress = totalCount > 0 ? ((totalCount - rank) / totalCount) * 100 : 0;

    return (
      <div className="w-full bg-gray-200 rounded-full h-4 my-4">
        <div
          className="bg-purple-500 h-4 rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
          style={{ width: `${progress}%` }}
        >
          {`${Math.round(progress)}%`}
        </div>
      </div>
    );
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchWaitingStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/waiting/check?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch waiting status');
        }
        const data: WaitingStatus = await response.json();
        setStatus(data);
        if (data.token) {
          localStorage.setItem('waiting-token', data.token);
          if (intervalId) {
            clearInterval(intervalId); // Stop polling once token is received
          }
        }
      } catch (err: any) {
        setError(err.message);
        if (intervalId) {
          clearInterval(intervalId); // Stop polling on error
        }
      } finally {
        // Only set loading to false on the initial fetch
        if (loading) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchWaitingStatus(); // Initial fetch
      intervalId = setInterval(fetchWaitingStatus, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Cleanup on component unmount
      }
    };
  }, [userId, loading]);

  const handleGoToReservation = () => {
    router.push('/reservation');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading waiting status for {userId}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Waiting Status for {userId}</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {status ? (
          <>
            <p className="text-lg mb-2">
              <span className="font-semibold">Your Rank:</span> {status.rank !== null ? status.rank + 1 : 'Not in list'}
            </p>
            <p className="text-lg mb-2">
              <span className="font-semibold">Total in Waiting:</span> {status.totalCount}
            </p>
            {status.rank !== null && <Gauge rank={status.rank} totalCount={status.totalCount} />}
            {status.rank !== null && status.estimatedWaitTime !== null && (
              <p className="text-lg mb-2 font-bold text-blue-600">
                <span className="font-semibold">Estimated Wait Time:</span> {formatWaitTime(status.estimatedWaitTime)}
              </p>
            )}
            <p className="text-lg mb-2">
              <span className="font-semibold">Processing Count:</span> {status.processingCount}
            </p>
            {status.token && (
              <>
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  <p className="font-semibold">Your Waiting Token:</p>
                  <p className="break-all text-sm">{status.token}</p>
                </div>
                <button
                  onClick={handleGoToReservation}
                  className="mt-4 w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Go to Reservation
                </button>
              </>
            )}
            {!status.token && status.rank !== null && status.rank < status.processingCount && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                <p className="font-semibold">You are in the processing queue!</p>
                <p>Please wait for your turn to be assigned a token.</p>
              </div>
            )}
            {status.rank === null && (
              <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                <p>You are not currently in the waiting list.</p>
              </div>
            )}

          </>
        ) : (
          <p className="text-lg">No waiting status available.</p>
        )}
      </div>
    </div>
  );
} 