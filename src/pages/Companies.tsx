import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';
import { Company, Developer, Project, JobRole } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge } from '../components/ui.tsx';
import { Search, Building2, MapPin, Users, FolderGit2, Briefcase, Plus, X, ArrowRight, Check } from 'lucide-react';

export default function Companies() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    industry: 'Software', 
    location: '',
    roleIds: [] as string[],
    developerIds: [] as string[],
    projectIds: [] as string[]
  });

  const queryClient = useQueryClient();

  const { data: companies, isLoading, error } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => (await api.get('/companies')).data
  });

  const { data: jobRoles } = useQuery<JobRole[]>({
    queryKey: ['job-roles'],
    queryFn: async () => (await api.get('/job-roles')).data
  });

  const { data: developers } = useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: async () => (await api.get('/developers')).data
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data
  });

  const createMutation = useMutation({
    mutationFn: async (newComp: typeof formData) => (await api.post('/companies', newComp)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowModal(false);
      setFormData({ name: '', industry: 'Software', location: '', roleIds: [], developerIds: [], projectIds: [] });
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !companies) return <ErrorState message="Failed to load companies." />;

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const toggleArrayItem = (key: 'roleIds' | 'developerIds' | 'projectIds', id: string) => {
    setFormData(prev => {
      const exists = prev[key].includes(id);
      return {
        ...prev,
        [key]: exists ? prev[key].filter(item => item !== id) : [...prev[key], id]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-600" />
            Companies Directory
          </h1>
          <p className="text-gray-500 mt-1">Explore organizations, associated engineering teams, and hiring roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(comp => (
          <Link key={comp.id} to={`/companies/${comp.id}`} className="block group">
            <Card className="p-6 h-full flex flex-col justify-between hover:shadow-md transition-all duration-200 border-gray-200 hover:border-amber-300">
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors">{comp.name}</h3>
                  <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-xs shrink-0">
                    {comp.industry}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-4">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {comp.location}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
                <div className="flex gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1" title="Developers employed">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{comp.developerCount || 0} devs</span>
                  </div>
                  <div className="flex items-center gap-1" title="Projects built">
                    <FolderGit2 className="w-3.5 h-3.5 text-green-500" />
                    <span>{comp.projectCount || 0} projs</span>
                  </div>
                  <div className="flex items-center gap-1" title="Open hiring roles">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    <span>{comp.roleCount || 0} roles</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-amber-600 shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Enhanced Add Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-lg w-full bg-white space-y-4 shadow-xl border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                Add Company to Graph
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Nexus Cybernetics"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Industry</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  >
                    <option value="Software">Software</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="AI / Robotics">AI / Robotics</option>
                    <option value="Food Tech">Food Tech</option>
                    <option value="Cloud Infra">Cloud Infra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Hiring Roles Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Open Hiring Roles (HIRING_FOR)</label>
                <div className="flex flex-wrap gap-1.5 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-28 overflow-y-auto">
                  {jobRoles?.map(r => {
                    const selected = formData.roleIds.includes(r.id);
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => toggleArrayItem('roleIds', r.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                          selected 
                            ? 'bg-purple-600 text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {r.title} ({r.level})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Developers Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Employed Developers (WORKS_AT)</label>
                <div className="flex flex-wrap gap-1.5 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-28 overflow-y-auto">
                  {developers?.map(d => {
                    const selected = formData.developerIds.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleArrayItem('developerIds', d.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                          selected 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Projects Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Projects Built (BUILT_FOR)</label>
                <div className="flex flex-wrap gap-1.5 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-28 overflow-y-auto">
                  {projects?.map(p => {
                    const selected = formData.projectIds.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggleArrayItem('projectIds', p.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                          selected 
                            ? 'bg-green-600 text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Company'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
