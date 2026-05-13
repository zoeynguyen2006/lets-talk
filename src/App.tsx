import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SetupScreen    from './pages/SetupScreen';
import SelectScreen   from './pages/SelectScreen';
import RecordScreen   from './pages/RecordScreen';
import EvaluateScreen from './pages/EvaluateScreen';
import FeedbackScreen from './pages/FeedbackScreen';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<SetupScreen />} />
          <Route path="/select"   element={<SelectScreen />} />
          <Route path="/record"   element={<RecordScreen />} />
          <Route path="/evaluate" element={<EvaluateScreen />} />
          <Route path="/feedback" element={<FeedbackScreen />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
