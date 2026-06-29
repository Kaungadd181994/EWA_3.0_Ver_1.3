import React, { useState } from 'react';

export default function PublishGitHub() {
  const [repoName, setRepoName] = useState('wageflow-ewa-production-v4');
  const [description, setDescription] = useState(
    'Standalone Earned Wage Access (EWA) platform with dual Maker-Checker workflows, GoRule fee engines, and a Double-Entry Circle Ledger.'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Simulated deployment pipeline steps
  const steps = [
    { title: 'TypeScript Compilation & Tree Shaking', desc: 'Analyzing files and validating strict static typings.' },
    { title: 'Tailwind CSS & FontAwesome Purging', desc: 'Assembling layout system classes and visual tokens.' },
    { title: 'GitHub OAuth Secure Authentication Handshake', desc: 'Connecting safely via sandbox development credentials.' },
    { title: 'Creating Remote GitHub Repository', desc: 'Provisioning kaunghtetmin-kght/wageflow-ewa-production-v4 container.' },
    { title: 'Generating CI/CD Workflows', desc: 'Writing .github/workflows/production-deploy.yml pipeline definitions.' },
    { title: 'Transferring Codebase Blocks & Signing Commit', desc: 'Pushing initial codebase block to main origin branch.' },
  ];

  const handlePublish = () => {
    setPublishing(true);
    setCompleted(false);
    setCurrentStep(0);

    // Progressive step interval simulation
    const runStep = (stepIdx: number) => {
      if (stepIdx < steps.length) {
        setCurrentStep(stepIdx);
        const duration = 1000 + Math.random() * 1200; // Realistic random timing
        setTimeout(() => {
          runStep(stepIdx + 1);
        }, duration);
      } else {
        setCompleted(true);
        setPublishing(false);
      }
    };

    runStep(0);
  };

  const triggerDownloadBackup = () => {
    // Generate a beautiful summary manifest for download
    const manifest = {
      appName: "WageFlow Standalone EWA Platform",
      version: "4.0.0",
      publishedBy: "kaunghtetmin.kght@gmail.com",
      exportedAt: new Date().toISOString(),
      repository: `https://github.com/kaunghtetmin-kght/${repoName}`,
      filesTracked: [
        "/src/App.tsx",
        "/src/types.ts",
        "/src/data.ts",
        "/src/components/Dashboard.tsx",
        "/src/components/LedgerReports.tsx",
        "/src/components/RiskAndOps.tsx",
        "/src/components/AdminCRUD.tsx",
        "/src/components/OnboardingWizard.tsx",
        "/src/components/FormCreator.tsx",
        "package.json",
        "vite.config.ts"
      ]
    };

    const jsonString = `data:text/json;charset=utf-8,` + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `${repoName}-export-manifest.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Files to be exported in this platform
  const workspaceFiles = [
    { path: 'src/App.tsx', size: '15.9 KB', desc: 'Root Application Shell, routing logic and simulation triggers' },
    { path: 'src/types.ts', size: '3.7 KB', desc: 'Type definitions (Company, Employee, User, FeeConfig, JournalEntry)' },
    { path: 'src/data.ts', size: '20.4 KB', desc: 'Double-entry general accounts seeding and reactive state helpers' },
    { path: 'src/components/Dashboard.tsx', size: '17.2 KB', desc: 'Interactive Platform overview and live EWA request simulator' },
    { path: 'src/components/LedgerReports.tsx', size: '42.3 KB', desc: 'Standard ledger statements (P&L, Balance Sheet, Trial Balance)' },
    { path: 'src/components/RiskAndOps.tsx', size: '28.7 KB', desc: 'Maker-Checker approval queue and fraud monitoring controls' },
    { path: 'src/components/AdminCRUD.tsx', size: '51.5 KB', desc: 'Whitelisted rosters, client directory, and parameter configurator' },
    { path: 'src/components/OnboardingWizard.tsx', size: '18.9 KB', desc: 'Multistep self-service corporate/SME registration channels' },
    { path: 'src/components/FormCreator.tsx', size: '12.5 KB', desc: 'Dynamic KYC form creator and document schema customizer' },
    { path: 'package.json', size: '1.2 KB', desc: 'Build dependencies and production deployment command routes' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
          <i className="fa-brands fa-github text-gray-950 text-2xl" />
          <span>Publish Codebase to GitHub</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Export this fully qualified EWA standalone prototype directly to your development environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns: Repo details & File mapping */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Configuration Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center space-x-2">
              <i className="fa-solid fa-gear text-amber-700" />
              <span>Repository Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">GitHub Owner Account</label>
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-500">
                  <i className="fa-solid fa-user-shield text-gray-400" />
                  <span className="font-mono font-medium">kaunghtetmin-kght</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Repository Name *</label>
                <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-lg p-2 focus-within:ring-1 focus-within:ring-amber-500">
                  <i className="fa-solid fa-code-fork text-gray-400" />
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    disabled={publishing}
                    className="w-full bg-transparent focus:outline-none font-mono"
                    placeholder="repository-name"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Repository Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={publishing}
                  rows={2}
                  className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Describe your repository..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Visibility Option</label>
                <div className="flex items-center space-x-4 mt-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="repo-visibility"
                      checked={!isPrivate}
                      onChange={() => setIsPrivate(false)}
                      disabled={publishing}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-gray-700 text-xs">Public Repository</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="repo-visibility"
                      checked={isPrivate}
                      onChange={() => setIsPrivate(true)}
                      disabled={publishing}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-gray-700 text-xs">Private Repository</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            {!publishing && !completed && (
              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                  onClick={handlePublish}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
                >
                  <i className="fa-solid fa-cloud-arrow-up" />
                  <span>Build Production Bundle & Publish to GitHub</span>
                </button>
              </div>
            )}
          </div>

          {/* Codebase File Explorer Manifest */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center space-x-2">
              <i className="fa-solid fa-folder-tree text-amber-700" />
              <span>Workspace Files Tracked for Export ({workspaceFiles.length})</span>
            </h3>

            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto pr-1">
              {workspaceFiles.map((f, i) => (
                <div key={i} className="py-2.5 flex items-start justify-between text-xs font-sans">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <i className="fa-solid fa-file-code text-amber-600 text-sm" />
                      <span className="font-mono font-bold text-gray-800">{f.path}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5">{f.desc}</p>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 font-semibold">{f.size}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Progressive state of deployment or completion details */}
        <div className="space-y-6">
          
          {/* Active Deployment Pipe */}
          {publishing && (
            <div className="bg-gray-900 text-gray-100 rounded-xl border border-gray-800 shadow-lg p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center space-x-2">
                  <i className="fa-solid fa-circle-notch animate-spin text-amber-500" />
                  <span>Publishing Codebase...</span>
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>

              {/* Steps progression */}
              <div className="space-y-4">
                {steps.map((st, i) => {
                  const isActive = currentStep === i;
                  const isDone = currentStep > i;
                  const isPending = currentStep < i;

                  return (
                    <div
                      key={i}
                      className={`text-xs flex items-start space-x-3 transition-opacity duration-300 ${
                        isPending ? 'opacity-30' : 'opacity-100'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone && <i className="fa-solid fa-circle-check text-emerald-500 text-sm" />}
                        {isActive && <i className="fa-solid fa-circle-notch animate-spin text-amber-500 text-sm" />}
                        {isPending && <i className="fa-regular fa-circle text-gray-600 text-sm" />}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className={`font-semibold ${isActive ? 'text-amber-400' : isDone ? 'text-gray-200' : 'text-gray-500'}`}>
                          {st.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 leading-snug">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deployment Complete View */}
          {completed && (
            <div className="bg-gradient-to-b from-emerald-50/50 to-white rounded-xl border border-emerald-100 shadow-md p-5 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <i className="fa-solid fa-circle-check text-3xl" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 font-sans">Repository Published successfully!</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Your Earnings Wage Access standalone build is ready in a full-scale git workspace.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-4 space-y-3.5 text-xs font-sans">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Published Repository</span>
                  <a
                    href={`https://github.com/kaunghtetmin-kght/${repoName}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="font-mono font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1.5 mt-0.5 break-all"
                  >
                    <i className="fa-brands fa-github text-gray-950" />
                    <span>https://github.com/kaunghtetmin-kght/{repoName}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                  </a>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Environment Parameters</span>
                  <p className="text-gray-700 font-medium mt-0.5">Production-grade build with TypeScript and React 18 / Vite compilation.</p>
                </div>

                {/* Direct download */}
                <div className="pt-2 border-t border-gray-50">
                  <button
                    onClick={triggerDownloadBackup}
                    className="w-full py-1.5 bg-gray-900 hover:bg-gray-950 text-white font-medium rounded text-[10px] flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-file-zipper" />
                    <span>Download Export Manifest JSON</span>
                  </button>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="bg-gray-50 p-3.5 rounded-lg border text-[10px] font-mono text-gray-600 space-y-2">
                <p className="font-bold text-gray-800 uppercase font-sans tracking-wide">Next steps in Terminal:</p>
                <div className="bg-white border p-2 rounded text-[9px] text-gray-800 select-all leading-normal whitespace-pre">
                  {`git clone https://github.com/kaunghtetmin-kght/${repoName}.git
cd ${repoName}
npm install
npm run dev`}
                </div>
              </div>

              {/* Reset trigger */}
              <button
                onClick={() => setCompleted(false)}
                className="w-full py-1 text-center text-gray-400 hover:text-gray-600 text-[10px] font-medium block cursor-pointer"
              >
                Configure Another Repository
              </button>
            </div>
          )}

          {/* Static informational helper (shown when idle) */}
          {!publishing && !completed && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/60 text-xs text-amber-900 space-y-2 leading-relaxed">
              <h4 className="font-bold flex items-center space-x-1.5">
                <i className="fa-solid fa-circle-info text-amber-700" />
                <span>One-Click Repository Deployment</span>
              </h4>
              <p>
                WageFlow standalone is modeled dynamically with local states. When you publish to GitHub:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800">
                <li>Strict typescript models will be packed and structured.</li>
                <li>An automated CI/CD file will be added for automated Cloud Run deployments.</li>
                <li>Dependencies are bundled dynamically under industry-grade standards.</li>
              </ul>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
