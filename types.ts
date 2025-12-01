// Enums for standardizing types
export enum ServiceType {
  CULTO_QUARTA = 'Culto de Quarta',
  CULTO_DOMINGO = 'Culto de Domingo',
  VIGILIA = 'Vigília',
  JORNADA = 'Jornada de Oração'
}

export enum ActivityType {
  VISITA_PASTORAL = 'Visita Pastoral',
  CONSAGRACAO_CASA = 'Consagração de Casa',
  CONSAGRACAO_NEGOCIO = 'Consagração de Negócio',
  ATIVIDADE_INTERNA = 'Atividade Interna'
}

// Interfaces
export interface Demographics {
  men: number;
  women: number;
  adolescents: number;
  children: number;
  gmeet: number;
}

export interface ServiceRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: ServiceType;
  attendance: Demographics;
  total: number;
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  since: string;
}

export interface CounselingSession {
  id: string;
  date: string;
  memberId: string; // Relational link to Member
  memberName: string; // Denormalized for easier display/export
  memberPhone: string;
  notes: string;
  resolved: boolean;
}

export interface ActivityRecord {
  id: string;
  date: string;
  type: ActivityType;
  description: string;
  location?: string;
}

export interface AppData {
  services: ServiceRecord[];
  members: Member[];
  counseling: CounselingSession[];
  activities: ActivityRecord[];
}