'use client';

import { useState, useEffect } from 'react';

export default function ReservationPage() {
  const [reservationData, setReservationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Client-side check for the token
    const storedToken = localStorage.getItem('waiting-token');
    setToken(storedToken);
    if (!storedToken) {
        setError('No authentication token found. Please join the queue to get a token.');
    }
  }, []);

  const fetchReservationData = async () => {
    if (!token) {
      setError('Cannot fetch data without a token.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/reservation', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to fetch reservation data');
      }
      const data = await response.json();
      setReservationData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto px-6 py-24">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-[#dbdfe6]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#111418]">Protected Area</h1>
          <p className="text-md text-[#60708a] mt-2">This is a protected resource. Use your token to fetch the data.</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={fetchReservationData}
            disabled={loading || !token}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {loading ? 'Fetching Data...' : 'Fetch Reservation Data'}
          </button>

          {error && (
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}

          {reservationData && (
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Data Received:</h3>
                <pre className="p-4 bg-background-light border border-[#dbdfe6] rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(reservationData, null, 2)}
                </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}