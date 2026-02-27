import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import { Trophy, Award, Medal, Crown } from 'lucide-react';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch(index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <Award className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (index) => {
    switch(index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" data-testid="leaderboard-title">
            Top Contributors
          </h1>
          <p className="text-lg text-gray-600">
            Celebrating our community heroes who make a difference
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-12" data-testid="top-three-podium">
              {/* 2nd Place */}
              <div className="flex flex-col items-center mt-8">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-gray-400">
                    <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-400 text-white text-2xl font-bold">
                      {users[1]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <h3 className="font-bold mt-3 text-center">{users[1]?.name}</h3>
                <p className="text-green-600 font-semibold">{users[1]?.fixPoints} pts</p>
                <div className="bg-gray-300 h-24 w-full mt-4 rounded-t-lg"></div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-yellow-500">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-3xl font-bold">
                      {users[0]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <Crown className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="font-bold mt-3 text-center text-lg">{users[0]?.name}</h3>
                <p className="text-green-600 font-semibold text-lg">{users[0]?.fixPoints} pts</p>
                <div className="bg-yellow-400 h-32 w-full mt-4 rounded-t-lg"></div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center mt-12">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-orange-600">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-2xl font-bold">
                      {users[2]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <h3 className="font-bold mt-3 text-center">{users[2]?.name}</h3>
                <p className="text-green-600 font-semibold">{users[2]?.fixPoints} pts</p>
                <div className="bg-orange-400 h-20 w-full mt-4 rounded-t-lg"></div>
              </div>
            </div>
          )}

          {/* Rest of the leaderboard */}
          <div className="space-y-4" data-testid="leaderboard-list">
            {users.map((user, index) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${getRankColor(index)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        #{index + 1}
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-bold text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {getRankIcon(index)}
                        <span className="text-2xl font-bold text-green-600">
                          {user.fixPoints}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">FixPoints</p>
                      <p className="text-xs text-gray-400 mt-1">Reputation: {user.reputation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;