# Route Matrix

| Route Path | Component | Allowed Roles | Description |
|---|---|---|---|
| `/login` | `Login` | All (Public) | Entry point for authentication. |
| `/` | `Dashboard` | `platform_owner`, `founder`, `super_admin`, `admin` | Mission Control overview. |
| `/titles` | `Titles` | `platform_owner`, `founder`, `super_admin`, `admin`, `creator_partner` | Master list of all titles in the system. |
| `/creator` | `CreatorDashboard` | `creator_partner` | Creator-specific title view and stats. |
| `/buyer` | `BuyerDashboard` | `buyer` | Buyer-specific assigned screenings view. |
| `/drafts` | `Drafts` | `platform_owner`, `founder`, `super_admin`, `admin`, `creator_partner` | Management of unpublished title drafts. |
| `/uploads` | `Uploads` | `platform_owner`, `founder`, `super_admin`, `admin`, `creator_partner` | Asset and master file upload center. |
| `/screenings` | `Screenings` | `platform_owner`, `founder`, `super_admin`, `admin`, `buyer` | Screening link and access management. |
| `/qc` | `QC` | `platform_owner`, `founder`, `super_admin`, `qc_staff` | Quality control and asset review. |
| `/legal` | `Legal` | `platform_owner`, `founder`, `super_admin`, `legal_staff` | Rights, contracts, and legal review. |
| `/finance` | `Payments` | `platform_owner`, `founder`, `super_admin`, `finance` | Secure payment and revenue tracking. |
| `/analytics` | `Analytics` | `platform_owner`, `founder`, `super_admin`, `admin`, `creator_partner` | Performance and engagement metrics. |
| `/campaigns` | `Campaigns` | `platform_owner`, `founder`, `super_admin`, `admin` | Marketing and campaign management. |
| `/users` | `Users` | `platform_owner`, `founder`, `super_admin` | Global user and role administration. |
| `/settings` | `Settings` | All Authenticated | Personal profile and notification settings. |
| `/unauthorized` | `Unauthorized` | All Authenticated | Fallback for denied access. |
