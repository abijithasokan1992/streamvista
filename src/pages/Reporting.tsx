import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Reporting: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Role authorization
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    
    // Spreadsheet formula injection protection
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str;
    }
    
    // CSV escaping
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const generateCSV = async (reportType: string) => {
    setLoading(reportType);
    setError(null);
    try {
      let data: any[] = [];
      let headers: string[] = [];

      switch (reportType) {
        case 'users':
          data = await adminService.getAllUsers();
          headers = ['email', 'role', 'legacy_user_id', 'migrated_at'];
          break;
        case 'films':
          data = await adminService.getFilms();
          headers = ['title', 'status', 'creatorId'];
          break;
        case 'buyerMappings':
          data = await adminService.getBuyerMappings();
          headers = ['filmId', 'buyerId', 'assignedAt'];
          break;
        case 'qcLogs':
          data = await adminService.getQcLogs();
          headers = ['filmId', 'reviewerId', 'status', 'notes', 'timestamp'];
          break;
        default:
          throw new Error("Unknown report type");
      }

      if (data.length === 0) {
        setError(`No data found for ${reportType}`);
        setLoading(null);
        return;
      }

      // Generate CSV string
      const csvRows = [];
      csvRows.push(headers.map(escapeCSV).join(','));
      for (const row of data) {
        csvRows.push(headers.map(header => escapeCSV(row[header])).join(','));
      }
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (e) {
      console.error(e);
      setError(`Failed to generate report: ${(e as Error).message}`);
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    { id: 'films', name: 'Titles & Content' },
    { id: 'users', name: 'Users' },
    { id: 'buyerMappings', name: 'Buyer Mappings' },
    { id: 'qcLogs', name: 'QC Logs' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Reporting Engine</h1>
      </div>
      
      {error && (
        <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6 border border-red-500/50">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <Card key={report.id} className="bg-brand-navy-light/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">Export UTF-8 CSV containing backend data for {report.name.toLowerCase()}.</p>
              <Button 
                onClick={() => generateCSV(report.id)} 
                disabled={loading !== null}
                className="w-full bg-brand-gold text-brand-navy hover:bg-yellow-500 disabled:opacity-50"
              >
                {loading === report.id ? 'Generating...' : 'Export CSV'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
