import React from 'react';
import { User, Mail, MapPin, Building2 } from 'lucide-react';

const connectedServices = [
  { name: 'Supabase', status: 'Connected', detail: 'Application database and Auth' },
  { name: 'GitHub', status: 'Connected', detail: 'Repository access available' },
  { name: 'Vercel', status: 'Connected', detail: 'Deployment workspace available' },
  { name: 'Razorpay', status: 'Connected', detail: 'Payment activity available' },
  { name: 'Hostinger Mail', status: 'Connected', detail: 'Mailbox available' },
];

const recentActivity = [
  { title: 'Payment service activity detected', detail: 'Razorpay · Recent' },
  { title: 'Catalog sync completed', detail: 'Recent' },
  { title: 'Profile updated', detail: 'Recent' },
];

export default function Profile() {
  const user = {
    name: 'Abijith Asokan',
    role: 'Founder · StreamVista OPC Pvt Ltd',
    email: 'abijithasokan@crayonspictures.com',
    location: 'Mumbai, India',
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar" aria-hidden="true">
            <User size={42} />
          </div>
          <div className="user-info">
            <h1>{user.name}</h1>
            <p className="role">{user.role}</p>
          </div>
          <div className="profile-actions">
            <button className="action-btn outline" type="button">Edit Profile</button>
          </div>
        </div>

        <section className="section">
          <h2>Account</h2>
          <div className="account-list">
            <div className="account-item">
              <Mail size={17} aria-hidden="true" />
              <span>{user.email}</span>
            </div>
            <div className="account-item">
              <MapPin size={17} aria-hidden="true" />
              <span>{user.location}</span>
            </div>
            <div className="account-item">
              <Building2 size={17} aria-hidden="true" />
              <span>StreamVista OPC Pvt Ltd</span>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Workspace</h2>
          <div className="workspace-card">
            <strong>Crayons Bridge</strong>
            <span>Rights &amp; Content Marketplace</span>
          </div>
        </section>

        <section className="section">
          <h2>Connected Services</h2>
          <div className="services-list">
            {connectedServices.map((service) => (
              <div className="service-item" key={service.name}>
                <div>
                  <strong>{service.name}</strong>
                  <span>{service.detail}</span>
                </div>
                <span className="service-status">{service.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div className="activity-item" key={activity.title}>
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="system-note">
          Detailed infrastructure information is available only in Advanced → System Activity.
        </p>
      </div>

      <style>{`
        .profile-container {
          max-width: 860px;
          margin: 0 auto;
        }

        .profile-card {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 40px;
          box-shadow: var(--glass-shadow);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .avatar {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
        }

        .user-info h1 {
          margin: 0 0 5px;
          font-size: 1.9rem;
        }

        .role {
          margin: 0;
          color: var(--studio-silver-muted);
          font-size: 0.9rem;
        }

        .profile-actions {
          margin-left: auto;
        }

        .section {
          padding: 28px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .section h2 {
          margin: 0 0 16px;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--studio-silver-muted);
        }

        .account-list,
        .services-list,
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .account-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--studio-silver);
          font-size: 0.92rem;
        }

        .account-item svg {
          color: var(--studio-silver-muted);
        }

        .workspace-card {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 16px 18px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
        }

        .workspace-card strong,
        .service-item strong,
        .activity-item strong {
          color: var(--studio-silver);
          font-size: 0.95rem;
        }

        .workspace-card span,
        .service-item span,
        .activity-item span {
          color: var(--studio-silver-muted);
          font-size: 0.82rem;
        }

        .service-item,
        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 0;
        }

        .service-item > div,
        .activity-item > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .service-status {
          flex: 0 0 auto;
          color: var(--studio-silver-muted) !important;
          font-size: 0.76rem !important;
        }

        .activity-section {
          border-bottom: none;
        }

        .system-note {
          margin: 4px 0 0;
          color: var(--studio-silver-muted);
          font-size: 0.76rem;
        }

        @media (max-width: 640px) {
          .profile-card {
            padding: 24px;
          }

          .profile-header {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .profile-actions {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
