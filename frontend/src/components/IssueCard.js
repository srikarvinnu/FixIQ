import React, { useContext } from 'react';
import { AuthContext, API } from '../App';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function IssueCard({ issue, onUpdate }) {
  const { user } = useContext(AuthContext);
  const isAdminOrFixer = user && (user.role === 'admin' || user.role === 'fixer');

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', label: 'Pending' },
      in_progress: { class: 'badge-in-progress', label: 'In Progress' },
      resolved: { class: 'badge-resolved', label: 'Resolved' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={badge.class}>{badge.label}</span>;
  };

  const getUrgencyClass = (urgency) => {
    const classes = {
      low: 'urgency-low',
      medium: 'urgency-medium',
      high: 'urgency-high',
      critical: 'urgency-critical'
    };
    return classes[urgency] || classes.medium;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(`${API}/issues/${issue.id}`, { status: newStatus });
      toast.success('Issue status updated');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all" data-testid={`issue-card-${issue.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {getStatusBadge(issue.status)}
              <Badge variant="outline" className="capitalize">
                {issue.category}
              </Badge>
              <span className={`flex items-center gap-1 font-semibold ${getUrgencyClass(issue.urgency)}`}>
                <AlertCircle className="w-4 h-4" />
                {issue.urgency}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="issue-title">
              {issue.title}
            </h3>
            <p className="text-gray-600 mb-4" data-testid="issue-description">
              {issue.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {issue.createdByName || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {issue.location?.coordinates[1].toFixed(4)}, {issue.location?.coordinates[0].toFixed(4)}
              </span>
            </div>
          </div>

          {isAdminOrFixer && issue.status !== 'resolved' && (
            <div className="flex flex-col gap-2">
              {issue.status === 'pending' && (
                <Button
                  data-testid="start-progress-btn"
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="btn-secondary text-white"
                >
                  Start Progress
                </Button>
              )}
              {issue.status === 'in_progress' && (
                <Button
                  data-testid="mark-resolved-btn"
                  onClick={() => handleStatusUpdate('resolved')}
                  className="btn-primary text-white"
                >
                  Mark Resolved
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default IssueCard;