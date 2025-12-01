import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, ServiceRecord, Member, CounselingSession, ActivityRecord } from '../types';
import { db } from '../services/storage';
import { useAuth } from './AuthContext';

interface DataContextType {
  data: AppData;
  isLoading: boolean;
  addService: (record: ServiceRecord) => void;
  deleteService: (id: string) => void;
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  addCounseling: (session: CounselingSession) => void;
  updateCounseling: (session: CounselingSession) => void;
  addActivity: (activity: ActivityRecord) => void;
  deleteActivity: (id: string) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<AppData>({ services: [], members: [], counseling: [], activities: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
        refreshData();
    } else {
        setData({ services: [], members: [], counseling: [], activities: [] });
    }
  }, [isAuthenticated]);

  const refreshData = async () => {
    setIsLoading(true);
    const loadedData = await db.load();
    setData(loadedData);
    setIsLoading(false);
  };

  const addService = async (record: ServiceRecord) => {
    // Optimistic update
    const newData = { ...data, services: [...data.services, record] };
    setData(newData);
    await db.addService(record);
    // Optional: refreshData() to ensure sync, but optimistic is smoother
  };

  const deleteService = async (id: string) => {
    const newData = { ...data, services: data.services.filter(s => s.id !== id) };
    setData(newData);
    await db.deleteService(id);
  };

  const addMember = async (member: Member) => {
    const newData = { ...data, members: [...data.members, member] };
    setData(newData);
    await db.addMember(member);
  };

  const updateMember = async (member: Member) => {
    const newData = { 
      ...data, 
      members: data.members.map(m => m.id === member.id ? member : m) 
    };
    setData(newData);
    await db.updateMember(member);
  };

  const addCounseling = async (session: CounselingSession) => {
    const newData = { ...data, counseling: [...data.counseling, session] };
    setData(newData);
    await db.addCounseling(session);
  };

  const updateCounseling = async (session: CounselingSession) => {
    const newData = {
        ...data,
        counseling: data.counseling.map(c => c.id === session.id ? session : c)
    };
    setData(newData);
    await db.updateCounseling(session);
  };

  const addActivity = async (activity: ActivityRecord) => {
    const newData = { ...data, activities: [...data.activities, activity] };
    setData(newData);
    await db.addActivity(activity);
  };

  const deleteActivity = async (id: string) => {
    const newData = { ...data, activities: data.activities.filter(a => a.id !== id) };
    setData(newData);
    await db.deleteActivity(id);
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      isLoading,
      addService, 
      deleteService, 
      addMember, 
      updateMember,
      addCounseling, 
      updateCounseling,
      addActivity, 
      deleteActivity,
      refreshData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};