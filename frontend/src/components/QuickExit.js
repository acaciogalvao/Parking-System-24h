import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuickExit = () => {
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
        setMessage('Nenhuma sessão ativa encontrada para este veículo.');
        return;
      }

      // Registrar saída
      const exitResponse = await axios.put(`${API}/sessions/${activeSession.id}/exit`);
      
      setExitDetails(exitResponse.data);
      setMessage('Saída registrada com sucesso!');
      setLicensePlate('');
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage('Veículo não encontrado.');
      } else {
        setMessage('Erro: ' + (error.response?.data?.detail || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Saída Rápida</h3>
      <form onSubmit={handleQuickExit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa do Veículo
          </label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ABC1234"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : 'Registrar Saída'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('Erro') || message.includes('Nenhuma') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {exitDetails && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">Detalhes da Saída:</h4>
          <p className="text-sm text-blue-800">
            <strong>Tempo Total:</strong> {exitDetails.total_hours} hora(s)
          </p>
          <p className="text-sm text-blue-800">
            <strong>Valor Total:</strong> R$ {exitDetails.total_amount.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickExit;