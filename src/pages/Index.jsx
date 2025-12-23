import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import { toast } from 'sonner';
import { Brain, ShieldCheck, Zap } from 'lucide-react';

const Index = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssess = async (inputData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (inputData.text) formData.append('text', inputData.text);
      if (inputData.image) formData.append('image', inputData.image);
      if (inputData.audio) formData.append('audio', inputData.audio);

      const response = await fetch('http://127.0.0.1:8000/assess', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Assessment failed');
      }

      const data = await response.json();
      setResults(data);
      toast.success("AI Safety Analysis completed!");

    } catch (err) {
      console.error(err);
      toast.error("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10 py-6 px-4">
        {!results ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
                <Brain className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SafetyAI Guardian
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Empowering safer workplaces with instant, AI-driven risk intelligence. Upload photos, record voice notes, or describe activities to get a professional HIRA in seconds.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  ISO Compliant
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Zap className="h-5 w-5 text-warning" />
                  Real-time Analysis
                </div>
              </div>
            </div>

            <div className="bg-card border shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-card/50">
              <div className="p-8 md:p-12">
                <InputPanel onAssess={handleAssess} isLoading={isLoading} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between border-b pb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-success" />
                Analysis Results
              </h2>
              <p className="text-sm text-muted-foreground">Reference ID: #SA-{Math.floor(Math.random() * 900000 + 100000)}</p>
            </div>

            <ResultsPanel results={results} onReset={handleReset} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
