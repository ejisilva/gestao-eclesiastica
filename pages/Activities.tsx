import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ActivityRecord, ActivityType } from '../types';
import { db } from '../services/storage';
import { MapPin, Briefcase, Home, Calendar, Trash2, Plus, Clock } from 'lucide-react';

export const Activities = () => {
  const { data, addActivity, deleteActivity } = useData();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<ActivityType>(ActivityType.VISITA_PASTORAL);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activity: ActivityRecord = {
      id: db.generateId(),
      date,
      type,
      description,
      location
    };
    addActivity(activity);
    setDescription('');
    setLocation('');
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
        case ActivityType.VISITA_PASTORAL: return <Home size={18} className="text-blue-500" />;
        case ActivityType.CONSAGRACAO_CASA: return <Home size={18} className="text-emerald-500" />;
        case ActivityType.CONSAGRACAO_NEGOCIO: return <Briefcase size={18} className="text-amber-500" />;
        default: return <Calendar size={18} className="text-slate-500" />;
    }
  };

  const getBgColor = (type: ActivityType) => {
      switch (type) {
        case ActivityType.VISITA_PASTORAL: return 'bg-blue-50 border-blue-100';
        case ActivityType.CONSAGRACAO_CASA: return 'bg-emerald-50 border-emerald-100';
        case ActivityType.CONSAGRACAO_NEGOCIO: return 'bg-amber-50 border-amber-100';
        default: return 'bg-slate-50 border-slate-100';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-6">
            <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center">
                <Plus className="mr-2 text-indigo-600" size={20} />
                Nova Atividade
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                    <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={type}
                        onChange={(e) => setType(e.target.value as ActivityType)}
                    >
                        {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data</label>
                    <input 
                        type="date"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                    <input 
                        type="text"
                        placeholder="Ex: Família Silva"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local (Opcional)</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Endereço ou Bairro"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-black font-bold shadow-lg transition-transform transform active:scale-95 flex justify-center items-center space-x-2 mt-4"
                >
                    <span>Registrar Atividade</span>
                </button>
            </form>
        </div>
      </div>

      {/* List Section - Timeline Style */}
      <div className="lg:col-span-2">
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-xl font-bold text-slate-800">Histórico de Atividades</h2>
             </div>
             <div className="p-6 relative">
                 {/* Timeline Line */}
                 {data.activities.length > 0 && (
                    <div className="absolute left-10 top-6 bottom-6 w-0.5 bg-slate-100 hidden sm:block"></div>
                 )}

                 <div className="space-y-6">
                 {[...data.activities].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(activity => (
                     <div key={activity.id} className="relative flex flex-col sm:flex-row items-start group">
                         {/* Date Bubble */}
                         <div className="hidden sm:flex flex-col items-center mr-6 z-10 min-w-[60px]">
                             <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-white shadow-sm mb-2"></div>
                             <span className="text-xs font-bold text-slate-400 text-center">
                                {new Date(activity.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                             </span>
                         </div>

                         {/* Content Card */}
                         <div className={`flex-1 p-5 rounded-2xl border ${getBgColor(activity.type)} transition-all hover:shadow-md w-full`}>
                             <div className="flex justify-between items-start">
                                 <div className="flex items-start space-x-4">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         {getIcon(activity.type)}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-slate-800 text-base">{activity.description}</h4>
                                         <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mt-1">{activity.type}</p>
                                         
                                         <div className="flex flex-wrap gap-3 mt-3">
                                            {activity.location && (
                                                <p className="text-xs text-slate-500 flex items-center bg-white/60 px-2 py-1 rounded-md">
                                                    <MapPin size={12} className="mr-1" /> {activity.location}
                                                </p>
                                            )}
                                            {/* Mobile Date display */}
                                            <p className="text-xs text-slate-500 flex items-center bg-white/60 px-2 py-1 rounded-md sm:hidden">
                                                <Clock size={12} className="mr-1" /> {new Date(activity.date).toLocaleDateString('pt-BR')}
                                            </p>
                                         </div>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => deleteActivity(activity.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                 >
                                     <Trash2 size={18} />
                                 </button>
                             </div>
                         </div>
                     </div>
                 ))}
                 </div>
                 
                 {data.activities.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={24} className="text-slate-300"/>
                         </div>
                         <p>Nenhuma atividade registrada.</p>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};