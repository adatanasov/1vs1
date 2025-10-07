import { createRoot } from 'react-dom/client';
import FantasyApp from './FantasyApp';
import './assets/index.css';
  
const container = document.getElementById('root');
const root = createRoot(container);

root.render(<FantasyApp />);