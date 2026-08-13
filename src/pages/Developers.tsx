import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';
import { Developer, Skill, Company } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge } from '../components/ui.tsx';
import { Search, MapPin, Briefcase, Award, ArrowRight, Users, Code2, Plus, X, Check } from 'lucide-react';

export default function Developers() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    experience_years: 3, 
    location: '', 
    bio: '',
    companyId: '',
    skillIds: [] as string[]
  });

  const queryClient = useQueryClient();

  const { data: developers, isLoading, error } = useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: async () => (await api.get('/developers')).data
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
    mutationFn: async (newDev: typeof formData) => (await api.post('/developers', newDev)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowModal(false);
      setFormData({ name: '', experience_years: 3, location: '', bio: '', companyId: '', skillIds: [] });
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !developers) return <ErrorState message="Failed to load developers." />;

  const filtered = developers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    (d.company?.name || '').toLowerCase().includes(search.toLowerCase())
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
            <Users className="w-8 h-8 text-blue-600" />
            Developer Directory
          </h1>
          <p className="text-gray-500 mt-1">Explore software engineers, their skill sets, and company connections.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search developers..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Developer
          </button>
        </div>
      </div>

      {/* Developer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(dev => (
          <Link key={dev.id} to={`/developers/${dev.id}`} className="block group">
            <Card className="p-6 h-full transition-all duration-200 hover:shadow-md hover:border-blue-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {dev.name}
                  </h3>
                  <Badge className="bg-blue-50 text-blue-700 flex items-center gap-1 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    {dev.experience_years}y exp
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dev.bio}</p>

                <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 mb-4">
                  <div className="flex items-center gap-1 text-gray-600"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {dev.location}</div>
                  {dev.company && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="w-3.5 h-3.5 text-amber-500" /> 
                      {dev.company.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Code2 className="w-3.5 h-3.5 text-gray-400 mr-1" />
                  {dev.skills?.slice(0, 4).map(skill => (
                    <Badge key={skill.id} className="bg-gray-100 text-gray-700 text-[11px]">{skill.name}</Badge>
                  ))}
                  {(dev.skills?.length || 0) > 4 && (
                    <Badge className="bg-gray-50 text-gray-500 text-[11px]">+{(dev.skills?.length || 0) - 4} more</Badge>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-blue-600 shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Enhanced Add Developer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-lg w-full bg-white space-y-4 shadow-xl border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Add Developer to Graph
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sarah Connor"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Experience (Years)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="40"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.experience_years}
                    onChange={e => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. San Francisco"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company (Works At)</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Bio / Profile Summary</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Fullstack React & Graph Engineer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              {/* Initial Skill Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Initial Skills</label>
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
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Developer'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
