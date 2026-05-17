'use client';

export default function AnalyticsClient({ users, allData, currentUser }: { users: any[], allData: any, currentUser: any }) {
  // If Manager, filter analytics to their team, if Admin show all
  const isManager = currentUser.role === 'Manager';
  const relevantUsers = isManager ? users.filter(u => u.managerId === currentUser.id) : users.filter(u => u.role === 'Employee');
  const relevantUserIds = relevantUsers.map(u => u.id);
  
  const relevantGoals = allData.goals.filter((g: any) => relevantUserIds.includes(g.employeeId));
  const relevantCheckIns = allData.checkIns.filter((c: any) => relevantGoals.some((g: any) => g.id === c.goalId));

  // Goal Distribution by Thrust Area
  const thrustAreas = ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'];
  const thrustCounts = thrustAreas.map(area => ({
    area,
    count: relevantGoals.filter((g: any) => g.thrustArea === area).length
  }));
  const maxThrustCount = Math.max(...thrustCounts.map(t => t.count), 1);

  // Goal Distribution by UoM
  const uoms = ['Numeric', '%', 'Timeline', 'Zero'];
  const uomCounts = uoms.map(uom => ({
    uom,
    count: relevantGoals.filter((g: any) => g.uom === uom).length
  }));
  const maxUomCount = Math.max(...uomCounts.map(u => u.count), 1);

  // Manager Effectiveness (Only useful for Admin)
  const managers = users.filter(u => u.role === 'Manager');
  const managerStats = managers.map(m => {
    const team = users.filter(u => u.managerId === m.id);
    const teamGoalIds = allData.goals.filter((g: any) => team.some(t => t.id === g.employeeId)).map((g: any) => g.id);
    const checkInsMade = allData.checkIns.filter((c: any) => teamGoalIds.includes(c.goalId)).length;
    const feedbackGiven = allData.checkIns.filter((c: any) => teamGoalIds.includes(c.goalId) && c.checkInComment).length;
    
    return {
      manager: m.name,
      teamSize: team.length,
      checkInsMade,
      feedbackGiven,
      feedbackRate: checkInsMade > 0 ? Math.round((feedbackGiven / checkInsMade) * 100) : 0
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="card mb-4" style={{ padding: 0, overflow: 'hidden', height: '400px', position: 'relative' }}>
         <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
           <h3>Goal Constellation</h3>
           <p className="text-secondary text-sm">Interactive view of company alignment</p>
         </div>
         <AtomGraph goals={allData.goals} users={users} />
      </div>

      <div className="grid">
        <div className="card">
          <h3>Goal Distribution by Thrust Area</h3>
          <p className="text-secondary text-sm mb-4">Breakdown of active goals.</p>
          <div className="flex flex-col gap-2">
            {thrustCounts.map(t => (
              <div key={t.area} className="flex items-center gap-2">
                <div style={{ width: '120px', fontSize: '0.85rem' }}>{t.area}</div>
                <div style={{ flex: 1, background: 'var(--border)', borderRadius: '4px', height: '16px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(t.count / maxThrustCount) * 100}%`, 
                    height: '100%', 
                    background: 'var(--primary-color)',
                    transition: 'width 1s ease-in-out'
                  }}></div>
                </div>
                <div style={{ width: '30px', fontSize: '0.85rem', textAlign: 'right' }}>{t.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Goal Distribution by UoM</h3>
          <p className="text-secondary text-sm mb-4">Breakdown by Unit of Measurement.</p>
          <div className="flex flex-col gap-2">
            {uomCounts.map(u => (
              <div key={u.uom} className="flex items-center gap-2">
                <div style={{ width: '80px', fontSize: '0.85rem' }}>{u.uom}</div>
                <div style={{ flex: 1, background: 'var(--border)', borderRadius: '4px', height: '16px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(u.count / maxUomCount) * 100}%`, 
                    height: '100%', 
                    background: 'var(--success)',
                    transition: 'width 1s ease-in-out'
                  }}></div>
                </div>
                <div style={{ width: '30px', fontSize: '0.85rem', textAlign: 'right' }}>{u.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isManager && (
        <div className="card mt-4">
          <h3>Manager Effectiveness Dashboard</h3>
          <p className="text-secondary text-sm mb-4">Check-in feedback completion rates by Manager.</p>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Team Size</th>
                  <th>Check-ins Logged</th>
                  <th>Feedback Given</th>
                  <th>Feedback Rate</th>
                </tr>
              </thead>
              <tbody>
                {managerStats.map(m => (
                  <tr key={m.manager}>
                    <td>{m.manager}</td>
                    <td>{m.teamSize}</td>
                    <td>{m.checkInsMade}</td>
                    <td>{m.feedbackGiven}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, background: 'var(--border)', borderRadius: '4px', height: '8px', minWidth: '50px' }}>
                          <div style={{ 
                            width: `${m.feedbackRate}%`, 
                            height: '100%', 
                            background: m.feedbackRate === 100 ? 'var(--success)' : (m.feedbackRate > 50 ? 'var(--warning)' : 'var(--danger)'),
                            borderRadius: '4px'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem' }}>{m.feedbackRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AtomGraph({ goals, users }: { goals: any[], users: any[] }) {
  // A simple pseudo-random constellation generator using SVG
  // Company Nucleus -> Thrust Areas -> Goals
  
  const width = 1000;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;

  const thrustAreas = ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'];
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" style={{ background: 'transparent' }}>
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
        </pattern>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Center Nucleus */}
      <circle cx={cx} cy={cy} r="60" fill="url(#glow)" />
      <circle cx={cx} cy={cy} r="20" fill="var(--primary-color)" />
      <text x={cx} y={cy + 40} fill="var(--text-primary)" fontSize="14" fontWeight="bold" textAnchor="middle">AtomQuest</text>

      {/* Orbit Rings */}
      <circle cx={cx} cy={cy} r="120" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx={cx} cy={cy} r="250" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />

      {/* Thrust Areas (Inner Orbit) */}
      {thrustAreas.map((area, i) => {
        const angle = (i * Math.PI * 2) / thrustAreas.length;
        const x = cx + Math.cos(angle) * 120;
        const y = cy + Math.sin(angle) * 120;
        
        // Find goals for this area
        const areaGoals = goals.filter(g => g.thrustArea === area);
        
        return (
          <g key={area}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="2" opacity="0.5" />
            <circle cx={x} cy={y} r="10" fill="var(--secondary-color)" />
            <text x={x} y={y - 15} fill="var(--text-secondary)" fontSize="12" textAnchor="middle" fontWeight="bold">{area}</text>
            
            {/* Goals (Outer Orbit) */}
            {areaGoals.map((g, j) => {
               const gAngle = angle - 0.5 + (j * 1.0) / Math.max(areaGoals.length - 1, 1);
               const gx = cx + Math.cos(gAngle) * 250;
               const gy = cy + Math.sin(gAngle) * 250;
               const isCompleted = g.status === 'Approved'; // Just for visual
               return (
                 <g key={g.id}>
                   <line x1={x} y1={y} x2={gx} y2={gy} stroke={isCompleted ? 'var(--success)' : 'var(--border)'} strokeWidth="1" opacity={isCompleted ? 0.8 : 0.4} />
                   <circle cx={gx} cy={gy} r="6" fill={isCompleted ? 'var(--success)' : 'var(--background)'} stroke={isCompleted ? 'none' : 'var(--text-secondary)'} strokeWidth="2" />
                   <text x={gx} y={gy + 15} fill="var(--text-primary)" fontSize="10" textAnchor="middle">{g.title.substring(0, 15)}...</text>
                 </g>
               )
            })}
          </g>
        );
      })}
    </svg>
  );
}
