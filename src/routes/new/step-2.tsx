import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/new/step-2')({
  component: Step2,
  // This ensures TanStack Router strictly types the search params from Step 1
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: search.name as string,
      dbType: search.dbType as 'PostgreSQL' | 'MongoDB' | 'Redis',
    };
  },
});

function Step2() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/new/step-2' });

  const [region, setRegion] = useState<'ap-south-1' | 'us-east-1' | 'eu-central-1'>('ap-south-1');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: '/new/step-3',
      search: { ...search, region },
    });
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col space-y-4">
      <div>
        <label className="block text-sm font-medium">AWS Region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as any)}
          className="border p-2 border-gray-300 rounded w-full mt-1"
        >
          <option value="ap-south-1">Mumbai (ap-south-1)</option>
          <option value="us-east-1">N. Virginia (us-east-1)</option>
          <option value="eu-central-1">Frankfurt (eu-central-1)</option>
        </select>
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-gray-600 hover:underline"
        >
          Back
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Review Configuration
        </button>
      </div>
    </form>
  );
}