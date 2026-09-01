import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, ShoppingCart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/nuvemshop';
import { useCart } from '../contexts/CartContext';

const INACTIVITY_TIMEOUT = 120000;

const WELCOME_MESSAGE = {
  id: 1,
  sender: 'bot',
  type: 'text',
  text: 'Olá! Sou o assistente virtual do Ponto do Borracheiro. Como posso ajudar?\n\nVocê pode perguntar sobre:\n• Produtos específicos\n• Preços e estoque\n• Categorias\n• Formas de pagamento\n• Prazo de entrega',
  time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
};

export default function FloatingChat() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const bubbleRef = useRef(null);

  const [lastActivity, setLastActivity] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen && products.length === 0) loadProducts();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT) {
        setMessages([{
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: 'Parece que você saiu por um tempo! 😊\n\nOlá novamente! Como posso ajudar?',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }]);
        setLastActivity(Date.now());
      }
    }, 10000);
    return () => clearInterval(timerRef.current);
  }, [isOpen, lastActivity]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handlePointerDown = (e) => {
    if (isOpen) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    const rect = bubbleRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isOpen) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    if (Math.sqrt(dx * dx + dy * dy) > 15) {
      hasMovedRef.current = true;
    }
    if (hasMovedRef.current) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 64)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 64)),
      });
    }
  };

  const handlePointerUp = () => {
    if (!hasMovedRef.current && isDragging) {
      setIsOpen(true);
      setLastActivity(Date.now());
    }
    setIsDragging(false);
  };

  const normalize = (text) => (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const findAnswer = (question) => {
    const q = normalize(question);
    const words = q.split(/\s+/).filter(w => w.length > 2);

    if (['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'eai', 'salve', 'hello', 'hi'].some(g => q.includes(g)))
      return { type: 'text', text: 'Olá! Bem-vindo ao Ponto do Borracheiro! Como posso ajudar?' };

    if (['tchau', 'ate logo', 'obrigado', 'obrigada', 'valeu', 'flw', 'falou'].some(g => q.includes(g)))
      return { type: 'text', text: 'De nada! Se precisar de mais alguma coisa, é só chamar!' };

    if (['frete', 'entrega', 'prazo', 'envio', 'entregar', 'chega', 'correio'].some(s => q.includes(s)))
      return { type: 'text', text: 'Entrega para toda Maringá e região. Prazo de até 3 dias úteis. Consulte o frete no checkout ou fale com nosso vendedor!' };

    if (['pagamento', 'pagar', 'pix', 'cartao', 'boleto', 'credito', 'debito', 'parcela'].some(p => q.includes(p)))
      return { type: 'text', text: 'Formas de pagamento:\n\n• Pix (3% desconto)\n• Cartão de Crédito (Mercado Pago)\n• Boleto Bancário' };

    if (['horario', 'hora', 'funciona', 'abre', 'fecha', 'atende', 'aberto', 'fechado'].some(h => q.includes(h)))
      return { type: 'text', text: 'Horário:\n• Seg-Sex: 8h às 18h\n• Sábado: 8h às 12h\n• Domingo: Fechado' };

    if (['onde', 'endereco', 'localizacao', 'local', 'fica', 'mapa', 'maringa'].some(l => q.includes(l)))
      return { type: 'text', text: 'Estamos em Maringá, Paraná. Para o endereço exato, fale com nosso vendedor!' };

    if (['categoria', 'tipos', 'tipo', 'secao'].some(c => q.includes(c))) {
      const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
      return { type: 'text', text: cats.length > 0 ? `Categorias:\n\n${cats.map(c => `• ${c}`).join('\n')}` : 'Pneus, Câmaras, Mangueiras, Kits, Remendos, Ferramentas, Bicos, Acessórios!' };
    }

    if (['quantos produtos', 'quantidade', 'total de produtos', 'quantos itens', 'catalogo'].some(c => q.includes(c)))
      return { type: 'text', text: `Temos ${products.filter(p => p.price > 0 && p.stock > 0).length} produtos disponíveis!` };

    if (['estoque', 'disponivel', 'disponibilidade'].some(s => q.includes(s)))
      return { type: 'text', text: `Temos ${products.filter(p => p.stock > 0 && p.price > 0).length} produtos em estoque!` };

    if (['promocao', 'oferta', 'desconto', 'barato', 'preco bom', 'ofertas'].some(p => q.includes(p)))
      return { type: 'text', text: 'Pix tem 3% de desconto automático! Acompanhe as ofertas na tela inicial.' };

    if (['falar', 'atendente', 'vendedor', 'humano', 'pessoa', 'whatsapp', 'telefone'].some(c => q.includes(c)))
      return { type: 'text', text: 'Para falar com atendente, vá na aba "Ajuda" no menu inferior. Respondemos Seg-Sex, 8h às 18h!' };

    const categoryKeywords = {
      'pneu': 'Pneus', 'pneus': 'Pneus',
      'camera': 'Câmaras de Ar', 'camara': 'Câmaras de Ar',
      'mangueira': 'Mangueiras', 'mangueiras': 'Mangueiras',
      'kit': 'Kits', 'kits': 'Kits',
      'cola': 'Colas e Remendos', 'remendo': 'Colas e Remendos', 'remendos': 'Colas e Remendos',
      'ferramenta': 'Ferramentas', 'ferramentas': 'Ferramentas',
      'bico': 'Bicos e Válvulas', 'valvula': 'Bicos e Válvulas',
      'acessorio': 'Acessórios para Borracharia', 'acessorios': 'Acessórios para Borracharia',
      'abracadeira': 'Acessórios para Borracharia',
    };

    for (const [keyword, category] of Object.entries(categoryKeywords)) {
      if (q.includes(keyword)) {
        const catProducts = products.filter(p => normalize(p.category) === normalize(category) && p.price > 0 && p.stock > 0);
        if (catProducts.length > 0) return { type: 'products', text: `Encontrei ${catProducts.length} produtos na categoria ${category}:`, products: catProducts.slice(0, 6), total: catProducts.length, category };
        return { type: 'text', text: `Sem produtos disponíveis na categoria ${category} no momento.` };
      }
    }

    const matched = products.filter(p => {
      const name = normalize(p.name);
      const desc = normalize(p.description);
      const sku = normalize(p.sku);
      return words.some(w => name.includes(w) || desc.includes(w) || sku.includes(w));
    });

    if (matched.length > 0) {
      const valid = matched.filter(p => p.price > 0 && p.stock > 0);
      if (valid.length > 0) return { type: 'products', text: `Encontrei ${valid.length} produto(s):`, products: valid.slice(0, 5), total: valid.length };
      return { type: 'text', text: `Encontrei ${matched.length} resultado(s), mas sem estoque no momento.` };
    }

    return { type: 'text', text: 'Não encontrei. Tente buscar por nome, categoria ou SKU!' };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: input.trim(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setLastActivity(Date.now());
    const question = input.trim();
    setInput('');
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    const answer = findAnswer(question);
    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', ...answer, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const quickReplies = ['Quais categorias tem?', 'Formas de pagamento', 'Prazo de entrega', 'Falar com vendedor'];

  const handleQuickReply = (text) => {
    setLastActivity(Date.now());
    setInput(text);
    setTimeout(() => {
      const userMsg = { id: Date.now(), sender: 'user', text, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);
      setTimeout(() => {
        const answer = findAnswer(text);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', ...answer, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
        setIsTyping(false);
      }, 500 + Math.random() * 700);
    }, 50);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setLastActivity(Date.now());
    setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', type: 'text', text: `"${product.name}" adicionado ao carrinho!`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const bubbleStyle = position.x !== null
    ? { position: 'fixed', left: `${position.x}px`, top: `${position.y}px`, zIndex: 9999 }
    : { position: 'fixed', bottom: '85px', right: '16px', zIndex: 9999 };

  return (
    <>
      {!isOpen && (
        <div
          ref={bubbleRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={bubbleStyle}
          className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <MessageCircle size={26} className="text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[380px] sm:h-[560px] sm:rounded-3xl sm:shadow-2xl sm:border sm:border-gray-200 overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Bot size={20} /></div>
              <div>
                <h3 className="font-extrabold text-sm">Assistente Virtual</h3>
                <p className="text-[11px] text-white/80 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Online agora</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              if (isBot && msg.type === 'products' && msg.products) {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-1"><Bot size={14} className="text-red-600" /></div>
                    <div className="max-w-[85%] space-y-2">
                      <div className="bg-white rounded-3xl rounded-bl-md shadow-xs border border-gray-100 px-4 py-2.5"><p className="text-xs font-medium text-gray-800">{msg.text}</p></div>
                      {msg.products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                          <div className="flex gap-3 p-3">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => { navigate(`/product/${product.id}`); setIsOpen(false); }}>
                              {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart size={20} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-red-600 transition-colors" onClick={() => { navigate(`/product/${product.id}`); setIsOpen(false); }}>{product.name}</p>
                              <p className="text-sm font-black text-red-600 mt-0.5">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                              <p className="text-[10px] text-emerald-600 font-bold">R$ {(product.price * 0.97).toFixed(2).replace('.', ',')} no Pix</p>
                            </div>
                          </div>
                          <div className="flex border-t border-gray-100">
                            <button onClick={() => handleAddToCart(product)} className="flex-1 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-1"><ShoppingCart size={13} />Adicionar</button>
                            <div className="w-px bg-gray-100" />
                            <button onClick={() => { navigate(`/product/${product.id}`); setIsOpen(false); }} className="flex-1 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1"><ExternalLink size={13} />Ver produto</button>
                          </div>
                        </div>
                      ))}
                      {msg.total > msg.products.length && (
                        <div className="bg-red-50 rounded-2xl border border-red-100 px-3 py-2 text-center">
                          <button onClick={() => navigate('/categories')} className="text-[11px] font-bold text-red-600 hover:underline">Ver todos os {msg.total} produtos</button>
                        </div>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium block text-right">{msg.time}</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                  {isBot && <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-1"><Bot size={14} className="text-red-600" /></div>}
                  <div className={`max-w-[80%] px-4 py-2.5 ${isBot ? 'bg-white text-gray-800 rounded-3xl rounded-bl-md shadow-xs border border-gray-100' : 'bg-red-600 text-white rounded-3xl rounded-br-md shadow-md'}`}>
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block text-right font-medium ${isBot ? 'text-gray-400' : 'text-white/70'}`}>{msg.time}</span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-1"><Bot size={14} className="text-red-600" /></div>
                <div className="bg-white rounded-3xl rounded-bl-md shadow-xs border border-gray-100 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {loadingProducts && <div className="text-center py-2"><Loader2 size={16} className="mx-auto text-red-600 animate-spin" /><p className="text-[10px] text-gray-400 font-medium mt-1">Carregando catálogo...</p></div>}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0 bg-white border-t border-gray-100">
              {quickReplies.map((text, idx) => (
                <button key={idx} onClick={() => handleQuickReply(text)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[11px] font-bold whitespace-nowrap border border-red-100 active:scale-95 transition-all hover:bg-red-100">{text}</button>
              ))}
            </div>
          )}

          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Pergunte sobre produtos..." className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-xs font-medium border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
              <button onClick={handleSend} disabled={!input.trim()} className={`p-2.5 rounded-2xl transition-all shadow-sm ${input.trim() ? 'bg-red-600 text-white active:scale-90 hover:bg-red-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}><Send size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}