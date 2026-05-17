import { cookies } from "next/headers";
import { getGoals, getCheckIns, getUsers } from "../actions";
import GoalsClient from "./GoalsClient";

export default async function GoalsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'u1';
  const users = await getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];

  const goals = await getGoals(currentUser.id);
  const checkIns = await getCheckIns(currentUser.id);
  const searchParams = await props.searchParams;
  
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>My Goals & Check-ins</h1>
      <GoalsClient 
        currentUser={currentUser} 
        goals={goals} 
        checkIns={checkIns} 
        initialTab={searchParams?.tab === 'checkins' ? 'checkins' : 'goals'} 
      />
    </div>
  );
}
