import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";
import QuickEntry from "./components/QuickEntry";
import QuickExit from "./components/QuickExit";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mobile Navigation Component
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/vehicles", label: "Veículos", icon: "🚗" },
    { path: "/spots", label: "Vagas", icon: "🅿️" },
    { path: "/sessions", label: "Sessões", icon: "⏰" },
    { path: "/transactions", label: "Transações", icon: "💰" }
  ];

  return (
    <nav className="bg-blue-900 text-white sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">🚗 AGC-24h</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden mt-4 pb-4`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-3 py-2 mb-2 rounded-md text-sm font-medium ${
                isActive(item.path) ? 'bg-blue-700' : 'hover:bg-blue-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:justify-center md:space-x-1 md:px-4 md:pb-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive(item.path) ? 'bg-blue-700' : 'hover:bg-blue-800'
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={fetchStats}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{stats?.total_spots || 0}</p>
            <p className="text-sm md:text-base opacity-90">Total Vagas</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{stats?.occupied_spots || 0}</p>
            <p className="text-sm md:text-base opacity-90">Ocupadas</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{stats?.available_spots || 0}</p>
            <p className="text-sm md:text-base opacity-90">Disponíveis</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold">{stats?.active_sessions || 0}</p>
            <p className="text-sm md:text-base opacity-90">Sessões Ativas</p>
          </div>
        </div>
      </div>

      {/* Revenue and Occupancy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Receita Diária</h3>
          <p className="text-2xl font-bold text-green-600">R$ {stats?.daily_revenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Receita Mensal</h3>
          <p className="text-2xl font-bold text-blue-600">R$ {stats?.monthly_revenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Ocupação</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {stats?.total_spots > 0 ? Math.round((stats.occupied_spots / stats.total_spots) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickEntry onSuccess={fetchStats} />
        <QuickExit onSuccess={fetchStats} />
      </div>
    </div>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
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

  const getVehicleTypeText = (type) => {
    switch (type) {
      case 'car': return 'Carro';
      case 'motorcycle': return 'Moto';
      case 'truck': return 'Caminhão';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Veículos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cadastrar Veículo
        </button>
      </div>

      {/* Mobile Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Cadastrar Veículo</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({...formData, license_plate: e.target.value.toUpperCase()})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC1234"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Honda Civic"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Azul"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="car">Carro</option>
                    <option value="motorcycle">Moto</option>
                    <option value="truck">Caminhão</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Proprietário
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="João Silva"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full md:w-auto bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Vehicle Cards */}
      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{vehicle.license_plate}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getVehicleTypeText(vehicle.vehicle_type)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Modelo:</p>
                <p className="font-medium">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-gray-600">Cor:</p>
                <p className="font-medium">{vehicle.color}</p>
              </div>
              <div>
                <p className="text-gray-600">Proprietário:</p>
                <p className="font-medium">{vehicle.owner_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Telefone:</p>
                <p className="font-medium">{vehicle.owner_phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">Nenhum veículo cadastrado</p>
          <p className="text-gray-400 text-sm">Clique em "Cadastrar Veículo" para adicionar o primeiro</p>
        </div>
      )}
    </div>
  );
};

const Spots = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await axios.get(`${API}/spots`);
      setSpots(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'occupied': return 'Ocupada';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'regular': return 'Regular';
      case 'premium': return 'Premium';
      case 'disabled': return 'PcD';
      default: return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'regular': return '🅿️';
      case 'premium': return '⭐';
      case 'disabled': return '♿';
      default: return '🅿️';
    }
  };

  const filteredSpots = spots.filter(spot => {
    if (filter === 'all') return true;
    return spot.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Vagas</h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Disponíveis
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'occupied' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ocupadas
          </button>
        </div>
      </div>

      {/* Mobile-First Spot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {filteredSpots.map((spot) => (
          <div 
            key={spot.id} 
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor(spot.status)}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{getTypeIcon(spot.spot_type)}</div>
              <h3 className="text-lg font-bold mb-1">{spot.number}</h3>
              <p className="text-xs mb-1">{getTypeText(spot.spot_type)}</p>
              <p className="text-xs font-medium mb-2">R$ {spot.hourly_rate.toFixed(2)}/h</p>
              <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                {getStatusText(spot.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-lg">Nenhuma vaga encontrada</p>
          <p className="text-gray-400 text-sm">Ajuste o filtro para ver mais vagas</p>
        </div>
      )}
    </div>
  );
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Sessões</h2>
        <button
          onClick={() => setShowEntryForm(true)}
          className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Entrada
        </button>
      </div>

      {/* Entry Form Modal */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Registrar Entrada</h3>
                <button
                  onClick={() => setShowEntryForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    value={entryData.license_plate}
                    onChange={(e) => setEntryData({...entryData, license_plate: e.target.value.toUpperCase()})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC1234"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vaga
                  </label>
                  <select
                    value={entryData.spot_id}
                    onChange={(e) => setEntryData({...entryData, spot_id: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma vaga</option>
                    {spots.map(spot => (
                      <option key={spot.id} value={spot.id}>
                        {spot.number} - {spot.spot_type} - R$ {spot.hourly_rate}/h
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Registrar Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEntryForm(false)}
                    className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Session Cards */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {getVehicleInfo(session.vehicle_id)}
                </h3>
                <p className="text-sm text-gray-600">Vaga: {getSpotInfo(session.spot_id)}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {session.is_active ? 'Ativa' : 'Finalizada'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-gray-600">Entrada:</p>
                <p className="font-medium">{new Date(session.entry_time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Saída:</p>
                <p className="font-medium">
                  {session.exit_time ? new Date(session.exit_time).toLocaleString() : '-'}
                </p>
              </div>
            </div>
            
            {session.total_amount && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-green-600">R$ {session.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Horas:</span>
                  <span className="text-sm font-medium">{session.total_hours}h</span>
                </div>
              </div>
            )}
            
            {session.is_active && (
              <button
                onClick={() => handleExit(session.id)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Registrar Saída
              </button>
            )}
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Nenhuma sessão registrada</p>
          <p className="text-gray-400 text-sm">Registre a primeira entrada para começar</p>
        </div>
      )}
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Transações</h2>

      {/* Mobile-First Transaction Cards */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  R$ {transaction.amount.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-600">
                  {transaction.payment_method}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Sessão:</p>
                <p className="font-medium font-mono text-xs">{transaction.session_id}</p>
              </div>
              <div>
                <p className="text-gray-600">Data:</p>
                <p className="font-medium">{new Date(transaction.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Nenhuma transação registrada</p>
          <p className="text-gray-400 text-sm">As transações aparecerão aqui após os pagamentos</p>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <MobileNavigation />
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