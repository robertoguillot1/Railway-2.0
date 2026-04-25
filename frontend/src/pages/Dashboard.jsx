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
      {/* TOP ROW: Telemetry | 3D Scene | Control */}
      <div className="top-grid">
        <TelemetryPanel />
        <Scene3D />
        <ControlPanel />
      </div>

      {/* BOTTOM ROW: Chart | Terminal */}
      <div className="bottom-grid">
        <AnalyticsPanel />
        <TerminalPanel />
      </div>
    </>
  );
}
