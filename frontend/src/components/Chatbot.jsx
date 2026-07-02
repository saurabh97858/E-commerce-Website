import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaRobot, FaTimes, FaPaperPlane, FaComments, FaShoppingBag, FaSync, FaCheck } from 'react-icons/fa';

// Custom lightweight markdown renderer to display bold text, lists, and formatted paragraphs nicely.
const renderFormattedText = (text) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
        let isBullet = false;
        let cleanLine = line;
        
        // Match bullet markers: •, *, - at start
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
            isBullet = true;
            cleanLine = trimmed.replace(/^[•*\-]\s*/, '');
        }
        
        // Parse bold markers: **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(cleanLine)) !== null) {
            if (match.index > lastIndex) {
                parts.push(cleanLine.substring(lastIndex, match.index));
            }
            parts.push(<strong key={match.index}>{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
        }
        
        if (lastIndex < cleanLine.length) {
            parts.push(cleanLine.substring(lastIndex));
        }

        const content = parts.length > 0 ? parts : cleanLine;
        
        if (isBullet) {
            return (
                <li key={index} style={{ marginLeft: '14px', marginBottom: '6px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                    {content}
                </li>
            );
        }
        
        if (trimmed === '') {
            return <div key={index} style={{ height: '8px' }} />;
        }
        
        return (
            <p key={index} style={{ margin: '0 0 6px 0', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                {content}
            </p>
        );
    });
};

const Chatbot = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [handoffActive, setHandoffActive] = useState(false);
    
    // Welcome message helper based on auth state
    const getWelcomeMessage = () => {
        const name = user ? user.name.split(' ')[0] : 'there';
        return `Hi ${name}! I am your SoleStreet Patna AI Assistant. 🤖 Ask me anything! You can ask about our premium sneaker catalog, sizing, local store pickup, shipping, discounts, or trending footwear.`;
    };

    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: getWelcomeMessage(),
            products: [],
            isWelcome: true
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [addedProductId, setAddedProductId] = useState(null); // Track click visual feedback
    const chatEndRef = useRef(null);

    // Sync welcome message and fetch session history from MongoDB on mount/auth changes
    useEffect(() => {
        // 1. Get or create sessionId
        let sId = localStorage.getItem('chatbot_session_id');
        if (!sId) {
            sId = 'ss_sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('chatbot_session_id', sId);
        }
        setSessionId(sId);

        // 2. Fetch history from backend
        const loadHistory = async () => {
            try {
                const { data } = await API.get(`/chatbot/history?sessionId=${sId}`);
                if (data && data.messages && data.messages.length > 0) {
                    const mapped = data.messages.map(m => {
                        const userInitial = user ? user.name.charAt(0).toUpperCase() : 'U';
                        return {
                            sender: m.sender,
                            text: m.text,
                            products: m.products || [],
                            orders: m.orders || [],
                            initial: m.sender === 'user' ? userInitial : undefined,
                            ticketId: m.ticketId,
                            action: m.action
                        };
                    });
                    setMessages(mapped);
                    setHandoffActive(data.handoff || false);
                } else {
                    setMessages([
                        {
                            sender: 'bot',
                            text: getWelcomeMessage(),
                            products: [],
                            isWelcome: true
                        }
                    ]);
                    setHandoffActive(false);
                }
            } catch (err) {
                console.error("Error loading chat history:", err);
            }
        };

        loadHistory();
    }, [user]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (textToSend) => {
        const queryText = textToSend || message;
        if (!queryText.trim()) return;

        // User avatar initials
        const userInitial = user ? user.name.charAt(0).toUpperCase() : 'U';

        // Add user message to state
        const newMessages = [...messages, { 
            sender: 'user', 
            text: queryText, 
            products: [],
            initial: userInitial
        }];
        
        setMessages(newMessages);
        if (!textToSend) setMessage('');
        setLoading(true);

        const lowerQuery = queryText.toLowerCase().trim();

        // Conversational triggers handled locally for faster response
        if (lowerQuery === 'thanks' || lowerQuery === 'thank you' || lowerQuery === 'ty') {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: "You're very welcome! Let me know if you need help finding anything else. Happy shopping! 😊",
                    products: []
                }]);
                setLoading(false);
            }, 500);
            return;
        }

        if (lowerQuery === 'bye' || lowerQuery === 'goodbye' || lowerQuery === 'exit') {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: "Goodbye! Have an amazing day ahead. Hope to see you back at SoleStreet Patna soon! 👋",
                    products: []
                }]);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const { data } = await API.post('/chatbot', { message: queryText, sessionId });
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: data.reply,
                products: data.products || [],
                orders: data.orders || [],
                ticketId: data.ticketId,
                action: data.action
            }]);
            
            if (data.handoff) {
                setHandoffActive(true);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "Sorry, I ran into an error connecting to the AI server. Please check your connection and try again.",
                products: []
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleResetChat = async () => {
        if (window.confirm("Do you want to reset your chat history?")) {
            try {
                await API.post('/chatbot/clear', { sessionId });
                setMessages([
                    {
                        sender: 'bot',
                        text: getWelcomeMessage(),
                        products: [],
                        isWelcome: true
                    }
                ]);
                setHandoffActive(false);
            } catch (err) {
                console.error("Failed to clear history on server:", err);
            }
        }
    };

    const handleQuickAdd = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
        setAddedProductId(product._id);
        
        try {
            await addToCart(product._id, 1, defaultSize);
            setTimeout(() => setAddedProductId(null), 1500); // clear indicator
        } catch (error) {
            console.error("Quick add failed:", error);
            setAddedProductId(null);
        }
    };

    // Quick inquiry prompt chips
    const suggestions = [
        { label: '🏃‍♂️ Sports under ₹3000', query: 'sports shoes under 3000' },
        { label: '🏷️ SOLESTREET Offer', query: 'what is SOLESTREET code?' },
        { label: '📦 Shipping Info', query: 'delivery policy' },
        { label: '🔥 Discount Codes', query: 'active promo codes' }
    ];

    return (
        <div className="chatbot-container">
            {/* Floating Chat Action Button */}
            {!isOpen && (
                <button 
                    className="chatbot-launcher-btn" 
                    onClick={() => setIsOpen(true)}
                    aria-label="Open support chat"
                >
                    <FaComments />
                    <span className="chatbot-launcher-ping" />
                </button>
            )}

            {/* Chat Dialog Box */}
            <div className={`chatbot-dialog ${isOpen ? 'chatbot-open' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="chatbot-avatar">
                            <FaRobot />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: '700' }}>SoleStreet Patna AI</h4>
                            <span style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                                {handoffActive ? 'Support Handoff' : 'Gemini Active'}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            className="chatbot-header-action" 
                            onClick={handleResetChat} 
                            title="Reset Chat History"
                            aria-label="Reset chat history"
                        >
                            <FaSync />
                        </button>
                        <button 
                            className="chatbot-close-btn" 
                            onClick={() => setIsOpen(false)} 
                            aria-label="Close chat"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Handoff Banner */}
                {handoffActive && (
                    <div style={{
                        padding: '10px 16px',
                        background: 'rgba(235, 94, 40, 0.15)',
                        borderBottom: '1px solid rgba(235, 94, 40, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)' }}>
                            🎧 Support Agent Requested
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Our support staff has been notified. You can also contact us directly:
                        </span>
                        <a 
                            href="mailto:support@solestreetpatna.com?subject=Support%20Request"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                                background: 'var(--accent)',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                marginTop: '4px'
                            }}
                        >
                            ✉️ Email Support
                        </a>
                    </div>
                )}

                {/* Messages Body */}
                <div className="chatbot-body">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}>
                            {msg.sender === 'bot' ? (
                                <div className="chat-bubble-avatar"><FaRobot /></div>
                            ) : (
                                <div className="chat-bubble-user-avatar">{msg.initial || 'U'}</div>
                            )}
                            <div className="chat-bubble-content" style={{ width: '100%' }}>
                                <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                                    {renderFormattedText(msg.text)}

                                    {/* Support Ticket Badge */}
                                    {msg.ticketId && (
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px'
                                        }}>
                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Support Ticket Created</span>
                                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--success)' }}>🎫 {msg.ticketId}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Our team will review your complaint and respond via email within 24 hours.</span>
                                        </div>
                                    )}

                                    {/* Action links inside welcome message bubble */}
                                    {msg.isWelcome && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                            <button 
                                                onClick={() => handleSendMessage("Suggest running shoes")} 
                                                className="chat-welcome-link-btn"
                                            >
                                                🔍 Find Running Shoes
                                            </button>
                                            <button 
                                                onClick={() => handleSendMessage("Are there any discount codes?")} 
                                                className="chat-welcome-link-btn"
                                            >
                                                💸 Active Promo Codes
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Render in-chat recommended products */}
                                {msg.products && msg.products.length > 0 && (
                                    <div className="chat-products-grid">
                                        {msg.products.map((prod) => (
                                            <Link 
                                                key={prod._id} 
                                                to={`/product/${prod._id}`} 
                                                className="chat-product-card"
                                                onClick={() => setIsOpen(false)} // Auto close chatbot on redirect
                                            >
                                                <div className="chat-product-img-wrapper">
                                                    <img 
                                                        src={
                                                            (() => {
                                                                 const img = prod.images?.[0];
                                                                 if (!img || typeof img !== 'string' || img.trim() === '') return '/placeholder.png';
                                                                 if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                                 const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
                                                                 return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
                                                            })()
                                                        } 
                                                        alt={prod.name} 
                                                    />
                                                </div>
                                                <div className="chat-product-info" style={{ flex: 1 }}>
                                                    <span className="chat-product-cat">{prod.categoryName}</span>
                                                    <h5 className="chat-product-name">{prod.name}</h5>
                                                    <span className="chat-product-price">₹{prod.price}</span>
                                                </div>
                                                
                                                {/* Pro Quick Add Button */}
                                                <button
                                                    className={`chat-quick-add-btn ${addedProductId === prod._id ? 'added' : ''}`}
                                                    onClick={(e) => handleQuickAdd(e, prod)}
                                                    disabled={addedProductId === prod._id}
                                                    title="Quick Add to Cart"
                                                >
                                                    {addedProductId === prod._id ? <FaCheck /> : <FaShoppingBag />}
                                                </button>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Render in-chat orders list for tracking / cancel */}
                                {msg.orders && msg.orders.length > 0 && (
                                    <div className="chat-orders-container" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        marginTop: '12px',
                                        width: '100%'
                                    }}>
                                        {msg.orders.map((ord) => (
                                            <div key={ord._id} className="chat-order-card" style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                        Order #{ord._id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        padding: '3px 8px',
                                                        borderRadius: '12px',
                                                        background: ord.status === 'Cancelled' ? 'rgba(235, 94, 40, 0.2)' : ord.status === 'Delivered' ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                        color: ord.status === 'Cancelled' ? 'var(--accent)' : ord.status === 'Delivered' ? 'var(--success)' : 'var(--text-secondary)'
                                                    }}>
                                                        {ord.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                    {ord.items.map((item, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                                                            <span>{item.name} (x{item.quantity}) {item.size && `[Size ${item.size}]`}</span>
                                                            <span>₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Total: <strong>₹{ord.totalAmount}</strong></span>
                                                    {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to cancel Order #${ord._id.slice(-6).toUpperCase()}?`)) {
                                                                    handleSendMessage(`Cancel order ${ord._id}`);
                                                                }
                                                            }}
                                                            style={{
                                                                background: 'rgba(235, 94, 40, 0.15)',
                                                                color: 'var(--accent)',
                                                                border: '1px solid var(--accent)',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                padding: '4px 10px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.background = 'var(--accent)';
                                                                e.target.style.color = 'white';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.background = 'rgba(235, 94, 40, 0.15)';
                                                                e.target.style.color = 'var(--accent)';
                                                            }}
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-bubble-wrapper bot-wrapper">
                            <div className="chat-bubble-avatar"><FaRobot /></div>
                            <div className="chat-bubble bot-bubble typing-bubble">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Suggestions Prompt Chips */}
                <div className="chatbot-suggestions">
                    {suggestions.map((chip, idx) => (
                        <button 
                            key={idx} 
                            className="suggestion-chip"
                            onClick={() => handleSendMessage(chip.query)}
                            disabled={loading}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

                {/* Input Controls */}
                <div className="chatbot-footer">
                    <input
                        type="text"
                        placeholder="Search shoes, promo codes, shipping..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        disabled={!message.trim() || loading}
                        aria-label="Send message"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
