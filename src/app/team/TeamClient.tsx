'use client';

import { useState } from 'react';
import { approveGoals, saveGoal, saveCheckIn } from '../actions';

export default function TeamClient({ currentUser, team, allData }: { currentUser: any, team: any[], allData: any }) {
  const [selectedMember, setSelectedMember] = useState<any>(null);

  if (!selectedMember) {
    return (
      <div className="grid">
        {team.map(member => {
          const memberGoals = allData.goals.filter((g: any) => g.employeeId === member.id);
          const submitted = memberGoals.some((g: any) => g.status === 'Submitted');
          
          return (
            <div key={member.id} className="card" onClick={() => setSelectedMember(member)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{member.name}</h3>
                {submitted && <span className="badge badge-submitted">Pending Approval</span>}
              </div>
              <p className="mt-4 text-secondary">{memberGoals.length} Goals Defined</p>
            </div>
          );
        })}
      </div>
    );
  }

  const memberGoals = allData.goals.filter((g: any) => g.employeeId === selectedMember.id);
  const memberCheckIns = allData.checkIns.filter((c: any) => memberGoals.some((g: any) => g.id === c.goalId));
  const isSubmitted = memberGoals.length > 0 && memberGoals.some((g: any) => g.status === 'Submitted');
  
  const handleApprove = async (action: 'Approve' | 'Return') => {
    try {
      await approveGoals(selectedMember.id, action);
      alert(`Goals ${action.toLowerCase()}d successfully.`);
      setSelectedMember(null); // Go back
    } catch(err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => setSelectedMember(null)} className="btn btn-secondary">← Back to Team</button>
      </div>
      
      <div className="card mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>{selectedMember.name}'s Goals</h2>
        </div>
        {isSubmitted && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleApprove('Return')} className="btn btn-danger">Return for Rework</button>
            <button onClick={() => handleApprove('Approve')} className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }}>Approve Goals</button>
          </div>
        )}
      </div>

      <h3 className="mb-4 mt-4">Goals</h3>
      <div className="grid">
        {memberGoals.map((g: any) => (
          <ManagerGoalCard key={g.id} goal={g} checkIns={memberCheckIns.filter((c: any) => c.goalId === g.id)} />
        ))}
        {memberGoals.length === 0 && <p>No goals defined yet.</p>}
      </div>
    </div>
  );
}

function ManagerGoalCard({ goal, checkIns }: { goal: any, checkIns: any[] }) {
  const [editing, setEditing] = useState(false);
  
  const handleEditTarget = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await saveGoal({
        ...goal,
        target: formData.get('target') as string,
        weightage: parseInt(formData.get('weightage') as string, 10)
      }, goal.id);
      setEditing(false);
      alert('Goal updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className={`badge badge-${goal.status.toLowerCase()}`}>{goal.status}</span>
        {goal.status === 'Submitted' && !editing && (
          <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit Target</button>
        )}
      </div>
      <h4 className="mt-4">{goal.title}</h4>
      <p className="text-secondary text-sm mb-4">{goal.thrustArea}</p>

      {editing ? (
        <form onSubmit={handleEditTarget} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '4px' }}>
          <div className="form-group mb-2">
            <label>Target ({goal.uom})</label>
            <input type="text" name="target" className="form-control" defaultValue={goal.target} required />
          </div>
          <div className="form-group mb-2">
            <label>Weightage (%)</label>
            <input type="number" name="weightage" className="form-control" defaultValue={goal.weightage} min="10" max="100" required />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
          <div className="flex justify-between mb-2">
            <span className="text-secondary">UoM:</span>
            <strong>{goal.uom}</strong>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary">Target:</span>
            <strong>{goal.target}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Weightage:</span>
            <strong>{goal.weightage}%</strong>
          </div>
        </div>
      )}

      {goal.status === 'Approved' && (
        <div className="mt-4">
          <h5 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Quarterly Progress</h5>
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
            const c = checkIns.find((check: any) => check.quarter === q);
            if (!c) return null;

            return (
              <div key={q} className="mb-4 p-4" style={{ border: '1px solid var(--border)', borderRadius: '4px' }}>
                <div className="flex justify-between items-center mb-2">
                  <strong>{q} Check-in</strong>
                  <span className="badge badge-draft">{c.status}</span>
                </div>
                <div className="mb-2">
                  <span className="text-secondary">Actual:</span> <strong>{c.actualAchievement}</strong>
                </div>
                {c.employeeComment && (
                  <p className="text-sm text-secondary mb-2" style={{ fontStyle: 'italic' }}>
                    "{c.employeeComment}"
                  </p>
                )}

                <ManagerCommentForm checkIn={c} />
              </div>
            );
          })}
          {checkIns.length === 0 && <p className="text-sm text-secondary">No check-ins yet.</p>}
        </div>
      )}
    </div>
  );
}

function ManagerCommentForm({ checkIn }: { checkIn: any }) {
  const [editing, setEditing] = useState(!checkIn.checkInComment);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await saveCheckIn({
        ...checkIn,
        checkInComment: formData.get('checkInComment') as string
      });
      setEditing(false);
      alert('Feedback saved.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!editing) {
    return (
      <div style={{ background: 'rgba(54, 179, 126, 0.1)', padding: '0.75rem', borderRadius: '4px', borderLeft: '4px solid var(--success)' }}>
        <p className="text-sm mb-2"><strong>Your Feedback:</strong> {checkIn.checkInComment}</p>
        <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit Feedback</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea 
        name="checkInComment" 
        className="form-control mb-2" 
        rows={2} 
        placeholder="Add structured check-in comment..." 
        defaultValue={checkIn.checkInComment || ''}
        required
      ></textarea>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Save Feedback</button>
        {checkIn.checkInComment && (
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Cancel</button>
        )}
      </div>
    </form>
  );
}
