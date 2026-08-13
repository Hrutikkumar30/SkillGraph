import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.ts';
import { Project, Skill, Company } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge } from '../components/ui.tsx';
import { Search, Building2, Calendar, FolderGit2, BarChart3, Code, Plus, X, Trash2, AlertTriangle, Check } from 'lucide-react';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    difficulty: 'Medium', 
    year: new Date().getFullYear(),
    companyId: '',
    skillIds: [] as string[]
  });

  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => (await api.get('/companies')).data
  });

  const { data: availableSkills } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => (await api.get('/skills')).data
  });

  const createMutation = useMutation({
    mutationFn: async (newProj: typeof formData) => (await api.post('/projects', newProj)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowModal(false);
      setFormData({ name: '', description: '', difficulty: 'Medium', year: new Date().getFullYear(), companyId: '', skillIds: [] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/projects/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeleteTarget(null);
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !projects) return <ErrorState message="Failed to load projects." />;

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.company?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleSkillSelection = (skillId: string) => {
    setFormData(prev => {
      const exists = prev.skillIds.includes(skillId);
      return {
        ...prev,
        skillIds: exists ? prev.skillIds.filter(id => id !== skillId) : [...prev.skillIds, skillId]
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
            <FolderGit2 className="w-8 h-8 text-green-600" />
            Projects Showcase
          </h1>
          <p className="text-gray-500 mt-1">Explore software projects and their associated graph tech stacks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(proj => (
          <Card key={proj.id} className="p-6 h-full flex flex-col justify-between hover:shadow-md transition-all duration-200 border-gray-200 relative group">
            <div>
              <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="font-bold text-xl text-gray-900 leading-snug">{proj.name}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge className={`flex items-center gap-1 font-semibold text-xs ${
                    proj.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border border-red-200' :
                    proj.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    <BarChart3 className="w-3 h-3" />
                    {proj.difficulty}
                  </Badge>
                  <button 
                    onClick={() => setDeleteTarget(proj)}
                    title="Delete project"
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">{proj.description}</p>
              
              <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 mb-4">
                <div className="flex items-center gap-1 text-gray-600"><Calendar className="w-3.5 h-3.5 text-blue-500"/> {proj.year}</div>
                {proj.company && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-orange-500"/> 
                    {proj.company.name}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                <Code className="w-3 h-3 text-purple-500" />
                Technologies Used ({proj.skills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {proj.skills?.map(skill => (
                  <Badge key={skill.id} className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px]">{skill.name}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-lg w-full bg-white space-y-4 shadow-xl border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-green-600" />
                Add Project to Graph
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. AI Workflow Engine"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                  <input 
                    type="number" 
                    min="2015"
                    max="2030"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company (Built For)</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                  value={formData.companyId}
                  onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                >
                  <option value="">-- Select Company (Optional) --</option>
                  {companies?.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Next-generation microservice architecture using graph databases"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Technologies Used */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Technologies Used</label>
                <div className="flex flex-wrap gap-1.5 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-36 overflow-y-auto">
                  {availableSkills?.map(s => {
                    const selected = formData.skillIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSkillSelection(s.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                          selected 
                            ? 'bg-green-600 text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {s.name}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Project'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex items-center gap-3 border-b pb-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Delete Project Node</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{deleteTarget.name}</span>? This will detach and remove the project node from your CognoDB database.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button 
                type="button" 
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Project'}
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
