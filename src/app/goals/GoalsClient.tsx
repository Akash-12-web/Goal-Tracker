'use client';

import { useState } from 'react';
import { saveGoal, submitGoals, saveCheckIn, deleteGoal } from '../actions';

export default function GoalsClient({ currentUser, goals, checkIns, initialTab }: { currentUser: any, goals: any[], checkIns: any[], initialTab: string }) {
  const [tab, setTab] = useState(initialTab);
  const [error, setError] = useState('');
  
  const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);
  const isLocked = goals.some(g => g.status === 'Submitted' || g.status === 'Approved');
  const allApproved = goals.length > 0 && goals.every(g => g.status === 'Approved');

  const handleSubmit = async () => {
    try {
      setError('');
      await submitGoals(currentUser.id);
      alert('Goals submitted successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setTab('goals')}
          style={{ 
            padding: '1rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: tab === 'goals' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: tab === 'goals' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Phase 1: Goal Setting
        </button>
        <button 
          onClick={() => setTab('checkins')}
          style={{ 
            padding: '1rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: tab === 'checkins' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: tab === 'checkins' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Phase 2: Quarterly Check-ins
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {tab === 'goals' && (
        <div>
          <div className="card mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Goal Summary</h3>
              <p>Total Weightage: <strong style={{ color: totalWeight === 100 ? 'var(--success)' : 'var(--danger)' }}>{totalWeight}%</strong> / 100%</p>
              <p>Total Goals: <strong>{goals.length}</strong> / 8</p>
            </div>
            {!isLocked && (
              <button onClick={handleSubmit} className="btn btn-primary" disabled={totalWeight !== 100 || goals.length === 0}>
                Submit Goals for Approval
              </button>
            )}
            {isLocked && (
              <div className="badge badge-submitted">Locked (Submitted/Approved)</div>
            )}
          </div>

          <div className="grid">
            {!isLocked && <GoalForm employeeId={currentUser.id} />}
            
            {goals.map(g => (
              <div key={g.id} className="card" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {!isLocked && g.status === 'Draft' && !g.isShared && (
                    <button 
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this goal?')) {
                          try {
                            await deleteGoal(g.id);
                          } catch (e: any) { alert(e.message); }
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Delete
                    </button>
                  )}
                  <span className={`badge badge-${g.status.toLowerCase()}`}>{g.status}</span>
                </div>
                <h4>{g.title}</h4>
                <p className="text-secondary text-sm mb-4">{g.thrustArea}</p>
                <p className="mb-4">{g.description}</p>
                
                <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-secondary">UoM:</span>
                    <strong>{g.uom}</strong>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-secondary">Target:</span>
                    <strong>{g.target}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Weightage:</span>
                    <strong>{g.weightage}%</strong>
                  </div>
                </div>
                {g.isShared && (
                  <div className="mt-4 text-secondary text-sm" style={{ fontStyle: 'italic' }}>
                    * This is a shared departmental KPI.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'checkins' && (
        <div>
          {!allApproved ? (
            <div className="card">
              <p>Your goals must be approved before you can log quarterly achievements.</p>
            </div>
          ) : (
            <div className="grid">
              {goals.map(g => (
                <CheckInForm key={g.id} goal={g} checkIns={checkIns.filter(c => c.goalId === g.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoalForm({ employeeId }: { employeeId: string }) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      employeeId,
      thrustArea: formData.get('thrustArea') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      uom: formData.get('uom') as any,
      target: formData.get('target') as string,
      weightage: parseInt(formData.get('weightage') as string, 10),
    };
    try {
      await saveGoal(data);
      e.target.reset();
    } catch(err: any) {
      alert(err.message);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ border: '2px dashed var(--primary-color)' }}>
      <h3 className="mb-4">Create New Goal</h3>
      
      <div className="form-group">
        <label>Thrust Area</label>
        <select name="thrustArea" className="form-control" required>
          <option value="Financial">Financial</option>
          <option value="Customer">Customer</option>
          <option value="Internal Process">Internal Process</option>
          <option value="Learning & Growth">Learning & Growth</option>
        </select>
      </div>

      <div className="form-group">
        <label>Goal Title</label>
        <input type="text" name="title" className="form-control" required />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea name="description" className="form-control" rows={2} required></textarea>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>UoM</label>
          <select name="uom" className="form-control" required>
            <option value="Numeric">Numeric</option>
            <option value="%">%</option>
            <option value="Timeline">Timeline (Date)</option>
            <option value="Zero">Zero-based</option>
          </select>
        </div>
        
        <div className="form-group" style={{ flex: 1 }}>
          <label>Target</label>
          <input type="text" name="target" className="form-control" required />
        </div>
        
        <div className="form-group" style={{ flex: 1 }}>
          <label>Weightage (%)</label>
          <input type="number" name="weightage" className="form-control" min="10" max="100" required />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Goal</button>
    </form>
  );
}

function CheckInForm({ goal, checkIns }: { goal: any, checkIns: any[] }) {
  const [quarter, setQuarter] = useState('Q1');
  const checkIn = checkIns.find(c => c.quarter === quarter);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await saveCheckIn({
        goalId: goal.id,
        quarter,
        actualAchievement: formData.get('actualAchievement') as string,
        status: formData.get('status') as any,
        checkInComment: '', // Manager adds this
        employeeComment: formData.get('employeeComment') as string,
      });
      alert('Check-in saved!');
    } catch(err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h4 className="mb-4">{goal.title}</h4>
      <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
        <div className="flex justify-between mb-2">
          <span className="text-secondary">Target ({goal.uom}):</span>
          <strong>{goal.target}</strong>
        </div>
      </div>

      <div className="form-group">
        <label>Select Quarter</label>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="form-control">
          <option value="Q1">Q1 (July)</option>
          <option value="Q2">Q2 (October)</option>
          <option value="Q3">Q3 (January)</option>
          <option value="Q4">Q4 (March/April)</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Actual Achievement</label>
          <input 
            type="text" 
            name="actualAchievement" 
            className="form-control" 
            defaultValue={checkIn?.actualAchievement || ''} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" className="form-control" defaultValue={checkIn?.status || 'On Track'} required>
            <option value="Not Started">Not Started</option>
            <option value="On Track">On Track</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label>My Comments</label>
          <textarea name="employeeComment" className="form-control" rows={2} defaultValue={checkIn?.employeeComment || ''}></textarea>
        </div>

        {checkIn?.checkInComment && (
          <div className="form-group mt-4 p-4" style={{ background: 'rgba(255, 171, 0, 0.1)', borderRadius: '4px', borderLeft: '4px solid var(--warning)' }}>
            <label>Manager Comment:</label>
            <p>{checkIn.checkInComment}</p>
          </div>
        )}

        <button type="submit" className="btn btn-secondary mt-4" style={{ width: '100%' }}>Save Check-in</button>
      </form>
    </div>
  );
}
