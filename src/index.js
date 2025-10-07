import { createRoot } from 'react-dom/client';
import DraftApp from './DraftApp';
import FantasyApp from './FantasyApp';
import './assets/index.css';
  
const container = document.getElementById('root');
const root = createRoot(container);

const setup = process.env.REACT_APP_SETUP;
if (setup === 'draft') {
    root.render(<DraftApp />);
} else {
    root.render(<FantasyApp />);
}