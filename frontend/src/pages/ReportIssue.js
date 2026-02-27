import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { MapPin, Upload, Loader2 } from 'lucide-react';

function ReportIssue() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          toast.success('Location detected!');
          setLocationLoading(false);
        },
        (error) => {
          toast.error('Could not get location. Please enter manually.');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setLocationLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide location coordinates');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('latitude', parseFloat(formData.latitude));
      data.append('longitude', parseFloat(formData.longitude));
      
      files.forEach((file) => {
        data.append('files', file);
      });

      await axios.post(`${API}/issues`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Issue reported successfully! +10 FixPoints');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" data-testid="report-page-title">
              Report an Issue
            </h1>
            <p className="text-lg text-gray-600">
              Help improve your community by reporting local problems. Our AI will categorize and route it automatically.
            </p>
          </div>

          <Card data-testid="report-issue-form-card">
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    data-testid="issue-title-input"
                    placeholder="Broken streetlight on Main Street"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="issue-description-input"
                    placeholder="Provide detailed information about the issue..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Location</Label>
                  <Button
                    data-testid="get-location-btn"
                    type="button"
                    onClick={getCurrentLocation}
                    variant="outline"
                    className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50"
                    disabled={locationLoading}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {locationLoading ? 'Detecting Location...' : 'Use Current Location'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        data-testid="issue-latitude-input"
                        type="number"
                        step="any"
                        placeholder="40.7128"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        data-testid="issue-longitude-input"
                        type="number"
                        step="any"
                        placeholder="-74.0060"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files">Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <Input
                      id="files"
                      data-testid="issue-files-input"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <span className="text-green-600 font-semibold">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    {files.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">{files.length} file(s) selected</p>
                    )}
                  </div>
                </div>

                <Button
                  data-testid="submit-issue-btn"
                  type="submit"
                  className="w-full btn-primary text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;