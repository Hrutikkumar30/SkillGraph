import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';
import { DashboardStats } from '../types/index.ts';
import { Card, LoadingState, ErrorState } from '../components/ui.tsx';
import { 
  Users, 
  Code, 
  FolderGit2, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Database, 
  Zap, 
  Compass, 
  Network,
  ArrowRight,
  GitFork,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !stats) return <ErrorState message="Could not load dashboard statistics." />;

  const statCards = [
    { label: 'Developers', value: stats.developers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/developers' },
    { label: 'Skills', value: stats.skills, icon: Code, color: 'text-purple-600', bg: 'bg-purple-100', link: '/skills' },
    { label: 'Projects', value: stats.projects, icon: FolderGit2, color: 'text-green-600', bg: 'bg-green-100', link: '/projects' },
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-100', link: '/developers' },
    { label: 'Job Roles', value: stats.jobRoles, icon: Briefcase, color: 'text-pink-600', bg: 'bg-pink-100', link: '/career' },
  ];

  const quickFeatures = [
    {
      title: 'Career Explorer',
      description: 'Analyze developer skill gaps against target job roles to find optimal learning paths.',
      icon: Compass,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      link: '/career'
    },
    {
      title: 'Graph Visualizer',
      description: 'Explore live multi-hop node connections, relationship edges, and properties.',
      icon: Network,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      link: '/graph'
    },
    {
      title: 'Skill Network',
      description: 'Discover organic relationship links between languages, frameworks, and tools.',
      icon: GitFork,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      link: '/skills'
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-xs font-semibold text-blue-300 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Graph Database Architecture
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SkillGraph Engine</h1>
          <p className="text-blue-100/80 text-base leading-relaxed">
            Discover deep interconnected relationships between Developers, Skills, Projects, Companies, and Job Roles powered by CognoDB graph traversals.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link} className="block group">
            <Card className="p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-gray-200">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Interactive Exploration Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickFeatures.map((feat) => (
            <Link key={feat.title} to={feat.link} className="block group">
              <Card className={`p-6 h-full ${feat.bg} border ${feat.border} hover:shadow-md transition-all flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white shadow-xs ${feat.color}`}>
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-gray-900" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feat.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Database Architecture Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Why a Graph Database?</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Relational databases require multi-table <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono text-xs">JOIN</code> queries to query multi-hop relationships, leading to high latency and complex Cypher translation.
            </p>
            <p>
              In <strong>CognoDB</strong>, graph nodes and relationship edges are index-free adjacent:
            </p>
            <div className="bg-slate-900 text-blue-300 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner">
              (Developer)-[:HAS_SKILL]-&gt;(Skill)-[:RELATED_TO]-(Skill)&lt;-[:REQUIRES_SKILL]-(JobRole)
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Sub-millisecond multi-hop relationship traversals for skill gap matching.
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <GitFork className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Graph Schema Relationships</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">[:HAS_SKILL]</span>
                <p className="text-gray-500">Developer &rarr; Skill (Proficiency & Years)</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">[:WORKED_ON]</span>
                <p className="text-gray-500">Developer &rarr; Project (Role)</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">[:USES_SKILL]</span>
                <p className="text-gray-500">Project &rarr; Skill</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">[:RELATED_TO]</span>
                <p className="text-gray-500">Skill &rarr; Skill (Multi-hop)</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">[:REQUIRES_SKILL]</span>
                <p className="text-gray-500">JobRole &rarr; Skill</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">[:WORKS_AT]</span>
                <p className="text-gray-500">Developer &rarr; Company</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
