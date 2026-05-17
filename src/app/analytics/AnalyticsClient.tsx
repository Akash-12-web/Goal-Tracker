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
