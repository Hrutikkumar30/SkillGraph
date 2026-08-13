import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Network,
  Users,
  Code,
  FolderGit2,
  Compass,
  LayoutDashboard,
  Activity,
  Building2,
} from "lucide-react";
import { cn } from "../components/ui.tsx";

const navItems = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Skills", to: "/skills", icon: Code },
  { name: "Developers", to: "/developers", icon: Users },
  { name: "Projects", to: "/projects", icon: FolderGit2 },
  { name: "Companies", to: "/companies", icon: Building2 },
  { name: "Career Explorer", to: "/career", icon: Compass },
  { name: "Graph Explorer", to: "/graph", icon: Network },
];

export function AppShell() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-xl text-blue-600">
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              SkillGraph
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Database Status Indicator */}
        <div className="p-4 m-4 bg-slate-900 text-white rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            CognoDB Graph Connected
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Cypher graph driver connected via Bolt protocol.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
