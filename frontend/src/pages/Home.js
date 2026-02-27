import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { MapPin, Zap, Users, Award } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <div className="fade-in-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
              Fix Your Community,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                One Issue at a Time
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              FixIQ is an AI-powered platform that connects citizens with local problem-solvers.
              Report issues, track progress, and earn rewards for making your community better.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                data-testid="report-issue-cta"
                onClick={() => navigate('/report')}
                className="btn-primary text-white px-8 py-6 text-lg"
              >
                Report an Issue
              </Button>
              <Button
                data-testid="view-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="px-8 py-6 text-lg border-2 border-green-600 text-green-600 hover:bg-green-50"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-orange-400 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 text-gray-900">
            How FixIQ Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-8 text-center" data-testid="feature-report">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Report Issues</h3>
              <p className="text-gray-600">
                Snap a photo, describe the problem, and our AI categorizes it automatically.
              </p>
            </div>

            <div className="card p-8 text-center" data-testid="feature-ai">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Routing</h3>
              <p className="text-gray-600">
                GPT-5 powered system routes issues to the right department instantly.
              </p>
            </div>

            <div className="card p-8 text-center" data-testid="feature-track">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Real-time updates on your reports and community issues.
              </p>
            </div>

            <div className="card p-8 text-center" data-testid="feature-rewards">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Earn Rewards</h3>
              <p className="text-gray-600">
                Gain FixPoints and climb the leaderboard for every valid report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of citizens making their communities better, one report at a time.
          </p>
          <Button
            data-testid="get-started-btn"
            onClick={() => navigate('/signup')}
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg font-semibold mb-2">FixIQ</p>
          <p className="text-gray-400">© 2025 FixIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;