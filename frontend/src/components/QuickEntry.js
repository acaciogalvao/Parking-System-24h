import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuickEntry = () => {
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

      setMessage('Entrada registrada com sucesso!');
      setLicensePlate('');
      setSelectedSpot('');
      fetchAvailableSpots();
    } catch (error) {
      setMessage('Erro: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Entrada Rápida</h3>
      <form onSubmit={handleQuickEntry} className="space-y-4">
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vaga Disponível
          </label>
          <select
            value={selectedSpot}
            onChange={(e) => setSelectedSpot(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : 'Registrar Entrada'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default QuickEntry;