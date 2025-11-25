import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      const [ticketRes, historyRes] = await Promise.all([
        axios.get(`/api/tickets/${id}`),
        axios.get(`/api/tickets/${id}/history`)
      ]);
      setTicket(ticketRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Erro ao carregar ticket:', error);
      alert('Erro ao carregar detalhes do ticket');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`/api/tickets/${id}`, { status: newStatus });
      await fetchTicketData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do ticket');
    } finally {
      setUpdating(false);
    }
  };

  const urgencyLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
  const areaLabels = { collar: 'Coleira', antenna: 'Antena', internet: 'Internet', power: 'Energia' };
  const statusLabels = { open: 'Aberto', progress: 'Em Progresso', closed: 'Fechado' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-semibold">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <div className="card p-12 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">Ticket não encontrado</h2>
          <p className="text-slate-600 mb-6">O ticket que você procura não existe ou foi removido.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <h1 className="text-4xl font-bold text-slate-900 mb-8 font-display">
          Ticket #{ticket.id}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className={`badge-${ticket.urgency}`}>
                  Urgência: {urgencyLabels[ticket.urgency]}
                </span>
                <span className={`badge-${ticket.area}`}>
                  Área: {areaLabels[ticket.area]}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                  ticket.status === 'progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {statusLabels[ticket.status]}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Descrição</h3>
                  <p className="text-slate-900 text-lg">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-1">Fazenda</h3>
                    <p className="text-slate-900">{ticket.farm_code}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-1">Data de Criação</h3>
                    <p className="text-slate-900">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                    Classificação Automática via Machine Learning
                  </h3>
                  <p className="text-slate-700">
                    Este ticket foi automaticamente classificado usando o algoritmo Naive Bayes 
                    treinado com 150 exemplos históricos de problemas similares.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-slate-900 mb-6 font-display">Histórico</h3>
              
              {history.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhuma alteração registrada</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 'bg-slate-300'
                        }`}></div>
                        {index < history.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className={`font-semibold ${
                          index === 0 ? 'text-blue-600' : 'text-slate-700'
                        }`}>
                          {entry.note}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(entry.changed_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">Ações</h3>
              
              {ticket.status === 'open' && (
                <button
                  onClick={() => updateStatus('progress')}
                  disabled={updating}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  {updating ? 'Atualizando...' : 'Iniciar Atendimento'}
                </button>
              )}

              {ticket.status === 'progress' && (
                <button
                  onClick={() => updateStatus('closed')}
                  disabled={updating}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {updating ? 'Atualizando...' : 'Finalizar Ticket'}
                </button>
              )}

              {ticket.status === 'closed' && (
                <button
                  onClick={() => updateStatus('open')}
                  disabled={updating}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  {updating ? 'Atualizando...' : 'Reabrir Ticket'}
                </button>
              )}
            </div>

            <div className="card bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">
                Informações do Sistema
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Modelo ML</p>
                  <p className="font-semibold text-slate-900">Naive Bayes</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Acurácia</p>
                  <p className="font-semibold text-slate-900">97.30%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Dados de Treino</p>
                  <p className="font-semibold text-slate-900">150 exemplos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}