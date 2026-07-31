import React from 'react';
import { Download, Code, Server, FileCode, CheckCircle } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const handleDownloadPostman = () => {
    window.open('/api/postman-collection', '_blank');
  };

  const handleViewOpenApiJson = () => {
    window.open('/api/openapi.json', '_blank');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">API Documentation & Postman Collection</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            OpenAPI (Swagger 3.0) specs and Postman Collection v2.1 for integration with Moderator/Staff/Admin modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleViewOpenApiJson}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <FileCode className="w-4 h-4 text-slate-600" />
            <span>View OpenAPI JSON</span>
          </button>
          <button
            onClick={handleDownloadPostman}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Postman Collection</span>
          </button>
        </div>
      </div>

      {/* Endpoints Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Server className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Grievance Portal REST API Endpoints</h3>
            <p className="text-xs text-slate-400">Standard REST API endpoints operating on Node.js/Express MVC</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Complaint Endpoints */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Complaint APIs</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">GET</span>
                <span>/api/complaints</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">POST</span>
                <span>/api/complaints</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">GET</span>
                <span>/api/complaints/:id</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">POST</span>
                <span>/api/complaints/:id/remarks</span>
              </div>
            </div>
          </div>

          {/* Notification Endpoints */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Notification APIs</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">GET</span>
                <span>/api/notifications</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">PATCH</span>
                <span>/api/notifications/:id/read</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">PATCH</span>
                <span>/api/notifications/read-all</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">DELETE</span>
                <span>/api/notifications/:id</span>
              </div>
            </div>
          </div>

          {/* User Profile Endpoints */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">User Profile APIs</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">GET</span>
                <span>/api/profile</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">PUT</span>
                <span>/api/profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
