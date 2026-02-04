import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import VideoPlayer from '../pages/VideoPlayer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video-player" element={<VideoPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;
