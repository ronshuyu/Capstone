import React from 'react';
import './DashboardCss/FooterDash.css';


const FooterDash = () => {
	return (
		<footer className="footerdash">
			<div>
				<strong>How to Use:</strong>
				<ol style={{ textAlign: 'left', maxWidth: 500, margin: '1rem auto', paddingLeft: 20 }}>
					<li>Navigate through the dashboard using the menu above.</li>
					<li>Access your diary, profile, and scorecard from the sidebar.</li>
					<li>Edit your profile details as needed.</li>
					<li>Check your progress and feedback in the scorecard section.</li>
					<li>For help, contact support via the provided channels.</li>
				</ol>
			</div>
			<div style={{ marginTop: '1.5rem', fontSize: '0.85em', color: '#a0aec0' }}>
				&copy; {new Date().getFullYear()} STCMHMS 
			</div>
		</footer>
	);
};

export default FooterDash;