import { BrowserRouter } from 'react-router-dom';
import { useOnline } from './hooks/useOnline';
import AppRoutes from './app/routes';

function App() {
  const isOnline = useOnline();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-rudi-sand text-rudi-maroon font-body">
        {!isOnline && (
          <div className="bg-rudi-coral text-white text-center py-2 text-sm">
            You are offline. Some features may be limited.
          </div>
        )}
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
