import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import Link from "next/link";
import { getUsers } from "./actions";
import ThemeToggle from "./ThemeToggle";
import CommandPalette from "./CommandPalette";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AtomQuest - Goal Setting & Tracking Portal",
  description: "In-House Goal Setting & Tracking Portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'u1';
  const users = await getUsers();
  const currentUser = users.find(u => u.id === userId) || users[0];

  return (
    <html lang="en">
      <body className={inter.className}>
        <CommandPalette />
        <header className="header">
          <div className="header-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            AtomQuest
          </div>
          
          <nav className="header-nav">
            <Link href="/" className="btn btn-secondary" style={{ border: 'none' }}>Dashboard</Link>
            {currentUser.role === 'Employee' && (
              <Link href="/goals" className="btn btn-secondary" style={{ border: 'none' }}>My Goals</Link>
            )}
            {currentUser.role === 'Manager' && (
              <>
                <Link href="/team" className="btn btn-secondary" style={{ border: 'none' }}>Team Goals</Link>
                <Link href="/analytics" className="btn btn-secondary" style={{ border: 'none' }}>Analytics</Link>
              </>
            )}
            {currentUser.role === 'Admin' && (
              <>
                <Link href="/admin" className="btn btn-secondary" style={{ border: 'none' }}>Admin Panel</Link>
                <Link href="/analytics" className="btn btn-secondary" style={{ border: 'none' }}>Analytics</Link>
              </>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
              <span className="badge badge-approved">{currentUser.role}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: 'bold' }}>⭐ {currentUser.xp || 0} XP (Lvl {Math.floor((currentUser.xp || 0) / 100) + 1})</span>
            </div>
            <form action={async (formData) => {
              'use server';
              const newUserId = formData.get('userId') as string;
              (await cookies()).set('userId', newUserId);
            }} style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                name="userId" 
                defaultValue={currentUser.id} 
                className="form-control"
                style={{ padding: '0.25rem 0.5rem', width: 'auto', display: 'inline-block' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Switch</button>
            </form>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
