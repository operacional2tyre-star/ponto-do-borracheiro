import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, ShieldAlert } from 'lucide-react';
import { logAudit } from '../utils/rateLimit';

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return;

      if (!user) {
        setAuthorized(false);
        setChecking(false);
        logAudit('UNAUTHORIZED_ACCESS_ATTEMPT', { path: window.location.pathname });
        return;
      }

      try {
        // Verificar se é admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().active !== false) {
          setAuthorized(true);
          logAudit('ADMIN_ACCESS', { userId: user.uid, path: window.location.pathname });
          setChecking(false);
          return;
        }

        // Verificar se é membro da equipe
        const teamDoc = await getDoc(doc(db, 'team', user.uid));
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          if (teamData.active !== false && (teamData.role === 'admin' || teamData.role === 'seller')) {
            setAuthorized(true);
            logAudit('TEAM_ACCESS', { userId: user.uid, role: teamData.role, path: window.location.pathname });
            setChecking(false);
            return;
          }
        }

        setAuthorized(false);
        logAudit('ACCESS_DENIED', { userId: user.uid, path: window.location.pathname });
      } catch (err) {
        console.error('Erro ao verificar acesso:', err);
        setAuthorized(false);
        logAudit('ACCESS_ERROR', { userId: user.uid, error: err.message });
      }

      setChecking(false);
    }

    checkAccess();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={32} className="text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso negado</h2>
          <p className="text-sm text-gray-500 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return children;
}