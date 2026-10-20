import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/new')({
  component: WizardLayout,
});

function WizardLayout() {
  return (
    <div className="p-8 max-w-xl mx-auto border border-gray-200 rounded-lg shadow-sm mt-10">
      <h2 className="text-2xl font-bold mb-2">Provision Infrastructure</h2>
      {/* The breadcrumbs emphasize the human journey */}
      <div className="flex space-x-2 text-sm text-gray-500 mb-8 border-b pb-4">
        <span>1. Configuration</span>
        <span>→</span>
        <span>2. Region</span>
        <span>→</span>
        <span>3. Review</span>
      </div>

      {/* The child routes (step-1, step-2, step-3) will render here */}
      <Outlet />
    </div>
  );
}