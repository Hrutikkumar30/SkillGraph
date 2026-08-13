import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.ts';
import { Developer, DeveloperSkill, DeveloperProject, Skill } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge, EmptyState } from '../components/ui.tsx';
import { ArrowLeft, MapPin, Briefcase, Star, Users, Trash2, Edit, Plus, X, Award, AlertTriangle } from 'lucide-react';

export default function DeveloperDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editForm, setEditForm] = useState({ name: '', experience_years: 0, location: '', bio: '' });
  const [skillForm, setSkillForm] = useState({ skillId: '', proficiency: 'Intermediate', years: 2 });

  const { data: dev, isLoading: devLoading } = useQuery<Developer>({
    queryKey: ['developer', id],
    queryFn: async () => {
      const data = (await api.get(`/developers/${id}`)).data;
      setEditForm({ name: data.name, experience_years: data.experience_years, location: data.location, bio: data.bio });
      return data;
    }
  });

  const { data: skills, isLoading: skillsLoading } = useQuery<DeveloperSkill[]>({
    queryKey: ['developer-skills', id],
    queryFn: async () => (await api.get(`/developers/${id}/skills`)).data
  });

  const { data: allSkills } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => (await api.get('/skills')).data
  });

  const { data: projects, isLoading: projLoading } = useQuery<DeveloperProject[]>({
    queryKey: ['developer-projects', id],
    queryFn: async () => (await api.get(`/developers/${id}/projects`)).data
  });

  const { data: similar, isLoading: simLoading } = useQuery<any[]>({
    queryKey: ['developer-similar', id],
    queryFn: async () => (await api.get(`/developers/${id}/similar`)).data
  });

  const { data: recommendations, isLoading: recLoading } = useQuery<any[]>({
    queryKey: ['developer-recommendations', id],
    queryFn: async () => (await api.get(`/developers/${id}/recommendations`)).data
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (updated: typeof editForm) => (await api.put(`/developers/${id}`, updated)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer', id] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setShowEditModal(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => (await api.delete(`/developers/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowDeleteModal(false);
      navigate('/developers');
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: async (payload: typeof skillForm) => (await api.post(`/developers/${id}/skills`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-skills', id] });
      queryClient.invalidateQueries({ queryKey: ['developer-recommendations', id] });
      queryClient.invalidateQueries({ queryKey: ['developer-similar', id] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setShowAddSkillModal(false);
      setSkillForm({ skillId: '', proficiency: 'Intermediate', years: 2 });
    }
  });

  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: string) => (await api.delete(`/developers/${id}/skills/${skillId}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-skills', id] });
      queryClient.invalidateQueries({ queryKey: ['developer-recommendations', id] });
      queryClient.invalidateQueries({ queryKey: ['developer-similar', id] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    }
  });

  const isLoading = devLoading || skillsLoading || projLoading || simLoading || recLoading;

  if (isLoading) return <LoadingState />;
  if (!dev) return <ErrorState message="Developer not found" />;

  const availableSkillsToAdd = allSkills?.filter(s => !skills?.some(ds => ds.id === s.id)) || [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <Link to="/developers" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Developers
        </Link>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
            Edit Profile
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteMutation.isPending}
            className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="pb-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{dev.name}</h1>
          <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {dev.experience_years} years exp
          </Badge>
        </div>
        <div className="flex gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-rose-500"/> {dev.location}</div>
          {dev.company && <div className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-amber-500"/> {dev.company.name}</div>}
        </div>
        <p className="text-lg text-gray-600">{dev.bio}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Skills Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-bold text-gray-900">Skills & Proficiency</h2>
            <button 
              onClick={() => setShowAddSkillModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>

          {skills?.length ? (
            <div className="space-y-3">
              {skills.map(skill => (
                <Card key={skill.id} className="p-4 flex justify-between items-center border-gray-200 hover:border-blue-200 transition-colors">
                  <div>
                    <div className="font-bold text-gray-900">{skill.name}</div>
                    <div className="text-xs text-gray-500">{skill.category}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className="bg-blue-50 text-blue-700 mb-0.5">{skill.proficiency}</Badge>
                      <div className="text-xs text-gray-500">{skill.years} yrs exp</div>
                    </div>
                    <button 
                      onClick={() => removeSkillMutation.mutate(skill.id)}
                      title="Remove skill from developer"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : <EmptyState message="No skills mapped yet. Click '+ Add Skill' to attach skills." />}
        </div>

        {/* Insights & Recommendations */}
        <div className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Skill Recommendations
            </h2>
            <p className="text-sm text-gray-500">Based on graph connections to existing skills.</p>
            {recommendations?.length ? (
              <div className="space-y-3">
                {recommendations.slice(0,3).map((rec, i) => (
                  <Card key={i} className="p-4 bg-amber-50/40 border-amber-200">
                    <div className="font-bold text-gray-900 mb-1">{rec.name}</div>
                    <div className="text-xs text-gray-600">
                      Related to known skills: <span className="font-medium text-amber-900">{rec.relatedKnownSkills.join(', ')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <EmptyState message="No recommendations available yet." />}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Similar Developers
            </h2>
            <p className="text-sm text-gray-500">Developers sharing the most skills in the graph.</p>
            {similar?.length ? (
              <div className="space-y-3">
                {similar.slice(0,3).map((sim) => (
                  <Link key={sim.id} to={`/developers/${sim.id}`} className="block">
                    <Card className="p-4 hover:border-blue-300 transition-colors">
                      <div className="font-bold text-gray-900">{sim.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sim.sharedSkills} shared skills: {sim.sharedSkillNames.join(', ')}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : <EmptyState message="No similar developers found." />}
          </div>

        </div>
      </div>

      {/* Edit Developer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Developer Profile
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(editForm); }} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Experience Years</label>
                  <input 
                    type="number" 
                    min="0"
                    max="40"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={editForm.experience_years}
                    onChange={e => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bio</label>
                <textarea 
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex items-center gap-3 border-b pb-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Delete Developer</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{dev.name}</span>? This will detach and remove the developer node and all skill relationship edges from your CognoDB database.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Developer'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Skill to Developer Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Assign Skill to {dev.name}
              </h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); addSkillMutation.mutate(skillForm); }} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Skill</label>
                <select 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={skillForm.skillId}
                  onChange={e => setSkillForm({ ...skillForm, skillId: e.target.value })}
                >
                  <option value="">-- Select a skill node --</option>
                  {availableSkillsToAdd.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Proficiency Level</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={skillForm.proficiency}
                    onChange={e => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                  >
                    <option value="Expert">Expert</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Years Experience</label>
                  <input 
                    type="number" 
                    min="1"
                    max="30"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={skillForm.years}
                    onChange={e => setSkillForm({ ...skillForm, years: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addSkillMutation.isPending || !skillForm.skillId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {addSkillMutation.isPending ? 'Assigning...' : 'Assign Skill'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
