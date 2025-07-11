import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuickExit = ({ onSuccess }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [exitDetails, setExitDetails] = useState(null);

  const handleQuickExit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setExitDetails(null);

    try {
      // Buscar veículo pela placa
      const vehicleResponse = await axios.get(`${API}/vehicles/plate/${licensePlate}`);
      const vehicle = vehicleResponse.data;

      // Buscar sessão ativa do veículo
      const sessionsResponse = await axios.get(`${API}/sessions/active`);
      const activeSession = sessionsResponse.data.find(session => session.vehicle_id === vehicle.id);

      if (!activeSession) {
        setMessage('⚠️ Nenhuma sessão ativa encontrada para este veículo.');
        return;
      }

      // Registrar saída
      const exitResponse = await axios.put(`${API}/sessions/${activeSession.id}/exit`);
      
      setExitDetails(exitResponse.data);
      setMessage('✅ Saída registrada com sucesso!');
      setLicensePlate('');
      if (onSuccess) onSuccess();
      
      // Clear message after 10 seconds (longer for exit details)
      setTimeout(() => {
        setMessage('');
        setExitDetails(null);
      }, 10000);
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage('❌ Veículo não encontrado.');
      } else {
        setMessage('❌ Erro: ' + (error.response?.data?.detail || 'Erro desconhecido'));
      }
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border-l-4 border-red-500">
      <div className="flex items-center mb-4">
        <div className="bg-red-100 p-2 rounded-full mr-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Saída Rápida</h3>
      </div>
      
      <form onSubmit={handleQuickExit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa do Veículo
          </label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
            placeholder="ABC1234"
            maxLength={8}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-base font-medium"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Registrar Saída
            </>
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-200' : 
          message.includes('⚠️') ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
          'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {exitDetails && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detalhes da Saída
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-sm text-gray-600">⏱️ Tempo Total:</span>
              <span className="font-bold text-gray-800">{exitDetails.total_hours} hora(s)</span>
            </div>
            <div className="flex justify-between items-center bg-white rounded-lg p-3">
              <span className="text-sm text-gray-600">💰 Valor Total:</span>
              <span className="font-bold text-green-600 text-lg">R$ {exitDetails.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickExit;