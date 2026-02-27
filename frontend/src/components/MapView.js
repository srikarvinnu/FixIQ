import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from './ui/card';
import { toast } from 'sonner';

// For MVP, using a placeholder - user will provide their Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZml4aXEiLCJhIjoiY2x0ZXN0In0.placeholder';

function MapView({ issues }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('placeholder')) {
      // Show fallback message
      return;
    }

    if (map.current) return; // Initialize map only once

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 12
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.addControl(new mapboxgl.NavigationControl());
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !issues.length) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add markers for each issue
    issues.forEach(issue => {
      if (issue.location?.coordinates) {
        const [lng, lat] = issue.location.coordinates;

        // Create marker color based on status
        const colors = {
          pending: '#FFC107',
          in_progress: '#2196F3',
          resolved: '#4CAF50'
        };

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = colors[issue.status] || colors.pending;
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${issue.title}</h3>
              <p style="font-size: 0.875rem; color: #666; margin-bottom: 4px;">${issue.description.substring(0, 100)}...</p>
              <p style="font-size: 0.75rem; color: #999;">
                <strong>Category:</strong> ${issue.category}<br/>
                <strong>Status:</strong> ${issue.status}
              </p>
            </div>
          `
        );

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
      }
    });

    // Fit bounds to show all markers
    if (issues.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      issues.forEach(issue => {
        if (issue.location?.coordinates) {
          bounds.extend(issue.location.coordinates);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [issues, mapLoaded]);

  // Fallback UI when Mapbox token is not configured
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('placeholder')) {
    return (
      <Card className="p-12 text-center" data-testid="map-placeholder">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Map View (Requires Mapbox API)</h3>
          <p className="text-gray-600 mb-4">
            To enable the interactive map view, please provide your Mapbox API token.
          </p>
          <p className="text-sm text-gray-500">
            Issues: {issues.length} | You can view them in list mode for now.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card data-testid="map-view">
      <div ref={mapContainer} style={{ width: '100%', height: '600px', borderRadius: '12px' }} />
    </Card>
  );
}

export default MapView;