import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, TrendingUp, CalendarCheck, Activity, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-slate-500 font-medium text-sm tracking-wide">{title}</h3>
        <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-800">{value}</span>
            {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center"><ArrowUpRight size={10} className="mr-0.5" /> {trend}</span>}
        </div>
      </div>
      <div className={`p-3.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`${color.replace('bg-', 'text-')}`} size={24} />
      </div>
    </div>
    <p className="text-xs text-slate-400 font-medium border-t border-slate-50 pt-3 mt-1">{subtext}</p>
  </div>
);

export const Dashboard = () => {
  const { data } = useData();

  const stats = useMemo(() => {
    const totalAttendance = data.services.reduce((acc, curr) => acc + curr.total, 0);
    const avgAttendance = data.services.length ? Math.round(totalAttendance / data.services.length) : 0;
    const counselingCount = data.counseling.length;
    const activitiesCount = data.activities.length;
    
    return { totalAttendance, avgAttendance, counselingCount, activitiesCount };
  }, [data]);

  const demographicData = useMemo(() => {
    const totals = data.services.reduce((acc, curr) => ({
      Homens: acc.Homens + curr.attendance.men,
      Mulheres: acc.Mulheres + curr.attendance.women,
      Crianças: acc.Crianças + curr.attendance.children,
      Adolescentes: acc.Adolescentes + curr.attendance.adolescents,
    }), { Homens: 0, Mulheres: 0, Crianças: 0, Adolescentes: 0 });

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [data.services]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981']; // Indigo, Pink, Amber, Emerald

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl text-xs">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
             <p key={idx} style={{ color: p.color }}>
                {p.name}: <span className="font-bold">{p.value}</span>
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Frequência Mensal" 
          value={stats.totalAttendance} 
          subtext="Total acumulado no mês"
          icon={Users}
          color="bg-indigo-500"
          trend="+12%"
        />
        <StatCard 
          title="Média por Culto" 
          value={stats.avgAttendance} 
          subtext="Participação média"
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Atendimentos" 
          value={stats.counselingCount} 
          subtext="Sessões pastorais"
          icon={HeartHandshakeIcon}
          color="bg-pink-500"
        />
        <StatCard 
          title="Atividades Extras" 
          value={stats.activitiesCount} 
          subtext="Eventos externos"
          icon={CalendarCheck}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Tendência de Frequência</h3>
                <p className="text-slate-400 text-sm">Acompanhamento dos últimos cultos</p>
            </div>
            <div className="flex space-x-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span><span className="text-xs text-slate-500">Total</span>
                <span className="w-3 h-3 rounded-full bg-indigo-200 inline-block ml-2"></span><span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.services.slice(-10)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                    dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Presencial" activeDot={{r: 6, strokeWidth: 0}} />
                <Area type="monotone" dataKey="attendance.gmeet" stroke="#c7d2fe" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Online" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics - Takes up 1 column */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Demografia</h3>
          <p className="text-slate-400 text-sm mb-6">Distribuição dos membros</p>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-3xl font-bold text-slate-800">{stats.totalAttendance > 0 ? '100%' : '0'}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest">Total</span>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {demographicData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-medium text-slate-600">{entry.name}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon wrapper
const HeartHandshakeIcon = (props: any) => <Activity {...props} />;