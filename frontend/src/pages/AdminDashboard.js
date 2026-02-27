import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/Navbar';
import IssueCard from '../components/IssueCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Shield, FileText, Users } from 'lucide-react';

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, usersRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/issues`),
        axios.get(`${API}/leaderboard`),
        axios.get(`${API}/analytics`)
      ]);
      
      setIssues(issuesRes.data);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch admin data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="w-10 h-10 text-green-600" />
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900" data-testid="admin-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">Manage issues, users, and system analytics</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8" data-testid="admin-stats">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{analytics?.totalIssues || 0}</p>
              <p className="text-sm text-blue-700">Total Issues</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900">{analytics?.totalUsers || 0}</p>
              <p className="text-sm text-green-700">Active Users</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-900">{analytics?.statusBreakdown?.resolved || 0}</p>
              <p className="text-sm text-purple-700">Resolved Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="issues" data-testid="issues-tab">Issues Management</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" data-testid="issues-tab-content">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">All Issues</h2>
              {issues.map(issue => (
                <IssueCard key={issue.id} issue={issue} onUpdate={fetchData} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" data-testid="users-tab-content">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
              <div className="grid gap-4">
                {users.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 capitalize mb-1">
                            <span className="font-semibold">Role:</span> {user.role}
                          </p>
                          <p className="text-green-600 font-semibold">{user.fixPoints} FixPoints</p>
                          <p className="text-xs text-gray-500">Reputation: {user.reputation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;