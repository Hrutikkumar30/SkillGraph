import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api.ts';
import { Developer, JobRole, Skill } from '../types/index.ts';
import { Card, LoadingState, ErrorState, Badge, EmptyState } from '../components/ui.tsx';
import { Compass, ArrowRight, Lightbulb, UserCheck, Target, Sparkles, CheckCircle2, GitCommit } from 'lucide-react';

interface CareerPathResult {
  requiredSkill: Skill;
  connectedKnownSkills: Skill[];
}

export default function CareerPath() {
  const [selectedDev, setSelectedDev] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: developers } = useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: async () => (await api.get('/developers')).data
  });

  const { data: roles } = useQuery<JobRole[]>({
    queryKey: ['job-roles'],
    queryFn: async () => (await api.get('/job-roles')).data
  });

  const { data: path, isLoading, isFetching } = useQuery<CareerPathResult[]>({
    queryKey: ['career-path', selectedDev, selectedRole],
    queryFn: async () => {
      const { data } = await api.get(`/career-path?developerId=${selectedDev}&jobRoleId=${selectedRole}`);
      return data;
    },
    enabled: !!selectedDev && !!selectedRole
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Compass className="w-8 h-8 text-amber-600" />
          Career & Skill Path Explorer
        </h1>
        <p className="text-gray-600 text-base">
          Analyze skill gap requirements between developers and target job roles powered by graph relationship traversals.
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-amber-50/50 via-orange-50/30 to-yellow-50/50 border-amber-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" />
              1. Select Developer
            </label>
            <select 
              className="w-full border-gray-300 rounded-xl shadow-xs focus:ring-amber-500 focus:border-amber-500 bg-white px-4 py-2.5 border text-sm font-medium text-gray-900"
              value={selectedDev}
              onChange={(e) => setSelectedDev(e.target.value)}
            >
              <option value="">-- Choose a developer --</option>
              {developers?.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name} ({dev.experience_years}y exp)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600" />
              2. Target Job Role
            </label>
            <select 
              className="w-full border-gray-300 rounded-xl shadow-xs focus:ring-purple-500 focus:border-purple-500 bg-white px-4 py-2.5 border text-sm font-medium text-gray-900"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">-- Choose a target role --</option>
              {roles?.map(role => (
                <option key={role.id} value={role.id}>{role.title} ({role.level})</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedDev && selectedRole && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Recommended Skill Gap Analysis
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {path?.length || 0} skills to learn
            </span>
          </div>
          
          {(isLoading || isFetching) ? <LoadingState /> : 
           !path?.length ? (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-green-900 mb-1">Target Role Qualifications Met!</h3>
              <p className="text-sm text-green-700">This developer already possesses all required skills for this job role.</p>
            </Card>
           ) : (
            <div className="space-y-4">
              {path.map((item, idx) => (
                <Card key={idx} className="p-6 overflow-hidden relative border-gray-200 hover:border-amber-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-900">Learn {item.requiredSkill.name}</h3>
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">{item.requiredSkill.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed pl-11">{item.requiredSkill.description}</p>
                    </div>
                    
                    {item.connectedKnownSkills.length > 0 && (
                      <div className="flex-1 bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                          Graph Connection Reasoning
                        </div>
                        <p className="text-xs text-slate-300">Organically relates to existing developer skills:</p>
                        <div className="flex flex-wrap gap-2 items-center pt-1">
                          {item.connectedKnownSkills.map((known) => (
                            <React.Fragment key={known.id}>
                              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">{known.name}</Badge>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs font-bold text-amber-300">{item.requiredSkill.name}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.connectedKnownSkills.length === 0 && (
                      <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-500 italic leading-relaxed">
                        Core prerequisite for the target position. Direct relationship edges to current skills are not yet mapped.
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
           )}
        </div>
      )}
    </div>
  );
}
