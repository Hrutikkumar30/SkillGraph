export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  developerCount?: number;
  projectCount?: number;
  relatedCount?: number;
}

export interface Developer {
  id: string;
  name: string;
  experience_years: number;
  location: string;
  bio: string;
  company?: Company;
  skills?: Skill[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  year: number;
  company?: Company;
  skills?: Skill[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  developerCount?: number;
  projectCount?: number;
  roleCount?: number;
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  level: string;
}

export interface DashboardStats {
  developers: number;
  skills: number;
  projects: number;
  companies: number;
  jobRoles: number;
}

export interface DeveloperSkill extends Skill {
  proficiency: string;
  years: number;
}

export interface DeveloperProject extends Project {
  role: string;
}
