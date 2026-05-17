import { cookies } from "next/headers";
import { getUsers, getAllData } from "../actions";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'u1';
  const users = await getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];

  const allData = await getAllData();
  const team = users.filter(u => u.managerId === currentUser.id);

  if (currentUser.role !== 'Manager') {
    return <div className="alert alert-danger">Access Denied. Manager role required.</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Team Dashboard</h1>
      <TeamClient currentUser={currentUser} team={team} allData={allData} />
    </div>
  );
}
