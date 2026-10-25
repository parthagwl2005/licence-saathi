import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store.jsx';
import Shell from './components/Shell.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Eligibility from './screens/Eligibility.jsx';
import Documents from './screens/Documents.jsx';
import Apply from './screens/Apply.jsx';
import Learn from './screens/Learn.jsx';
import Mock from './screens/Mock.jsx';
import TestDay from './screens/TestDay.jsx';
import Permanent from './screens/Permanent.jsx';
import DrivingTest from './screens/DrivingTest.jsx';
import Track from './screens/Track.jsx';
import Chat from './screens/Chat.jsx';
import Settings from './screens/Settings.jsx';
import Profile from './screens/Profile.jsx';
import Service, { ServiceApply, ServiceDone } from './screens/Service.jsx';
import { stopSpeaking } from './utils.js';
import Lost from './screens/Lost.jsx';
import RtoCheck from './screens/RtoCheck.jsx';
import HelpCenter from './screens/HelpCenter.jsx';
import { QueueRunner } from './queue.js';
import { Toaster } from './components/Help.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LockHost } from './components/Lock.jsx';
import RoadGame from './screens/RoadGame.jsx';
import Fix from './screens/Fix.jsx';

function StopSpeechOnNavigate() {
  const loc = useLocation();
  useEffect(() => stopSpeaking(), [loc.pathname]);
  return null;
}

export default function App() {
  const { state } = useStore();
  if (!state.settings.lang) return <Onboarding />;

  return (
    <HashRouter>
      <LockHost />
      <StopSpeechOnNavigate />
      <QueueRunner />
      <Toaster />
      <Shell>
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/mock" element={<Mock />} />
          <Route path="/test-day" element={<TestDay />} />
          <Route path="/permanent" element={<Permanent />} />
          <Route path="/driving-test" element={<DrivingTest />} />
          <Route path="/track" element={<Track />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/rto-check" element={<RtoCheck />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/road-game" element={<RoadGame />} />
          <Route path="/fix" element={<Fix />} />
          <Route path="/service/:id" element={<Service />} />
          <Route path="/service/:id/apply" element={<ServiceApply />} />
          <Route path="/service/:id/done" element={<ServiceDone />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </Shell>
    </HashRouter>
  );
}
