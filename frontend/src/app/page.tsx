'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinWaitingList = async () => {
    if (!userId) {
      setError('Please enter a user ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/waiting/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok || response.status === 400) { // Also redirect if already in queue
        router.push(`/waiting/${userId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An unknown error occurred.');
        setLoading(false);
      }
    } catch (error) {
      setError('Could not connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[500px] mx-auto px-6 py-24">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-[#dbdfe6]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#111418]">Join the Queue</h1>
          <p className="text-md text-[#60708a] mt-2">Enter your user ID to secure your spot.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-bold text-[#111418] mb-2">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              className="w-full px-4 py-3 border border-[#dbdfe6] rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., user123"
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleJoinWaitingList}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:bg-primary/50"
          >
            {loading ? 'Joining...' : 'Join Waiting List'}
          </button>
          <button
            onClick={handleJoinWaitingList}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-[#dbdfe6] text-[#111418] text-sm font-bold rounded-lg shadow-md hover:bg-gray-200 active:scale-95 transition-all disabled:bg-gray-50"
          >
            Check Status
          </button>
        </div>
      </div>
    </div>
  );
}