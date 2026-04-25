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
        {/* Left Column: Telemetry & Control */}
        <div className="side-column">
          <TelemetryPanel />
          <ControlPanel />
        </div>

        {/* Center/Right Column: 3D Scene & Analytics */}
        <div className="main-column">
          <Scene3D />
          <AnalyticsPanel />
        </div>
      </div>

      {/* BOTTOM ROW: Terminal */}
      <div className="terminal-row">
        <TerminalPanel />
      </div>
    </>
  );
}
