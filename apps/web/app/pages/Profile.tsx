import React from 'react';
import { User, Mail, MapPin, Globe } from 'lucide-react';

export default function Profile() {
  const user = {
    name: "Abijith Asokan",
    role: "Master Admin / Founder",
    email: "abijithasokan@crayonspictures.com",
    location: "Mumbai, India",
    company: "Streamvista OPC Pvt Ltd"
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar">
              <User size={48} className="icon-gold" />
            </div>
            <div className="status-dot"></div>
          </div>
          <div className="user-info">
            <h1 className="display-text">{user.name}</h1>
            <p className="role">{user.role}</p>
          </div>
          <div className="profile-actions">
            <button className="action-btn outline">Edit Profile</button>
          </div>
        </div>

        <div className="profile-grid">
          <section className="details-section">
            <h3>Account Details</h3>
            <div className="details-list">
              <div className="detail-item">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
              <div className="detail-item">
                <Globe size={16} />
                <span>{user.company}</span>
              </div>
            </div>
          </section>

          <section className="permissions-section">
            <h3>System Permissions</h3>
            <div className="permissions-list">
              <PermissionItem label="Oracle DB Master Write" active />
              <PermissionItem label="OCI Object Storage Admin" active />
              <PermissionItem label="Rights Distribution Node" active />
              <PermissionItem label="Premium API Access" active />
            </div>
          </section>
        </div>

        <section className="history-section">
          <h3>Security Logs</h3>
          <div className="log-list">
            <div className="log-item">
              <span className="log-time">Today, 05:41 AM</span>
              <span className="log-desc">New Razorpay Live Key Authorized</span>
              <span className="log-ip">192.168.1.1</span>
            </div>
            <div className="log-item">
              <span className="log-time">Yesterday, 10:43 PM</span>
              <span className="log-desc">Master Ingest Sync Complete</span>
              <span className="log-ip">192.168.1.1</span>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .profile-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-card {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 60px;
          box-shadow: var(--glass-shadow);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .avatar-section {
          position: relative;
        }

        .avatar {
          width: 100px;
          height: 100px;
          background: rgba(212, 175, 55, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-dot {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 16px;
          height: 16px;
          background: #10b981;
          border: 3px solid var(--obsidian);
          border-radius: 50%;
        }

        .user-info h1 {
          font-size: 2rem;
          margin-bottom: 4px;
        }

        .role {
          color: var(--royal-gold);
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .profile-actions {
          margin-left: auto;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        @media (min-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        h3 {
          font-family: var(--font-display);
          color: var(--royal-gold);
          margin-bottom: 24px;
          font-size: 1.1rem;
        }

        .details-list, .permissions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--studio-silver);
          font-size: 0.9rem;
        }

        .detail-item svg { color: var(--royal-gold-muted); }

        .perm-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .perm-label { color: var(--studio-silver); }
        .perm-status { font-weight: 700; font-size: 0.65rem; color: #10b981; }

        .history-section {
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .log-list {
          display: flex;
          flex-direction: column;
        }

        .log-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 0.8rem;
        }

        .log-time { color: var(--studio-silver-muted); width: 140px; }
        .log-desc { flex: 1; color: var(--studio-silver); }
        .log-ip { color: var(--studio-silver-muted); font-family: monospace; }
      `}</style>
    </div>
  );
}

function PermissionItem({ label }: any) {
  return (
    <div className="perm-item">
      <span className="perm-label">{label}</span>
      <span className="perm-status">AUTHORIZED</span>
    </div>
  );
}
