import { cookies } from "next/headers";
import { getUsers, getAllData } from "../actions";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'u1';
  const users = await getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];

  const allData = await getAllData();

  if (currentUser.role === 'Employee') {
    return <div className="alert alert-danger">Access Denied. Manager or Admin role required.</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Analytics Dashboard</h1>
      <AnalyticsClient users={users} allData={allData} currentUser={currentUser} />
    </div>
  );
}
