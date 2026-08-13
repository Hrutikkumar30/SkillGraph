import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api.ts';
import { Card, LoadingState, ErrorState, EmptyState } from '../components/ui.tsx';
import { Search, Network } from 'lucide-react';

export default function GraphExplorer() {
  const [nodeId, setNodeId] = useState('dev-alice');
  const [nodeType, setNodeType] = useState('Developer');

  const { data: graph, isLoading, error } = useQuery({
    queryKey: ['graph', nodeType, nodeId],
    queryFn: async () => {
      const { data } = await api.get(`/graph/${nodeType}/${nodeId}`);
      return data;
    },
    enabled: !!nodeId && !!nodeType
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Network className="w-8 h-8 text-blue-600" />
          Graph Explorer
        </h1>
        <p className="text-gray-500 mt-2">Visualize relationships in the knowledge graph.</p>
      </div>

      <Card className="p-6 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border bg-white"
              value={nodeType}
              onChange={e => setNodeType(e.target.value)}
            >
              <option value="Developer">Developer</option>
              <option value="Skill">Skill</option>
              <option value="Project">Project</option>
              <option value="Company">Company</option>
              <option value="JobRole">Job Role</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
            <input 
              type="text" 
              className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border bg-white"
              value={nodeId}
              onChange={e => setNodeId(e.target.value)}
              placeholder="e.g. dev-alice, skill-react"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">Enter an exact ID from the database to explore its immediate relationships.</p>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex items-center justify-center">
        {isLoading && <LoadingState />}
        {error && <ErrorState message="Could not load graph data. Make sure the ID exists." />}
        {graph && !isLoading && !error && (
          <div className="p-8 w-full">
            <div className="mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900">Found {graph.nodes.length} Nodes & {graph.links.length} Relationships</h3>
              <p className="text-sm text-gray-500">Visualizing raw JSON data for direct graph connections.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Nodes</h4>
                <div className="space-y-3">
                  {graph.nodes.map((n: any) => (
                    <div key={n.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-bold text-blue-700">({n.label})</span> {n.name || n.title} <span className="text-xs text-gray-500">[{n.id}]</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Relationships</h4>
                {graph.links.length > 0 ? (
                  <div className="space-y-3">
                    {graph.links.map((l: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">{l.source}</span>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">-[:{l.type}]-&gt;</span>
                        <span className="font-medium text-gray-700">{l.target}</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState message="No relationships found for this node." />}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
