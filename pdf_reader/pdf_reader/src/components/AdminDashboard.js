import React, { useEffect, useState } from 'react';

function AdminDashboard() {
	const [analytics, setAnalytics] = useState(null);
	const [error, setError] = useState(null);
	const [actionMsg, setActionMsg] = useState('');

	const fetchAnalytics = () => {
		setError(null);
		fetch('http://localhost:5000/admin/analytics', { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.error) setError(data.error);
				else setAnalytics(data);
			})
			.catch(() => setError('Failed to fetch analytics'));
	};

	useEffect(() => {
		fetchAnalytics();
	}, []);

	const handleAccess = async (username, action) => {
		setActionMsg('');
		try {
			const res = await fetch(`http://localhost:5000/admin/${action}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Action failed');
			setActionMsg(data.message);
			fetchAnalytics();
		} catch (err) {
			setActionMsg(err.message);
		}

	};

	if (error) return <div style={{color: 'red'}}>Error: {error}</div>;
	if (!analytics) return <div>Loading analytics...</div>;

	// Support both old and new backend response formats
	const users = analytics.per_user || analytics.users || [];
	const userCount = analytics.num_users || analytics.user_count || users.length;
	const totalUploads = analytics.total_files || analytics.total_uploads || users.reduce((sum, u) => u.uploads ? sum + u.uploads : sum, 0);
	const isAdmin = (window.sessionStorage.getItem('user') === 'admin@gmail.com');

	return (
		<div style={{padding: 24}}>
			<h2>Admin Usage Analytics</h2>
			<div><b>Total Users:</b> {userCount}</div>
			<div><b>Total Files Uploaded:</b> {totalUploads}</div>
			{actionMsg && <div style={{margin:'12px 0', color: actionMsg.startsWith('Error') ? 'red' : 'green'}}>{actionMsg}</div>}
			<h3 style={{marginTop: 32, fontSize: '2em'}}>Per User Stats</h3>
			<div style={{
				background: '#f8fbff',
				borderRadius: 18,
				boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)'
			}}>
				<div className="admin-dashboard-panel">
					<h2>Admin Dashboard</h2>
					<div style={{overflowX: 'auto'}}>
						<table style={{borderCollapse: 'collapse', width: '100%', background: '#f8fbff'}}>
							<thead>
								<tr style={{background: '#e3e8f0'}}>
								<th style={{border: '1px solid #b6c7e3', padding: '18px 20px', fontSize: '1.1em'}}>Username</th>
								{isAdmin && (
									<th style={{border: '1px solid #b6c7e3', padding: '18px 20px', fontSize: '1.1em'}}>Password</th>
								)}
								<th style={{border: '1px solid #b6c7e3', padding: '18px 20px', fontSize: '1.1em'}}>Files Uploaded</th>
								<th style={{border: '1px solid #b6c7e3', padding: '18px 20px', fontSize: '1.1em'}}>Access</th>
								<th style={{border: '1px solid #b6c7e3', padding: '18px 20px', fontSize: '1.1em'}}>Action</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u, idx) => (
									<tr key={u.username} style={{background: idx % 2 === 0 ? '#f8fbff' : '#e3e8f0'}}>
										   <td style={{border: '1px solid #e3e8f0', padding: '16px 18px', fontWeight: 600}}>{u.username}</td>
										   {isAdmin && (
											   <td style={{border: '1px solid #e3e8f0', padding: '16px 18px'}}>{'********'}</td>
										   )}
										   <td style={{border: '1px solid #e3e8f0', padding: '16px 18px'}}>{u.uploads || u.files_uploaded || (u.files ? u.files.length : 0)}</td>
										   <td style={{border: '1px solid #e3e8f0', padding: '16px 18px'}}>{u.active === false ? 'Revoked' : 'Active'}</td>
										   <td style={{border: '1px solid #e3e8f0', padding: '16px 18px'}}>
											   {u.username !== 'admin@gmail.com' && (
												   <>
													   {u.active === false ?
														   <button style={{fontSize: '1em', padding: '8px 18px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginRight: 8}} onClick={() => handleAccess(u.username, 'grant')}>Grant</button>
														   :
														   <>
															   <button style={{fontSize: '1em', padding: '8px 18px', borderRadius: 8, background: '#e53935', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginRight: 8}} onClick={() => handleAccess(u.username, 'revoke')}>Revoke</button>
														   </>
													   }
												   </>
											   )}
										   </td>
									   </tr>
								   ))}
							   </tbody>
						   </table>
					   </div>
				   </div>
			   </div>
		   </div>
	   );
}

export default AdminDashboard;

