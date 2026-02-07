// src/modules/pos/components/PrinterSettings.tsx
import { useState } from 'react';
import { ESCPOSService } from '../../../lib/escpos-service';

interface PrinterSettingsProps {
  onClose?: () => void;
}

export default function PrinterSettings({ onClose }: PrinterSettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<{
    drawerTest: boolean | null;
  }>({
    drawerTest: null
  });

  const openSettings = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  const testCashDrawer = async () => {
    try {
      const success = await ESCPOSService.openCashDrawer();
      setTestResults({ drawerTest: success });
      
      if (success) {
        // Don't show alert, just update the UI
      } else {
        alert('Cash drawer test failed. Please check your printer connection and settings.');
      }
    } catch (error) {
      setTestResults({ drawerTest: false });
      alert('Error testing cash drawer: ' + (error as Error).message);
    }
  };

  return (
    <>
      <button 
        onClick={openSettings}
        className="bg-gray-600 text-white text-sm px-3 py-2 rounded-md hover:bg-gray-700 transition"
        title="Printer Settings"
      >
        ⚙️
      </button>

      {/* Printer Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Printer Settings</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-3">Test Cash Drawer</h4>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={testCashDrawer}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    >
                      🗃️ Open Drawer
                    </button>
                  </div>
                </div>

                {testResults.drawerTest !== null && (
                  <div className="text-center p-3 rounded-md bg-gray-50">
                    <p className="text-sm">
                      Status: {' '}
                      <span className={testResults.drawerTest ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {testResults.drawerTest ? '✓ Working' : '✗ Failed'}
                      </span>
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Quick Setup</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Connect drawer to printer with RJ12 cable</p>
                    <p>• Use Chrome, Edge, or Opera browser</p>
                    <p>• Allow printer access when prompted</p>
                  </div>
                </div>

                {testResults.drawerTest === false && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                    <p className="text-sm text-red-700 font-medium mb-1">Not Working?</p>
                    <p className="text-xs text-red-600">Check cable connections and try again</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}