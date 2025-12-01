import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ServiceType, ServiceRecord, Demographics } from '../types';
import { db } from '../services/storage';
import { Plus, Trash2, Calendar, Users, Video, X } from 'lucide-react';

const initialDemographics: Demographics = {
  men: 0, women: 0, adolescents: 0, children: 0, gmeet: 0
};

export const Attendance = () => {
  const { data, addService, deleteService } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceRecord>>({
    type: ServiceType.CULTO_QUARTA,
    attendance: { ...initialDemographics },
    date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof Demographics, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      attendance: {
        ...(prev.attendance || initialDemographics),
        [field]: numValue
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.type) return;

    // Safety check for attendance object
    const currentAttendance = formData.attendance || initialDemographics;
    
    // Calculate total safely
    const total = (Object.values(currentAttendance) as number[]).reduce((a, b) => a + b, 0);

    const newRecord: ServiceRecord = {
      id: db.generateId(),
      date: formData.date,
      type: formData.type,
      attendance: currentAttendance as Demographics,
      total,
      notes: formData.notes
    };

    addService(newRecord);
    setIsFormOpen(false);
    setFormData({
      type: ServiceType.CULTO_QUARTA,
      attendance: { ...initialDemographics },
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const sortedServices = [...data.services].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cultos e Jornadas</h2>
          <p className="text-slate-500 mt-1">Gerencie a frequência das atividades oficiais da igreja.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="group bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95"
        >
          {isFormOpen ? <X size={20} /> : <Plus size={20} />}
          <span className="font-medium">{isFormOpen ? 'Cancelar' : 'Novo Registro'}</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Novo Lançamento de Frequência</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center"><Calendar size={16} className="mr-2 text-indigo-500"/>Data</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center"><Users size={16} className="mr-2 text-indigo-500"/>Tipo de Evento</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as ServiceType})}
                >
                  {Object.values(ServiceType).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700">Observações</label>
                 <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="Detalhes adicionais..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                 />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">Contagem de Membros</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {['men', 'women', 'adolescents', 'children', 'gmeet'].map((key) => (
                    <div key={key} className="relative">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5 capitalize">
                        {key === 'gmeet' ? 'Online' : key === 'men' ? 'Homens' : key === 'women' ? 'Mulheres' : key === 'children' ? 'Crianças' : 'Adolescentes'}
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            min="0"
                            className="w-full pl-3 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center font-bold text-slate-800"
                            value={formData.attendance?.[key as keyof Demographics] || 0}
                            onChange={(e) => handleInputChange(key as keyof Demographics, e.target.value)}
                        />
                        {key === 'gmeet' && <Video size={14} className="absolute right-3 top-3 text-slate-400" />}
                    </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-transform transform active:scale-95"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Evento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Membros</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Online</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{new Date(service.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${service.type === ServiceType.CULTO_DOMINGO ? 'bg-violet-100 text-violet-700' : 
                        service.type === ServiceType.JORNADA ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {service.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-slate-500">
                    <div className="flex justify-center space-x-2 text-xs">
                        <span title="Homens">H:{service.attendance.men}</span>
                        <span className="text-slate-300">|</span>
                        <span title="Mulheres">M:{service.attendance.women}</span>
                        <span className="text-slate-300">|</span>
                        <span title="Adolescentes">A:{service.attendance.adolescents}</span>
                        <span className="text-slate-300">|</span>
                        <span title="Crianças">C:{service.attendance.children}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {service.attendance.gmeet > 0 ? (
                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                            <Video size={12} className="mr-1"/> {service.attendance.gmeet}
                        </span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-sm font-bold">
                        {service.total}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteService(service.id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedServices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                        <Calendar size={48} className="mb-4 text-slate-200" />
                        <p>Nenhum culto registrado ainda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};