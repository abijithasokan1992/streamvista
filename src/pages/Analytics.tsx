import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { BarChart3, Download, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { adminService } from "../services/adminService";
import { useAuth } from "../contexts/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalRevenue: number;
    totalSales: number;
    creatorEarnings: number;
    chartData: any[];
  }>({ totalRevenue: 0, totalSales: 0, creatorEarnings: 0, chartData: [] });

  useEffect(() => {
    async function loadData() {
      try {
        const ledgers = await adminService.getLedgers() as any[];
        
        let revenue = 0;
        let sales = 0;
        let earnings = 0;
        
        const monthlyData: Record<string, number> = {};

        ledgers.forEach(l => {
          if (l.type === 'buyer_payment') {
            sales++;
            const amount = Number(l.amount) || 0;
            revenue += amount;
            
            // Group by month for chart
            const date = new Date(l.timestamp?.toDate ? l.timestamp.toDate() : l.timestamp);
            const month = date.toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + amount;
          }
          if (l.type === 'creator_payable') {
            earnings += Number(l.amount) || 0;
          }
        });

        const chartData = Object.keys(monthlyData).map(k => ({
          name: k,
          revenue: monthlyData[k]
        }));

        setData({
          totalRevenue: revenue,
          totalSales: sales,
          creatorEarnings: earnings,
          chartData: chartData.length > 0 ? chartData : [{ name: "Current Month", revenue: 0 }]
        });
      } catch(e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Revenue,${data.totalRevenue}\n`
      + `Total Sales,${data.totalSales}\n`
      + `Creator Earnings,${data.creatorEarnings}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold h-12 w-12" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics</h1>
          <p className="text-slate-400">View performance metrics and platform revenue.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 px-4 py-2 rounded transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-brand-navy border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
              Gross Revenue
              <DollarSign size={16} className="text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{data.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-brand-navy border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
              Total Sales
              <TrendingUp size={16} className="text-brand-orange" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.totalSales}</div>
          </CardContent>
        </Card>

        <Card className="bg-brand-navy border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
              Creator Earnings (Allocated)
              <BarChart3 size={16} className="text-brand-gold" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">₹{data.creatorEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-brand-navy border-white/10">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', color: '#fff' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
