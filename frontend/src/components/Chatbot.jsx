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

    // Sync welcome message if user changes (log in / log out)
    useEffect(() => {
        setMessages(prev => {
            const copy = [...prev];
            if (copy[0] && copy[0].isWelcome) {
                copy[0].text = getWelcomeMessage();
            }
            return copy;
        });
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

        // Add user message
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
            const { data } = await API.post('/chatbot', { message: queryText });
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: data.reply,
                products: data.products || []
            }]);
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

    const handleResetChat = () => {
        if (window.confirm("Do you want to reset your chat history?")) {
            setMessages([
                {
                    sender: 'bot',
                    text: getWelcomeMessage(),
                    products: [],
                    isWelcome: true
                }
            ]);
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
            <button 
                className={`chatbot-launcher-btn ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open support chat"
            >
                {isOpen ? <FaTimes /> : <FaComments />}
                {!isOpen && <span className="chatbot-launcher-ping" />}
            </button>

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
                                Gemini Active
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
