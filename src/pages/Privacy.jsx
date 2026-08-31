import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-3 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-red-600 hover:bg-red-50 rounded-full active:scale-90 transition-all"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Política de Privacidade</h1>
          <p className="text-xs text-gray-500 font-medium">Última atualização: 31 de agosto de 2026</p>
        </div>
      </div>

      {/* Ícone */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
          <Shield size={32} className="text-red-600" />
        </div>
      </div>

      {/* Introdução */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <p className="text-sm text-gray-700 leading-relaxed">
          A <strong>Ponto do Borracheiro</strong> (A.Ayala Ramalho Comércio de Auto Peças, CNPJ: 32.631.547/0001-81) respeita a sua privacidade e está comprometida com a proteção dos seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações.
        </p>
      </div>

      {/* Seção 1 */}
      <Section
        icon={<Database size={18} className="text-red-600" />}
        title="1. Dados que coletamos"
      >
        <p><strong>Dados de cadastro:</strong></p>
        <ul>
          <li>Nome completo</li>
          <li>E-mail</li>
          <li>Telefone</li>
          <li>CPF</li>
          <li>Endereço de entrega</li>
        </ul>
        <p><strong>Dados de autenticação:</strong></p>
        <ul>
          <li>ID do Google (login via Google)</li>
          <li>Foto do perfil (opcional)</li>
        </ul>
        <p><strong>Dados de navegação:</strong></p>
        <ul>
          <li>Produtos visualizados</li>
          <li>Itens adicionados ao carrinho</li>
          <li>Histórico de pedidos</li>
          <li>Preferências de busca</li>
        </ul>
        <p><strong>Dados de pagamento:</strong></p>
        <ul>
          <li>Método de pagamento escolhido (Pix ou Cartão)</li>
          <li>Dados do cartão são processados diretamente pelo SafraPay e não são armazenados em nossos servidores</li>
        </ul>
        <p><strong>Dados de dispositivo:</strong></p>
        <ul>
          <li>Tipo de dispositivo e navegador</li>
          <li>Token de notificação push</li>
          <li>Sistema operacional</li>
        </ul>
      </Section>

      {/* Seção 2 */}
      <Section
        icon={<Eye size={18} className="text-red-600" />}
        title="2. Como usamos seus dados"
      >
        <p>Utilizamos seus dados para:</p>
        <ul>
          <li>Processar e entregar seus pedidos</li>
          <li>Gerenciar sua conta e autenticação</li>
          <li>Enviar notificações sobre pedidos e promoções</li>
          <li>Facilitar o atendimento via chat</li>
          <li>Melhorar a experiência de compra</li>
          <li>Enviar comunicações sobre o status do pedido</li>
          <li>Cumprir obrigações legais e fiscais</li>
          <li>Prevenir fraudes e garantir a segurança</li>
        </ul>
      </Section>

      {/* Seção 3 */}
      <Section
        icon={<Lock size={18} className="text-red-600" />}
        title="3. Como protegemos seus dados"
      >
        <p>Adotamos medidas de segurança rigorosas:</p>
        <ul>
          <li>Criptografia SSL/TLS em todas as comunicações</li>
          <li>Autenticação segura via Google OAuth 2.0</li>
          <li>Dados armazenados no Firebase (Google Cloud) com criptografia em repouso</li>
          <li>Controle de acesso baseado em papéis (RBAC)</li>
          <li>Monitoramento e logs de auditoria</li>
          <li>Proteção contra ataques XSS, CSRF e injeção de código</li>
          <li>Rate limiting para prevenir abuso</li>
          <li>Dados de pagamento processados exclusivamente pelo SafraPay (PCI DSS)</li>
        </ul>
      </Section>

      {/* Seção 4 */}
      <Section
        icon={<UserCheck size={18} className="text-red-600" />}
        title="4. Compartilhamento de dados"
      >
        <p>Seus dados podem ser compartilhados apenas com:</p>
        <ul>
          <li><strong>SafraPay:</strong> Para processamento de pagamentos (cartão e Pix)</li>
          <li><strong>Nuvemshop:</strong> Para sincronização de catálogo de produtos</li>
          <li><strong>Firebase (Google):</strong> Para autenticação, banco de dados e notificações</li>
          <li><strong>Vercel:</strong> Para hospedagem do aplicativo</li>
        </ul>
        <p><strong>Nunca vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.</strong></p>
      </Section>

      {/* Seção 5 */}
      <Section
        icon={<Shield size={18} className="text-red-600" />}
        title="5. Seus direitos (LGPD)"
      >
        <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
        <ul>
          <li><strong>Acesso:</strong> Solicitar uma cópia dos seus dados pessoais</li>
          <li><strong>Correção:</strong> Corrigir dados incompletos ou desatualizados</li>
          <li><strong>Exclusão:</strong> Solicitar a exclusão dos seus dados</li>
          <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
          <li><strong>Revogação:</strong> Retirar seu consentimento a qualquer momento</li>
          <li><strong>Oposição:</strong> Opor-se ao tratamento dos seus dados</li>
          <li><strong>Informação:</strong> Saber com quem seus dados são compartilhados</li>
        </ul>
        <p>Para exercer seus direitos, entre em contato pelos canais abaixo.</p>
      </Section>

      {/* Seção 6 */}
      <Section
        icon={<Database size={18} className="text-red-600" />}
        title="6. Retenção de dados"
      >
        <p>Seus dados são mantidos:</p>
        <ul>
          <li><strong>Dados da conta:</strong> Enquanto sua conta estiver ativa</li>
          <li><strong>Dados de pedidos:</strong> 5 anos (obrigação fiscal)</li>
          <li><strong>Dados de pagamento:</strong> Processados e descartados pelo SafraPay</li>
          <li><strong>Logs de auditoria:</strong> 90 dias</li>
          <li><strong>Token de notificação:</strong> Até revogação da permissão</li>
        </ul>
        <p>Ao solicitar a exclusão da conta, seus dados pessoais serão removidos em até 30 dias, exceto dados mantidos por obrigação legal.</p>
      </Section>

      {/* Seção 7 */}
      <Section
        icon={<Shield size={18} className="text-red-600" />}
        title="7. Notificações push"
      >
        <p>O aplicativo envia notificações push para:</p>
        <ul>
          <li>Atualizações de status do pedido</li>
          <li>Mensagens do atendente</li>
          <li>Promoções e ofertas (com consentimento)</li>
        </ul>
        <p>Você pode desativar as notificações a qualquer momento nas configurações do seu dispositivo ou nas configurações do aplicativo.</p>
      </Section>

      {/* Seção 8 */}
      <Section
        icon={<Shield size={18} className="text-red-600" />}
        title="8. Cookies e tecnologias similares"
      >
        <p>Utilizamos:</p>
        <ul>
          <li><strong>LocalStorage:</strong> Para armazenar preferências do usuário e dados do carrinho</li>
          <li><strong>Service Worker:</strong> Para cache de assets e funcionamento offline</li>
          <li><strong>Firebase Auth:</strong> Para manter a sessão do usuário</li>
        </ul>
        <p>Não utilizamos cookies de rastreamento ou publicidade de terceiros.</p>
      </Section>

      {/* Seção 9 */}
      <Section
        icon={<Shield size={18} className="text-red-600" />}
        title="9. Menores de idade"
      >
        <p>O aplicativo não é direcionado a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos dados de menores, serão excluídos imediatamente.</p>
      </Section>

      {/* Seção 10 */}
      <Section
        icon={<Shield size={18} className="text-red-600" />}
        title="10. Alterações nesta política"
      >
        <p>Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas através do aplicativo. O uso continuado após as alterações constitui aceitação da nova política.</p>
      </Section>

      {/* Seção 11 */}
      <Section
        icon={<Mail size={18} className="text-red-600" />}
        title="11. Contato"
      >
        <p>Para dúvidas ou solicitações sobre privacidade:</p>
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">contato@pontodoborracheiro.com.br</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">(44) 3029-1016</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">Maringá, Paraná, Brasil</span>
          </div>
        </div>
        <p className="mt-3"><strong>Controlador de dados:</strong></p>
        <p>A.Ayala Ramalho Comércio de Auto Peças</p>
        <p>CNPJ: 32.631.547/0001-81</p>
      </Section>

      {/* Rodapé */}
      <div className="bg-gray-100 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-500">
          Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e as diretrizes da Google Play Store.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Última atualização: 31 de agosto de 2026
        </p>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="font-bold text-sm text-gray-900">{title}</h2>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}