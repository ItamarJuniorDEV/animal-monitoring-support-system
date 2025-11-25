import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState({ urgency: '', area: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const [newTicket, setNewTicket] = useState({
    description: '',
    farm_code: ''
  });
  const [createdTicket, setCreatedTicket] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, farmsRes] = await Promise.all([
        axios.get('/api/tickets'),
        axios.get('/api/farms')
      ]);
      setTickets(ticketsRes.data);
      setFarms(farmsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (newTicket.description.length < 10) {
      alert('A descrição deve ter pelo menos 10 caracteres');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post('/api/tickets', newTicket);
      setCreatedTicket(response.data);
      
      setTimeout(() => {
        setShowCreateModal(false);
        setCreatedTicket(null);
        setNewTicket({ description: '', farm_code: '' });
        fetchData();
        setCurrentPage(1);
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      alert('Erro ao criar ticket');
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCreatedTicket(null);
    setNewTicket({ description: '', farm_code: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter.urgency && ticket.urgency !== filter.urgency) return false;
    if (filter.area && ticket.area !== filter.area) return false;
    if (filter.status && ticket.status !== filter.status) return false;
    return true;
  }).sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ticketsPerPage);

  const stats = {
    total: tickets.length,
    high: tickets.filter(t => t.urgency === 'high').length,
    medium: tickets.filter(t => t.urgency === 'medium').length,
    low: tickets.filter(t => t.urgency === 'low').length,
    open: tickets.filter(t => t.status === 'open').length,
    progress: tickets.filter(t => t.status === 'progress').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  const urgencyLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
  const areaLabels = { collar: 'Coleira', antenna: 'Antena', internet: 'Internet', power: 'Energia' };
  const statusLabels = { open: 'Aberto', progress: 'Em Progresso', closed: 'Fechado' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 overflow-hidden">
      <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-2xl flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold font-display">AgroTech</h1>
              <p className="text-xs text-slate-400">Monitoramento</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl font-semibold shadow-lg">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Dashboard de Monitoramento
          </h1>
          <p className="text-slate-600 mt-1">
            Gestão completa de tickets com classificação inteligente
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 card p-8 bg-gradient-to-br from-white to-cyan-50 border-2 border-cyan-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-slate-600 font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    Total de Tickets
                  </p>
                  <h2 className="text-6xl font-bold text-slate-900 font-display">{stats.total}</h2>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-green-700 text-sm font-semibold mb-1">Abertos</p>
                  <p className="text-2xl font-bold text-green-900">{stats.open}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                  <p className="text-yellow-700 text-sm font-semibold mb-1">Em Progresso</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.progress}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <p className="text-slate-700 text-sm font-semibold mb-1">Fechados</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.closed}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 p-5">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                  <span className="text-3xl font-bold text-red-900 font-display">{stats.high}</span>
                </div>
                <p className="text-red-700 font-bold text-sm">Alta Urgência</p>
                <p className="text-red-600 text-xs">Requer atenção imediata</p>
              </div>

              <div className="card bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-300 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-7 h-7 text-orange-600" />
                  <span className="text-3xl font-bold text-orange-900 font-display">{stats.medium}</span>
                </div>
                <p className="text-orange-700 font-bold text-sm">Média Urgência</p>
                <p className="text-orange-600 text-xs">Atenção moderada</p>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 p-5">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                  <span className="text-3xl font-bold text-green-900 font-display">{stats.low}</span>
                </div>
                <p className="text-green-700 font-bold text-sm">Baixa Urgência</p>
                <p className="text-green-600 text-xs">Pode ser resolvido posteriormente</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex flex-wrap gap-3">
              <select 
                className="input py-2 text-sm"
                value={filter.urgency}
                onChange={(e) => {
                  setFilter({...filter, urgency: e.target.value});
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas Urgências</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              <select 
                className="input py-2 text-sm"
                value={filter.area}
                onChange={(e) => {
                  setFilter({...filter, area: e.target.value});
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas Áreas</option>
                <option value="collar">Coleira</option>
                <option value="antenna">Antena</option>
                <option value="internet">Internet</option>
                <option value="power">Energia</option>
              </select>

              <select 
                className="input py-2 text-sm"
                value={filter.status}
                onChange={(e) => {
                  setFilter({...filter, status: e.target.value});
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos Status</option>
                <option value="open">Aberto</option>
                <option value="progress">Em Progresso</option>
                <option value="closed">Fechado</option>
              </select>

              {(filter.urgency || filter.area || filter.status) && (
                <button 
                  onClick={() => {
                    setFilter({ urgency: '', area: '', status: '' });
                    setCurrentPage(1);
                  }}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Novo Ticket
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {paginatedTickets.length === 0 ? (
              <div className="card p-12 text-center">
                <img 
                  src="/images/empty-state.jpg" 
                  alt="Nenhum ticket" 
                  className="empty-state-image w-64 mx-auto mb-6"
                />
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-display">Nenhum ticket encontrado</h3>
                <p className="text-slate-600">Crie um novo ticket para começar</p>
              </div>
            ) : (
              paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                  className="card p-6 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-slate-500">#{ticket.id}</span>
                        <span className={`badge-${ticket.urgency}`}>
                          {urgencyLabels[ticket.urgency]}
                        </span>
                        <span className={`badge-${ticket.area}`}>
                          {areaLabels[ticket.area]}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </div>
                      <p className="text-slate-900 font-semibold mb-2">{ticket.description}</p>
                      <p className="text-sm text-slate-600">
                        Fazenda: {ticket.farm_code} • {new Date(ticket.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredTickets.length > ticketsPerPage && (
            <div className="flex items-center justify-between card p-4">
              <p className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ticketsPerPage, filteredTickets.length)} de {filteredTickets.length} tickets
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-slide-in-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!createdTicket ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold font-display">Novo Ticket</h2>
                  <button 
                    onClick={closeModal} 
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    type="button"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Descrição do Problema
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      className="input min-h-[120px]"
                      placeholder="Descreva o problema em detalhes..."
                      required
                      disabled={creating}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      O sistema usará ML para classificar automaticamente a urgência e área
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fazenda
                    </label>
                    <input
                      list="farms-list"
                      value={newTicket.farm_code}
                      onChange={(e) => setNewTicket({...newTicket, farm_code: e.target.value})}
                      className="input"
                      placeholder="Digite ou selecione a fazenda"
                      required
                      disabled={creating}
                    />
                    <datalist id="farms-list">
                      {farms.map(farm => (
                        <option key={farm.code} value={farm.code}>{farm.name}</option>
                      ))}
                    </datalist>
                    {farms.length === 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        Nenhuma fazenda cadastrada no sistema
                      </p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full"
                    disabled={creating}
                  >
                    {creating ? 'Criando...' : 'Criar Ticket'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display">Ticket Criado!</h3>
                <p className="text-slate-600 mb-6">Classificação automática via ML:</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className={`badge-${createdTicket.urgency} text-lg px-6 py-3`}>
                    Urgência: {urgencyLabels[createdTicket.urgency]}
                  </span>
                  <span className={`badge-${createdTicket.area} text-lg px-6 py-3`}>
                    Área: {areaLabels[createdTicket.area]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}