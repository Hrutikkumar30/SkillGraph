import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.ts';
import { Company, Developer, Project, JobRole } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge, EmptyState } from '../components/ui.tsx';
import { ArrowLeft, MapPin, Building2, Users, FolderGit2, Briefcase, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

interface CompanyDetailData extends Company {
  developers?: Developer[];
  projects?: Project[];
  jobRoles?: JobRole[];
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', industry: 'Software', location: '' });

  const { data: company, isLoading, error } = useQuery<CompanyDetailData>({
    queryKey: ['company', id],
    queryFn: async () => {
      const data = (await api.get(`/companies/${id}`)).data;
      setEditForm({ name: data.name, industry: data.industry, location: data.location });
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: typeof editForm) => (await api.put(`/companies/${id}`, updated)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setShowEditModal(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => (await api.delete(`/companies/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowDeleteModal(false);
      navigate('/companies');
    }
  });

  if (isLoading) return <LoadingState />;
  if (error || !company) return <ErrorState message="Company not found" />;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <Link to="/companies" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Companies
        </Link>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-amber-600" />
            Edit Company
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
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <Badge className="bg-amber-100 text-amber-800">{company.industry}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-rose-500"/> {company.location}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Developers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
            <Users className="w-5 h-5 text-blue-500" />
            Engineering Team ({company.developers?.length || 0})
          </div>
          {company.developers?.length ? (
            <div className="space-y-3">
              {company.developers.map(dev => (
                <Link key={dev.id} to={`/developers/${dev.id}`}>
                  <Card className="p-4 hover:border-blue-300 transition-colors">
                    <div className="font-bold text-gray-900">{dev.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{dev.experience_years} yrs exp &bull; {dev.location}</div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <EmptyState message="No developers linked to this company yet." />}
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
            <FolderGit2 className="w-5 h-5 text-green-500" />
            Projects Built ({company.projects?.length || 0})
          </div>
          {company.projects?.length ? (
            <div className="space-y-3">
              {company.projects.map(proj => (
                <Card key={proj.id} className="p-4">
                  <div className="font-bold text-gray-900">{proj.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{proj.description}</div>
                </Card>
              ))}
            </div>
          ) : <EmptyState message="No projects built for this company yet." />}
        </div>

        {/* Hiring Roles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            Hiring Roles ({company.jobRoles?.length || 0})
          </div>
          {company.jobRoles?.length ? (
            <div className="space-y-3">
              {company.jobRoles.map(role => (
                <Card key={role.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">{role.title}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 text-xs">{role.level}</Badge>
                </Card>
              ))}
            </div>
          ) : <EmptyState message="No open hiring roles listed." />}
        </div>

      </div>

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-600" />
                Edit Company Details
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(editForm); }} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Industry</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  value={editForm.industry}
                  onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  value={editForm.location}
                  onChange={e => setEditForm({ ...editForm, location: e.target.value })}
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
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 shadow-xl border-gray-200 relative">
            <div className="flex items-center gap-3 border-b pb-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Delete Company Node</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{company.name}</span>? This will detach and remove the company node from your CognoDB database.
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
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Company'}
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
