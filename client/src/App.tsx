import React from 'react';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">HealthcareCRM</h1>
      <p className="text-lg mb-8">HIPAA-Compliant Healthcare Management Solution</p>

      <div className="flex gap-4">
        <a href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </a>
        <a href="/auth/register" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
          Sign Up
        </a>
      </div>
      <Toaster />
    </div>
  );
}

export default App;