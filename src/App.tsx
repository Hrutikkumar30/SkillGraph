import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './layouts/AppShell.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Skills from './pages/Skills.tsx';
import SkillDetail from './pages/SkillDetail.tsx';
import CareerPath from './pages/CareerPath.tsx';
import Developers from './pages/Developers.tsx';
import DeveloperDetail from './pages/DeveloperDetail.tsx';
import Projects from './pages/Projects.tsx';
import Companies from './pages/Companies.tsx';
import CompanyDetail from './pages/CompanyDetail.tsx';
import GraphExplorer from './pages/GraphExplorer.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="skills" element={<Skills />} />
            <Route path="skills/:id" element={<SkillDetail />} />
            <Route path="developers" element={<Developers />} />
            <Route path="developers/:id" element={<DeveloperDetail />} />
            <Route path="projects" element={<Projects />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="career" element={<CareerPath />} />
            <Route path="graph" element={<GraphExplorer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
