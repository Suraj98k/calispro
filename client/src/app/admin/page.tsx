import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-soft">Manage platform content from a separate admin area.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/skills"
          className="rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:bg-surface-2"
        >
          <p className="text-sm font-bold uppercase tracking-wide">Skill Programs</p>
          <p className="mt-1 text-sm text-soft">Create, edit, delete, and bulk upload skill programs.</p>
        </Link>
        <Link
          href="/admin/exercises"
          className="rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:bg-surface-2"
        >
          <p className="text-sm font-bold uppercase tracking-wide">Exercises</p>
          <p className="mt-1 text-sm text-soft">Create and manage the exercise library used by users.</p>
        </Link>
        <Link
          href="/admin/workouts"
          className="rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:bg-surface-2"
        >
          <p className="text-sm font-bold uppercase tracking-wide">Workouts</p>
          <p className="mt-1 text-sm text-soft">Create global workouts and manage workout catalog for all users.</p>
        </Link>
      </div>
    </div>
  );
}
