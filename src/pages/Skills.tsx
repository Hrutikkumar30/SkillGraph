import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';
import { Skill } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge } from '../components/ui.tsx';
import { Search, Users, FolderGit2, Code, ArrowRight, Layers, Share2, Plus, X } from 'lucide-react';

export default function Skills() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Frontend', description: '' });

  const queryClient = useQueryClient();

  const { data: skills, isLoading, error } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => (await api.get('/skills')).data
  });

  const createMutation = useMutation({
    mutationFn: async (newSkill: typeof formData) => (await api.post('/skills', newSkill)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowModal(false);
      setFormData({ name: '', category: 'Frontend', description: '' });
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !skills) return <ErrorState message="Failed to load skills." />;

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

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
            <Code className="w-8 h-8 text-purple-600" />
            Skill Repository
          </h1>
          <p className="text-gray-500 mt-1">Browse technologies and discover their graph relationships.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search skills..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-sm text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map(skill => (
          <Link key={skill.id} to={`/skills/${skill.id}`} className="block group">
            <Card className="p-6 h-full flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-purple-300">
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                    {skill.name}
                  </h3>
                  <Badge className="bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1 text-xs">
                    <Layers className="w-3 h-3" />
                    {skill.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{skill.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                <div className="flex gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5" title="Developers proficient">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{skill.developerCount || 0} devs</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Active Projects">
                    <FolderGit2 className="w-3.5 h-3.5 text-green-500" />
                    <span>{skill.projectCount || 0} projs</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Related Skills">
                    <Share2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>{skill.relatedCount || 0} related</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-purple-600 shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Add Skill Node to Graph
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Skill Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rust, Vue.js, PyTorch"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Language">Language</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cloud">Cloud</option>
                  <option value="API">API</option>
                  <option value="Tooling">Tooling</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. High-performance systems programming language"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
