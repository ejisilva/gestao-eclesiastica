import { supabase } from './supabaseClient';
import { AppData, ServiceRecord, Member, CounselingSession, ActivityRecord } from '../types';

// Helper to get current user ID efficiently from session cache
const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};

// Robust UUID generator that works in all contexts (including HTTP)
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const db = {
  // Load all data for the current user
  load: async (): Promise<AppData> => {
    try {
      const [services, members, counseling, activities] = await Promise.all([
        supabase.from('services').select('*'),
        supabase.from('members').select('*'),
        supabase.from('counseling').select('*'),
        supabase.from('activities').select('*')
      ]);

      // Mapeamento explícito para Counseling (snake_case -> camelCase)
      // O banco retorna member_name, o app espera memberName
      const mappedCounseling = (counseling.data || []).map((c: any) => ({
        id: c.id,
        date: c.date,
        memberId: c.member_id, // snake_case do DB
        memberName: c.member_name, // snake_case do DB
        memberPhone: c.member_phone, // snake_case do DB
        notes: c.notes,
        resolved: c.resolved
      }));

      return {
        services: services.data || [],
        members: members.data || [],
        counseling: mappedCounseling,
        activities: activities.data || []
      };
    } catch (e) {
      console.error("Error loading data from Supabase", e);
      return { services: [], members: [], counseling: [], activities: [] };
    }
  },

  // Services
  addService: async (record: ServiceRecord) => {
    const user_id = await getUserId();
    if (!user_id) return { error: 'No user ID' };
    
    const { error } = await supabase.from('services').insert([{ ...record, user_id }]);
    if (error) console.error("Error adding service", error);
    return error;
  },

  deleteService: async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) console.error("Error deleting service", error);
  },

  // Members
  addMember: async (member: Member) => {
    const user_id = await getUserId();
    if (!user_id) return;
    const { error } = await supabase.from('members').insert([{ ...member, user_id }]);
    if (error) console.error("Error adding member", error);
  },

  updateMember: async (member: Member) => {
    const { error } = await supabase.from('members').update(member).eq('id', member.id);
    if (error) console.error("Error updating member", error);
  },

  // Counseling
  addCounseling: async (session: CounselingSession) => {
    const user_id = await getUserId();
    if (!user_id) return;
    
    const { error } = await supabase.from('counseling').insert([{
        id: session.id,
        date: session.date,
        member_id: session.memberId,
        member_name: session.memberName,
        member_phone: session.memberPhone,
        notes: session.notes,
        resolved: session.resolved,
        user_id
    }]);
    if (error) console.error("Error adding counseling", error);
  },

  updateCounseling: async (session: CounselingSession) => {
    const { error } = await supabase.from('counseling').update({
        date: session.date,
        member_id: session.memberId,
        member_name: session.memberName,
        member_phone: session.memberPhone,
        notes: session.notes,
        resolved: session.resolved
    }).eq('id', session.id);
    if (error) console.error("Error updating counseling", error);
  },

  // Activities
  addActivity: async (activity: ActivityRecord) => {
    const user_id = await getUserId();
    if (!user_id) return;
    const { error } = await supabase.from('activities').insert([{ ...activity, user_id }]);
    if (error) console.error("Error adding activity", error);
  },

  deleteActivity: async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) console.error("Error deleting activity", error);
  },

  // Helper to generate IDs
  generateId: (): string => {
    return generateUUID();
  }
};