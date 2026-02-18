'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const handleJoinWaitingList = async () => {
    if (!userId) {
      alert('Please enter a user ID.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/waiting/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Automatically redirect to the status page upon successfully joining.
        router.push(`/waiting/${userId}`);
      } else {
        const errorData = await response.json();
        // If the user is already in the list, redirect them to their status page as well.
        if (response.status === 400 && errorData.message.includes('이미 웨이팅 리스트에 등록된 유저입니다.')) {
          router.push(`/waiting/${userId}`);
        } else {
          alert(`Failed to join waiting list: ${errorData.message}`);
        }
      }
    } catch (error) {
      console.error('Error joining waiting list:', error);
      alert('An error occurred while joining the waiting list.');
    }
  };

  const handleCheckStatus = () => {
    if (!userId) {
      alert('Please enter a user ID to check status.');
      return;
    }
    router.push(`/waiting/${userId}`);
  };

  const handleGoToReservation = () => {
    router.push('/reservation');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Waiting System</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="userId" className="block text-gray-700 text-sm font-bold mb-2">
            User ID:
          </label>
          <input
            type="text"
            id="userId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
          />
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleJoinWaitingList}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Join Waiting List
          </button>
          <button
            onClick={handleCheckStatus}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Check Status
          </button>
          <button
            onClick={handleGoToReservation}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go to Reservation
          </button>
        </div>
      </div>
    </div>
  );
}