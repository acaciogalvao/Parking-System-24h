import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Navigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🚗 Estacionamento AGC-24h</h1>
        <div className="flex space-x-4">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded ${isActive('/') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/vehicles" 
            className={`px-4 py-2 rounded ${isActive('/vehicles') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            Veículos
          </Link>
          <Link 
            to="/spots" 
            className={`px-4 py-2 rounded ${isActive('/spots') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            Vagas
          </Link>
          <Link 
            to="/sessions" 
            className={`px-4 py-2 rounded ${isActive('/sessions') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            Sessões
          </Link>
          <Link 
            to="/transactions" 
            className={`px-4 py-2 rounded ${isActive('/transactions') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            Transações
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total de Vagas</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.total_spots || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Vagas Ocupadas</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.occupied_spots || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Vagas Disponíveis</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.available_spots || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Sessões Ativas</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.active_sessions || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Receita Diária</h3>
          <p className="text-2xl font-bold text-green-600">R$ {stats?.daily_revenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Receita Mensal</h3>
          <p className="text-2xl font-bold text-green-600">R$ {stats?.monthly_revenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
    </div>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: '',
    model: '',
    color: '',
    vehicle_type: 'car',
    owner_name: '',
    owner_phone: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/vehicles`, formData);
      setFormData({
        license_plate: '',
        model: '',
        color: '',
        vehicle_type: 'car',
        owner_name: '',
        owner_phone: ''
      });
      setShowForm(false);
      fetchVehicles();
      alert('Veículo cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao cadastrar veículo: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Veículos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Cadastrar Veículo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cadastrar Veículo</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Placa
                </label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Cor
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo
                </label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="car">Carro</option>
                  <option value="motorcycle">Moto</option>
                  <option value="truck">Caminhão</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nome do Proprietário
                </label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.owner_phone}
                  onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proprietário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vehicle.license_plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.color}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.vehicle_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.owner_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.owner_phone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Spots = () => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await axios.get(`${API}/spots`);
      setSpots(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'occupied':
        return 'Ocupada';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'regular':
        return 'Regular';
      case 'premium':
        return 'Premium';
      case 'disabled':
        return 'PcD';
      default:
        return type;
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Vagas de Estacionamento</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {spots.map((spot) => (
          <div 
            key={spot.id} 
            className={`p-4 rounded-lg border-2 ${
              spot.status === 'available' ? 'border-green-300 bg-green-50' :
              spot.status === 'occupied' ? 'border-red-300 bg-red-50' :
              'border-yellow-300 bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">{spot.number}</h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(spot.status)}`}>
                {getStatusText(spot.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Tipo: {getTypeText(spot.spot_type)}
            </p>
            <p className="text-sm text-gray-600">
              Tarifa: R$ {spot.hourly_rate.toFixed(2)}/hora
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [spots, setSpots] = useState([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryData, setEntryData] = useState({
    license_plate: '',
    spot_id: ''
  });

  useEffect(() => {
    fetchSessions();
    fetchVehicles();
    fetchAvailableSpots();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  const fetchAvailableSpots = async () => {
    try {
      const response = await axios.get(`${API}/spots/available`);
      setSpots(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas disponíveis:', error);
    }
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    try {
      // Find vehicle by license plate
      const vehicle = vehicles.find(v => v.license_plate === entryData.license_plate);
      if (!vehicle) {
        alert('Veículo não encontrado. Cadastre o veículo primeiro.');
        return;
      }

      await axios.post(`${API}/sessions`, {
        vehicle_id: vehicle.id,
        spot_id: entryData.spot_id
      });

      setEntryData({ license_plate: '', spot_id: '' });
      setShowEntryForm(false);
      fetchSessions();
      fetchAvailableSpots();
      alert('Entrada registrada com sucesso!');
    } catch (error) {
      alert('Erro ao registrar entrada: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleExit = async (sessionId) => {
    try {
      const response = await axios.put(`${API}/sessions/${sessionId}/exit`);
      alert(`Saída registrada! Valor: R$ ${response.data.total_amount.toFixed(2)}`);
      fetchSessions();
      fetchAvailableSpots();
    } catch (error) {
      alert('Erro ao registrar saída: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.license_plate} - ${vehicle.model}` : 'Veículo não encontrado';
  };

  const getSpotInfo = (spotId) => {
    const allSpots = [...spots];
    const spot = allSpots.find(s => s.id === spotId);
    return spot ? spot.number : 'Vaga não encontrada';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Sessões de Estacionamento</h2>
        <button
          onClick={() => setShowEntryForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Registrar Entrada
        </button>
      </div>

      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Entrada</h3>
            <form onSubmit={handleEntry}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Placa do Veículo
                </label>
                <input
                  type="text"
                  value={entryData.license_plate}
                  onChange={(e) => setEntryData({...entryData, license_plate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Vaga
                </label>
                <select
                  value={entryData.spot_id}
                  onChange={(e) => setEntryData({...entryData, spot_id: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecione uma vaga</option>
                  {spots.map(spot => (
                    <option key={spot.id} value={spot.id}>
                      {spot.number} - {spot.spot_type} - R$ {spot.hourly_rate}/hora
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEntryForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vaga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saída
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getVehicleInfo(session.vehicle_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getSpotInfo(session.spot_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(session.entry_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.exit_time ? new Date(session.exit_time).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.total_amount ? `R$ ${session.total_amount.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.is_active ? 'Ativa' : 'Finalizada'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.is_active && (
                    <button
                      onClick={() => handleExit(session.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Registrar Saída
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Transações</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID da Sessão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método de Pagamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.session_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.payment_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status === 'completed' ? 'Concluída' : 
                     transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/spots" element={<Spots />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;