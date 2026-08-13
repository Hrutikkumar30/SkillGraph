import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.ts';
import { Skill, Developer, Project } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge, EmptyState } from '../components/ui.tsx';
import { ArrowLeft, Users, FolderGit2, Link as LinkIcon, Edit, Trash2, Code, X, AlertTriangle } from 'lucide-react';

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: 'Frontend', description: '' });

  const { data: skill, isLoading: skillLoading } = useQuery<Skill>({
    queryKey: ['skill', id],
    queryFn: async () => {
      const data = (await api.get(`/skills/${id}`)).data;
      setEditForm({ name: data.name, category: data.category, description: data.description });
      return data;
    }
  });

  const { data: developers, isLoading: devLoading } = useQuery<Developer[]>({
    queryKey: ['skill-developers', id],
    queryFn: async () => (await api.get(`/skills/${id}/developers`)).data
  });

  const { data: projects, isLoading: projLoading } = useQuery<Project[]>({
    queryKey: ['skill-projects', id],
    queryFn: async () => (await api.get(`/skills/${id}/projects`)).data
  });

  const { data: related, isLoading: relLoading } = useQuery<Skill[]>({
    queryKey: ['skill-related', id],
    queryFn: async () => (await api.get(`/skills/${id}/related`)).data
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: typeof editForm) => (await api.put(`/skills/${id}`, updated)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill', id] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setShowEditModal(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => (await api.delete(`/skills/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowDeleteModal(false);
      navigate('/skills');
    }
  });

  const isLoading = skillLoading || devLoading || projLoading || relLoading;

  if (isLoading) return <LoadingState />;
  if (!skill) return <ErrorState message="Skill not found" />;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <Link to="/skills" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Skills
        </Link>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-purple-600" />
            Edit Skill
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
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
          <Badge className="bg-purple-100 text-purple-700">{skill.category}</Badge>
        </div>
        <p className="text-lg text-gray-600">{skill.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Developers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="w-5 h-5 text-gray-500" />
            Developers ({developers?.length || 0})
          </div>
          {developers?.length ? (
            <div className="space-y-3">
              {developers.map(dev => (
                <Link key={dev.id} to={`/developers/${dev.id}`}>
                  <Card className="p-4 hover:border-blue-300 transition-colors">
                    <div className="font-bold text-gray-900">{dev.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{dev.experience_years} years experience &bull; {dev.location}</div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <EmptyState message="No developers have this skill yet." />}
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FolderGit2 className="w-5 h-5 text-gray-500" />
            Projects ({projects?.length || 0})
          </div>
          {projects?.length ? (
            <div className="space-y-3">
              {projects.map(proj => (
                <Link key={proj.id} to={`/projects/${proj.id}`}>
                  <Card className="p-4 hover:border-blue-300 transition-colors">
                    <div className="font-bold text-gray-900">{proj.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{proj.description}</div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <EmptyState message="No projects use this skill yet." />}
        </div>

        {/* Related Skills */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <LinkIcon className="w-5 h-5 text-gray-500" />
            Related Skills ({related?.length || 0})
          </div>
          {related?.length ? (
            <div className="space-y-3">
              {related.map(rel => (
                <Link key={rel.id} to={`/skills/${rel.id}`}>
                  <Card className="p-4 hover:border-blue-300 transition-colors flex justify-between items-center">
                    <div className="font-bold text-gray-900">{rel.name}</div>
                    <Badge className="bg-gray-100 text-gray-600">{rel.category}</Badge>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <EmptyState message="No related skills mapped." />}
        </div>

      </div>

      {/* Edit Skill Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Edit Skill Node
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(editForm); }} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Skill Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  value={editForm.category}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
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
                <h3 className="font-bold text-lg text-gray-900">Delete Skill Node</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{skill.name}</span>? This will detach and remove the skill node and all relationship connections from your CognoDB database.
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
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Skill'}
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
