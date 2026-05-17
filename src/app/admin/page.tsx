import { cookies } from "next/headers";
import { getUsers, getAllData } from "../actions";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'u1';
  const users = await getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];

  const allData = await getAllData();

  if (currentUser.role !== 'Admin') {
    return <div className="alert alert-danger">Access Denied. Admin role required.</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Admin Control Panel</h1>
      <AdminClient users={users} allData={allData} />
    </div>
  );
}
