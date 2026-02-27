import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import IssueCard from '../components/IssueCard';
import MapView from '../components/MapView';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { List, Map, Filter } from 'lucide-react';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, statusFilter, categoryFilter]);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${API}/issues`);
      setIssues(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch issues');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }
    
    setFilteredIssues(filtered);
  };

  const categories = [...new Set(issues.map(i => i.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" data-testid="dashboard-title">
            Issues Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track and manage community issues. Total: {issues.length}
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8" data-testid="dashboard-filters">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
              <div className="space-y-2 w-full sm:w-48">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full sm:w-48">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                data-testid="view-list-btn"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'btn-primary text-white' : ''}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                data-testid="view-map-btn"
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'btn-primary text-white' : ''}
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid gap-6" data-testid="issues-list">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No issues found</p>
              </div>
            ) : (
              filteredIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} onUpdate={fetchIssues} />
              ))
            )}
          </div>
        ) : (
          <div data-testid="issues-map">
            <MapView issues={filteredIssues} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;