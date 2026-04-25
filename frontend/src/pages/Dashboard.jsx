// src/pages/Dashboard.jsx
// Página principal del dashboard IoT

import TelemetryPanel from '../components/panels/TelemetryPanel';
import Scene3D from '../components/panels/Scene3D';
import ControlPanel from '../components/panels/ControlPanel';
import AnalyticsPanel from '../components/panels/AnalyticsPanel';
import TerminalPanel from '../components/panels/TerminalPanel';

export default function Dashboard() {
  return (
    <>
      {/* MAIN DASHBOARD LAYOUT */}
      <div className="dashboard-grid">
        {/* Left Sidebar Column: Telemetry & Control */}
        <aside className="side-column">
          <TelemetryPanel />
          <ControlPanel />
        </aside>

        {/* Center Main Column: 3D Scene -> Analytics -> Terminal */}
        <main className="main-column">
          <Scene3D />
          <AnalyticsPanel />
          <TerminalPanel />
        </main>
      </div>
    </>
  );
}
