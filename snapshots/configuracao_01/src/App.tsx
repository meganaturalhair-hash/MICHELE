/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Navbar } from './components/Navbar';
import { SearchTab } from './components/SearchTab';
import { BatchExportTab } from './components/BatchExportTab';
import { ApiAutomationTab } from './components/ApiAutomationTab';
import { SkillsGuideTab } from './components/SkillsGuideTab';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { PlaceResult } from './types';

const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAJikRF_u6xcscfE5wuk8NFvFTTJicScOw';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'batch' | 'api' | 'skills'>('search');
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const handleSelectPlace = async (place: PlaceResult) => {
    // If qrCodeDataUrl is not present yet, fetch complete details
    if (!place.qrCodeDataUrl) {
      try {
        const res = await fetch(`/api/places/${place.id}`);
        if (res.ok) {
          const fullPlace = await res.json();
          setSelectedPlace(fullPlace);
          return;
        }
      } catch (e) {
        console.error('Error fetching full place details:', e);
      }
    }
    setSelectedPlace(place);
  };

  return (
    <APIProvider apiKey={MAPS_API_KEY}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'search' && (
            <SearchTab onSelectPlace={handleSelectPlace} />
          )}

          {activeTab === 'batch' && (
            <BatchExportTab />
          )}

          {activeTab === 'api' && (
            <ApiAutomationTab />
          )}

          {activeTab === 'skills' && (
            <SkillsGuideTab />
          )}
        </main>

        {/* Detailed Modal for Selected Place */}
        {selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              Google Maps Platform &bull; Places API (New) &bull; Link Oficial Direct Review
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('skills')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Skills & Documentação
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Documentação da API
              </button>
            </div>
          </div>
        </footer>
      </div>
    </APIProvider>
  );
}
