import { Button } from '@mantine/core';
import { Smartphone, Apple } from 'lucide-react';
import NavBar from '../components/NavBar';

const GetApp = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-8">Get the Rudi App</h1>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto">
            Download the app to start earning stamps and redeeming rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Button
              size="xl"
              variant="outline"
              color="primary"
              component="a"
              href="#"
              className="w-96 h-64 flex items-center justify-center p-4 hover:bg-[#00C896] hover:border-[#00C896]"
            >
              <img src="/Google_Play_logo.png" alt="Google Play" style={{ width: '384px', height: 'auto' }} />
            </Button>
            <Button
              size="xl"
              variant="outline"
              color="primary"
              component="a"
              href="#"
              className="w-96 h-64 flex items-center justify-center p-4 hover:bg-[#00C896] hover:border-[#00C896]"
            >
              <img src="/App_store_logo.png" alt="App Store" style={{ width: '384px', height: 'auto' }} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetApp;