'use client';

import { pushSharedGoal } from "../actions";

export default function AdminClient({ users, allData }: { users: any[], allData: any }) {
  const employees = users.filter(u => u.role === 'Employee');

  const handlePushGoal = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedEmployeeIds = Array.from(formData.getAll('employeeIds')) as string[];
    
    if (selectedEmployeeIds.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    try {
      await pushSharedGoal(
        formData.get('title') as string,
        formData.get('description') as string,
        formData.get('thrustArea') as string,
        formData.get('uom') as string,
        formData.get('target') as string,
        selectedEmployeeIds
      );
      e.target.reset();
      alert("Shared goals pushed successfully.");
    } catch(err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Push Departmental KPI</h3>
        <p className="mb-4 text-secondary">Assign a read-only goal to selected employees.</p>
        
        <form onSubmit={handlePushGoal}>
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
          </div>

          <div className="form-group">
            <label>Select Employees</label>
            <select name="employeeIds" className="form-control" multiple size={4} required>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <small className="text-secondary">Hold Ctrl/Cmd to select multiple.</small>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Push KPI to Employees</button>
        </form>
      </div>

      <div className="card">
        <h3>System Overview</h3>
        <p className="mb-4 text-secondary">A snapshot of all organizational goals.</p>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Goals Configured</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const empGoals = allData.goals.filter((g: any) => g.employeeId === emp.id);
                const allApproved = empGoals.length > 0 && empGoals.every((g: any) => g.status === 'Approved');
                const isSubmitted = empGoals.some((g: any) => g.status === 'Submitted');

                let statusText = 'Draft / Not Started';
                let badgeClass = 'badge-draft';
                if (allApproved) {
                  statusText = 'Approved';
                  badgeClass = 'badge-approved';
                } else if (isSubmitted) {
                  statusText = 'Pending Manager';
                  badgeClass = 'badge-submitted';
                }

                return (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{empGoals.length} / 8</td>
                    <td><span className={`badge ${badgeClass}`}>{statusText}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
