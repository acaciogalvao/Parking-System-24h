import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuickEntry = ({ onSuccess }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedSpot, setSelectedSpot] = useState('');
  const [availableSpots, setAvailableSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAvailableSpots();
  }, []);

  const fetchAvailableSpots = async () => {
    try {
      const response = await axios.get(`${API}/spots/available`);
      setAvailableSpots(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  const handleQuickEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Primeiro, buscar ou criar o veículo
      let vehicle;
      try {
        const vehicleResponse = await axios.get(`${API}/vehicles/plate/${licensePlate}`);
        vehicle = vehicleResponse.data;
      } catch (error) {
        if (error.response?.status === 404) {
          // Veículo não encontrado, criar um novo
          const newVehicle = {
            license_plate: licensePlate,
            model: 'Não informado',
            color: 'Não informado',
            vehicle_type: 'car',
            owner_name: 'Não informado',
            owner_phone: 'Não informado'
          };
          const createResponse = await axios.post(`${API}/vehicles`, newVehicle);
          vehicle = createResponse.data;
        } else {
          throw error;
        }
      }

      // Criar sessão de estacionamento
      await axios.post(`${API}/sessions`, {
        vehicle_id: vehicle.id,
        spot_id: selectedSpot
      });

      setMessage('✅ Entrada registrada com sucesso!');
      setLicensePlate('');
      setSelectedSpot('');
      fetchAvailableSpots();
      if (onSuccess) onSuccess();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erro: ' + (error.response?.data?.detail || 'Erro desconhecido'));
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border-l-4 border-green-500">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-full mr-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Entrada Rápida</h3>
      </div>
      
      <form onSubmit={handleQuickEntry} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa do Veículo
          </label>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            placeholder="ABC1234"
            maxLength={8}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vaga Disponível ({availableSpots.length} vagas)
          </label>
          <select
            value={selectedSpot}
            onChange={(e) => setSelectedSpot(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            required
          >
            <option value="">Selecione uma vaga</option>
            {availableSpots.map(spot => (
              <option key={spot.id} value={spot.id}>
                {spot.number} - {spot.spot_type} - R$ {spot.hourly_rate}/h
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || availableSpots.length === 0}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-base font-medium"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Registrar Entrada
            </>
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {availableSpots.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Nenhuma vaga disponível no momento</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickEntry;