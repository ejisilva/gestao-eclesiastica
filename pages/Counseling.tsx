import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { CounselingSession, Member } from '../types';
import { db } from '../services/storage';
import { Plus, CheckCircle, XCircle, Search, UserPlus, Phone, Calendar, ChevronLeft, ArrowRight } from 'lucide-react';

export const Counseling = () => {
  const { data, addCounseling, updateCounseling, addMember } = useData();
  const [view, setView] = useState<'list' | 'new'>('list');
  
  // State for new session form
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [resolved, setResolved] = useState(false);

  // State for new member modal/inline
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // Quick Stats
  const stats = useMemo(() => {
    const total = data.counseling.length;
    const resolvedCount = data.counseling.filter(c => c.resolved).length;
    return { total, resolvedCount };
  }, [data.counseling]);

  const handleCreateMember = () => {
    if (!newMemberName) return;
    const newMember: Member = {
      id: db.generateId(),
      name: newMemberName,
      phone: newMemberPhone,
      since: new Date().toISOString()
    };
    addMember(newMember);
    setSelectedMemberId(newMember.id);
    setIsAddingMember(false);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const member = data.members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const session: CounselingSession = {
      id: db.generateId(),
      date: sessionDate,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      notes,
      resolved
    };

    addCounseling(session);
    setView('list');
    setNotes('');
    setResolved(false);
    setSelectedMemberId('');
  };

  const toggleResolved = (session: CounselingSession) => {
    updateCounseling({ ...session, resolved: !session.resolved });
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Atendimentos Pastorais</h2>
          <p className="text-slate-500 mt-1">Gestão de aconselhamentos e acompanhamento de membros.</p>
        </div>
        
        {view === 'list' && (
            <button 
                onClick={() => setView('new')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95"
            >
                <Plus size={20} />
                <span>Novo Atendimento</span>
            </button>
        )}
      </div>

      {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Total Registrado</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors text-indigo-600"><Search size={24}/></div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-100 transition-colors">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Casos Resolvidos</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats.resolvedCount}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors text-emerald-600"><CheckCircle size={24}/></div>
            </div>
          </div>
      )}

      {view === 'new' ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-slide-up max-w-4xl mx-auto">
            <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
                <button onClick={() => setView('list')} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <h3 className="text-xl font-bold text-slate-800">Registrar Sessão</h3>
            </div>
            
            <form onSubmit={handleCreateSession} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                         <label className="block text-sm font-semibold text-slate-700">Selecionar Membro</label>
                         <div className="flex space-x-2">
                             <select 
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={selectedMemberId}
                                onChange={(e) => setSelectedMemberId(e.target.value)}
                                required
                             >
                                 <option value="">Selecione da lista...</option>
                                 {data.members.map(m => (
                                     <option key={m.id} value={m.id}>{m.name}</option>
                                 ))}
                             </select>
                             <button 
                                type="button"
                                onClick={() => setIsAddingMember(true)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-3 rounded-xl border border-indigo-200 transition-colors"
                                title="Cadastrar Novo Membro"
                             >
                                 <UserPlus size={20} />
                             </button>
                         </div>
                         {isAddingMember && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
                                <h4 className="font-bold text-sm text-slate-700 mb-3">Novo Cadastro Rápido</h4>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Nome Completo"
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                        value={newMemberName}
                                        onChange={e => setNewMemberName(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Telefone"
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                        value={newMemberPhone}
                                        onChange={e => setNewMemberPhone(e.target.value)}
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button type="button" onClick={() => setIsAddingMember(false)} className="text-xs text-slate-500 px-3 py-1">Cancelar</button>
                                        <button type="button" onClick={handleCreateMember} className="text-xs bg-slate-800 text-white px-3 py-1 rounded-md">Salvar</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Data do Atendimento</label>
                        <input 
                            type="date" 
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 flex items-center"><Calendar size={12} className="mr-1"/> Recomendado: Terças-feiras</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Anotações / Motivo</label>
                    <textarea 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px]"
                        placeholder="Descreva o motivo do atendimento, conselhos dados e próximos passos..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input 
                                type="checkbox"
                                id="resolved"
                                checked={resolved}
                                onChange={(e) => setResolved(e.target.checked)}
                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="resolved" className="font-medium text-slate-700">Questão Resolvida?</label>
                            <p className="text-slate-400 text-xs">Marque se o membro não precisa de retorno imediato sobre este assunto.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                     <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 flex items-center">
                         Salvar Atendimento <ArrowRight size={18} className="ml-2" />
                     </button>
                </div>
            </form>
        </div>
      ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
             <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Membro</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Contato</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {[...data.counseling].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(session => (
                         <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                             <td className="px-6 py-4">
                                 <div className="flex items-center">
                                     <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3">
                                         {session.memberName.charAt(0)}
                                     </div>
                                     <span className="text-sm font-semibold text-slate-700">{session.memberName}</span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-500">{new Date(session.date).toLocaleDateString('pt-BR')}</td>
                             <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{session.notes}</td>
                             <td className="px-6 py-4 text-center">
                                 {session.memberPhone ? (
                                    <span className="text-slate-400 text-xs flex items-center justify-center"><Phone size={12} className="mr-1"/> {session.memberPhone}</span>
                                 ) : <span className="text-slate-300 text-xs">-</span>}
                             </td>
                             <td className="px-6 py-4 text-center">
                                 <button 
                                    onClick={() => toggleResolved(session)}
                                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                     session.resolved 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    }`}
                                 >
                                     {session.resolved ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                     <span>{session.resolved ? 'Resolvido' : 'Pendente'}</span>
                                 </button>
                             </td>
                         </tr>
                     ))}
                     {data.counseling.length === 0 && (
                         <tr><td colSpan={5} className="text-center py-12 text-slate-400">Nenhum atendimento registrado.</td></tr>
                     )}
                 </tbody>
             </table>
             </div>
          </div>
      )}
    </div>
  );
};