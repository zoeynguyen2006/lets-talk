import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SetupScreen    from './pages/SetupScreen';
import CueScreen      from './pages/CueScreen';
import SelectScreen   from './pages/SelectScreen';
import TimelineScreen from './pages/TimelineScreen';
import RecordScreen   from './pages/RecordScreen';
import EvaluateScreen from './pages/EvaluateScreen';
import FeedbackScreen from './pages/FeedbackScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<SetupScreen />} />
        <Route path="/cues"      element={<CueScreen />} />
        <Route path="/select"    element={<SelectScreen />} />
        <Route path="/timeline"  element={<TimelineScreen />} />
        <Route path="/record"    element={<RecordScreen />} />
        <Route path="/evaluate"  element={<EvaluateScreen />} />
        <Route path="/feedback"  element={<FeedbackScreen />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
