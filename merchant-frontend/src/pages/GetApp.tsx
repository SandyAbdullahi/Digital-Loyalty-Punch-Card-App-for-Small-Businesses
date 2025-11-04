import { Button } from '@mantine/core';
import { PlayStore, Apple } from 'lucide-react';
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              leftSection={<PlayStore size={20} />}
              size="lg"
              variant="filled"
              color="primary"
              component="a"
              href="#"
            >
              Download on Google Play
            </Button>
            <Button
              leftSection={<Apple size={20} />}
              size="lg"
              variant="filled"
              color="secondary"
              component="a"
              href="#"
            >
              Download on App Store
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetApp;