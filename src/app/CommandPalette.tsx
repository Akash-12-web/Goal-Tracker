'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands = [
    { name: 'Go to Dashboard', action: () => router.push('/') },
    { name: 'View My Goals', action: () => router.push('/goals') },
    { name: 'View Team Goals', action: () => router.push('/team') },
    { name: 'Analytics Dashboard', action: () => router.push('/analytics') },
    { name: 'Admin Panel', action: () => router.push('/admin') },
    { name: 'Toggle Theme', action: () => document.querySelector('button[title="Toggle Dark Mode"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) }
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input 
          type="text" 
          placeholder="Type a command or search... (↑↓ to navigate, Enter to select)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="command-list">
          {filteredCommands.length === 0 ? (
            <div className="command-item text-gray">No commands found</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div 
                key={cmd.name}
                className={`command-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  cmd.action();
                  setIsOpen(false);
                  setQuery('');
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                {cmd.name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
