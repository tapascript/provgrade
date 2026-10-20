import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/new/step-1')({
  component: Step1,
});

function Step1() {
  const navigate = useNavigate({ from: '/new/step-1' });
  const [name, setName] = useState('');
  const [dbType, setDbType] = useState<'PostgreSQL' | 'MongoDB' | 'Redis'>('PostgreSQL');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Pushing state to the next route via search params
    navigate({
      to: '/new/step-2',
      search: { name, dbType },
    });
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col space-y-4">
      <div>
        <label className="block text-sm font-medium">Environment Name</label>
        <input
          required
          minLength={3}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 border-gray-300 rounded w-full mt-1"
          placeholder="e.g. staging-cluster"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Database Type</label>
        <select
          value={dbType}
          onChange={(e) => setDbType(e.target.value as any)}
          className="border p-2 border-gray-300 rounded w-full mt-1"
        >
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="MongoDB">MongoDB</option>
          <option value="Redis">Redis</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded self-end hover:bg-blue-700">
        Next: Select Region
      </button>
    </form>
  );
}