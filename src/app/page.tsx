import { cookies } from "next/headers";
import { getUsers, getGoals, getTeam, getAllData } from "./actions";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'u1';
  const users = await getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];
  
  const allData = await getAllData();
  
  return (
    <div>
      <h1 style={{ marginBottom: '1rem', fontSize: '2rem', color: 'var(--text-primary)' }}>
        Welcome, {currentUser.name}
      </h1>
      
      {currentUser.role === 'Employee' && (
        <EmployeeDashboard currentUser={currentUser} />
      )}
      
      {currentUser.role === 'Manager' && (
        <ManagerDashboard currentUser={currentUser} users={users} allData={allData} />
      )}
      
      {currentUser.role === 'Admin' && (
        <AdminDashboard users={users} allData={allData} />
      )}
    </div>
  );
}

function EmployeeDashboard({ currentUser }: { currentUser: any }) {
  return (
    <div className="grid">
      <div className="card">
        <h3>My Goals</h3>
        <p className="mt-4 text-secondary">Manage your goals and track progress.</p>
        <div className="mt-4">
          <Link href="/goals" className="btn btn-primary">Go to Goals</Link>
        </div>
      </div>
      <div className="card">
        <h3>Quarterly Check-ins</h3>
        <p className="mt-4 text-secondary">Log your achievements and track progress.</p>
        <div className="mt-4">
          <Link href="/goals?tab=checkins" className="btn btn-secondary">Update Progress</Link>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard({ currentUser, users, allData }: { currentUser: any, users: any[], allData: any }) {
  const team = users.filter(u => u.managerId === currentUser.id);
  const teamGoals = allData.goals.filter((g: any) => team.some(t => t.id === g.employeeId));
  const pendingApprovals = teamGoals.filter((g: any) => g.status === 'Submitted');

  return (
    <div className="grid">
      <div className="card">
        <h3>Team Overview</h3>
        <div className="mt-4 flex flex-col gap-2">
          <p><strong>{team.length}</strong> Team Members</p>
          <p><strong>{teamGoals.length}</strong> Total Goals</p>
        </div>
        <div className="mt-4">
          <Link href="/team" className="btn btn-primary">View Team Dashboard</Link>
        </div>
      </div>
      <div className="card" style={{ borderColor: pendingApprovals.length > 0 ? 'var(--warning)' : 'var(--border)' }}>
        <h3>Pending Approvals</h3>
        <div className="mt-4">
          <h2 style={{ fontSize: '2.5rem', color: pendingApprovals.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {pendingApprovals.length}
          </h2>
          <p className="text-secondary mt-4">Goals awaiting your approval.</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ users, allData }: { users: any[], allData: any }) {
  const submittedGoals = allData.goals.filter((g: any) => g.status === 'Submitted').length;
  const approvedGoals = allData.goals.filter((g: any) => g.status === 'Approved').length;
  const draftGoals = allData.goals.filter((g: any) => g.status === 'Draft' || g.status === 'Returned').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid">
        <div className="card">
          <h3>Organization Stats</h3>
          <div className="mt-4 flex flex-col gap-2">
            <p><strong>{users.length}</strong> Total Employees</p>
            <p><strong>{allData.goals.length}</strong> Total Goals</p>
          </div>
        </div>
        <div className="card">
          <h3>Goal Status Breakdown</h3>
          <div className="mt-4 flex flex-col gap-2">
            <p><span className="badge badge-approved" style={{width:'80px', textAlign:'center'}}>Approved</span> {approvedGoals}</p>
            <p><span className="badge badge-submitted" style={{width:'80px', textAlign:'center'}}>Submitted</span> {submittedGoals}</p>
            <p><span className="badge badge-draft" style={{width:'80px', textAlign:'center'}}>Draft</span> {draftGoals}</p>
          </div>
        </div>
        <div className="card">
          <h3>Shared KPIs</h3>
          <p className="mt-4 text-secondary">Push departmental KPIs to employees.</p>
          <div className="mt-4">
            <Link href="/admin" className="btn btn-primary">Manage Shared Goals</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
