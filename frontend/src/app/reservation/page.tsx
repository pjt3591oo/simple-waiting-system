'use client';

import { useState } from 'react';

export default function ReservationPage() {
  const [reservationData, setReservationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('waiting-token');
      if (!token) {
        throw new Error('No authentication token found. Please get a token from the waiting list first.');
      }

      const response = await fetch('http://localhost:3000/reservation', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reservation data');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Reservation Page</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <p className="mb-4 text-gray-700">
          This page demonstrates accessing a protected API endpoint. A dummy JWT token is used for authentication.
        </p>
        <button
          onClick={fetchReservationData}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Fetch Reservation Data'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {reservationData && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-semibold">Reservation Data:</p>
            <pre className="whitespace-pre-wrap break-all text-sm">{JSON.stringify(reservationData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
