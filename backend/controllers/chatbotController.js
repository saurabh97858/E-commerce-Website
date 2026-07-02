const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const translations = require('../locales/chatbotTranslations');

// Helper to retrieve dynamic translations
function getTranslation(langKey, stringKey, params = {}) {
    let lang = (langKey || 'en').toLowerCase().trim();
    if (lang.includes('bhojpuri') || lang.includes('bho')) lang = 'bho';
    else if (lang.includes('tamil') || lang.includes('ta')) lang = 'tamil';
    else if (lang.includes('hinglish')) lang = 'hinglish';
    else if (lang.includes('hindi') || lang.includes('hi')) lang = 'hi';
    else lang = 'en';

    let txt = translations[lang]?.[stringKey] || translations['en']?.[stringKey] || '';
    
    // Interpolate dynamic parameters (e.g. {{orderId}})
    Object.keys(params).forEach(k => {
        txt = txt.replace(new RegExp(`{{${k}}}`, 'g'), params[k]);
    });
    return txt;
}


// Retrieve chat history for a session/user
exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.query;
        let query = {};
        
        if (req.user) {
            query = { user: req.user._id };
        } else if (sessionId) {
            query = { sessionId };
        } else {
            return res.json({ messages: [], handoff: false });
        }

        const history = await ChatHistory.findOne(query).populate({
            path: 'messages.products',
            populate: { path: 'category', select: 'name' }
        });

        if (!history) {
            return res.json({ messages: [], handoff: false });
        }

        return res.json({
            messages: history.messages,
            handoff: history.handoff
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to load chat history" });
    }
};

// Clear chat history for a session/user
exports.clearChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.body;
        let query = {};

        if (req.user) {
            query = { user: req.user._id };
        } else if (sessionId) {
            query = { sessionId };
        } else {
            return res.status(400).json({ message: "Missing identification parameters" });
        }

        await ChatHistory.deleteOne(query);
        return res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({ message: "Failed to clear chat history" });
    }
};

// Process user chat query (AI workflow)
exports.handleChatQuery = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!message) {
            return res.status(400).json({ reply: "Please enter a message." });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Retrieve existing Chat History or create one
        let queryCriteria = {};
        if (req.user) {
            queryCriteria = { user: req.user._id };
        } else if (sessionId) {
            queryCriteria = { sessionId };
        }

        let history = await ChatHistory.findOne(queryCriteria);
        if (!history) {
            history = new ChatHistory({
                user: req.user ? req.user._id : null,
                sessionId: req.user ? undefined : sessionId,
                messages: []
            });
        }

        // Dialogue State Machine Intercepts
        if (history.state === 'AWAITING_CANCEL_REASON' && req.user) {
            const orderId = history.tempData.orderId;
            history.tempData.cancelReason = message;
            history.state = 'AWAITING_CANCEL_METHOD';
            history.markModified('tempData');
            await history.save();

            const replyText = `Thank you. I have recorded your reason: "${message}".\n\nWould you like to **Replace** the item, **Return** it, or get a **Refund**? (Please reply with Replace, Return, or Refund).`;
            
            history.messages.push({ sender: 'user', text: message, timestamp: new Date() });
            history.messages.push({ sender: 'bot', text: replyText, timestamp: new Date() });
            await history.save();

            return res.json({
                reply: replyText,
                products: [],
                orders: [],
                detectedLanguage: "English/Hinglish",
                intent: "cancel_order",
                action: "request_cancel_method"
            });
        }

        if (history.state === 'AWAITING_CANCEL_METHOD' && req.user) {
            const orderId = history.tempData.orderId;
            const cancelReason = history.tempData.cancelReason || "No reason specified";
            const choice = message.toLowerCase().trim();

            let replyText = "";
            let actionStatus = "cancel_order";

            const orderToCancel = await Order.findOne({ _id: orderId, user: req.user._id });

            if (orderToCancel) {
                if (choice.includes('refund')) {
                    orderToCancel.status = 'Cancelled';
                    await orderToCancel.save();
                    replyText = `✅ **Order Cancelled for Refund:** Order #${orderId.slice(-6)} has been cancelled. Your refund of ₹${orderToCancel.totalAmount} will be processed back to your original payment mode within **approx 24 hours**. Reason: ${cancelReason}.`;
                } else if (choice.includes('replace')) {
                    orderToCancel.status = 'Cancelled';
                    await orderToCancel.save();
                    replyText = `🔄 **Replacement Scheduled:** Order #${orderId.slice(-6)} has been scheduled for replacement. Our courier executive will pick up the item and deliver the replacement. Reason: ${cancelReason}.`;
                } else if (choice.includes('return')) {
                    orderToCancel.status = 'Cancelled';
                    await orderToCancel.save();
                    replyText = `↩️ **Return Pickup Scheduled:** Order #${orderId.slice(-6)} has been scheduled for return. Pickup will be completed within 2-3 business days. Reason: ${cancelReason}.`;
                } else {
                    replyText = `⚠️ Please reply with either **Replace**, **Return**, or **Refund** for Order #${orderId.slice(-6)}.`;
                    actionStatus = "request_cancel_method";
                }
            } else {
                replyText = "⚠️ Order not found or permission denied.";
                actionStatus = "cancel_order_error";
            }

            if (actionStatus !== "request_cancel_method") {
                history.state = null;
                history.tempData = {};
                history.markModified('tempData');
            }
            await history.save();

            history.messages.push({ sender: 'user', text: message, timestamp: new Date() });
            history.messages.push({ sender: 'bot', text: replyText, timestamp: new Date() });
            await history.save();

            return res.json({
                reply: replyText,
                products: [],
                orders: [],
                detectedLanguage: "English/Hinglish",
                intent: "cancel_order",
                action: actionStatus
            });
        }

        // Direct Button Click or Query Cancellation Trigger Intercept
        let cancelMatch = message.match(/cancel\s+order\s+([0-9a-fA-F]{24})/i) || message.match(/cancel\s+([0-9a-fA-F]{24})/i);
        if (cancelMatch && req.user) {
            const orderIdToCancel = cancelMatch[1];
            
            // Check if order is already cancelled or delivered
            const checkOrder = await Order.findOne({ _id: orderIdToCancel, user: req.user._id });
            if (checkOrder) {
                if (checkOrder.status === 'Cancelled') {
                    const responseText = "This order is already cancelled.";
                    history.messages.push({ sender: 'user', text: message, timestamp: new Date() });
                    history.messages.push({ sender: 'bot', text: responseText, timestamp: new Date() });
                    await history.save();
                    return res.json({ reply: responseText, products: [], orders: [], detectedLanguage: "English", intent: "cancel_order" });
                }
                if (checkOrder.status === 'Delivered') {
                    const responseText = "Delivered orders cannot be cancelled. You can register a return ticket instead.";
                    history.messages.push({ sender: 'user', text: message, timestamp: new Date() });
                    history.messages.push({ sender: 'bot', text: responseText, timestamp: new Date() });
                    await history.save();
                    return res.json({ reply: responseText, products: [], orders: [], detectedLanguage: "English", intent: "cancel_order" });
                }
            }

            history.state = "AWAITING_CANCEL_REASON";
            history.tempData = { orderId: orderIdToCancel };
            history.markModified('tempData');
            await history.save();

            const replyText = "Please write the reason for cancelling this order:";

            history.messages.push({ sender: 'user', text: message, timestamp: new Date() });
            history.messages.push({ sender: 'bot', text: replyText, timestamp: new Date() });
            await history.save();

            return res.json({
                reply: replyText,
                products: [],
                orders: [],
                detectedLanguage: "English/Hinglish",
                intent: "cancel_order",
                action: "request_cancel_reason"
            });
        }

        // 1. Context Gathering: Categories
        const categories = await Category.find({});
        const categoriesContext = categories.map(c => c.name);

        // 2. RAG Product Retrieval (Regex keyword search to filter catalog context)
        const keywords = message.split(/\s+/)
            .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
            .filter(w => w.length > 2);
        
        let searchCriteria = {};
        if (keywords.length > 0) {
            searchCriteria = {
                $or: [
                    { name: { $regex: keywords.join('|'), $options: 'i' } },
                    { description: { $regex: keywords.join('|'), $options: 'i' } }
                ]
            };
        }
        
        // Fetch up to 8 matching products as our RAG context
        const matchedProductsContext = await Product.find(searchCriteria)
            .populate('category', 'name')
            .limit(8);

        const catalogContext = matchedProductsContext.map(p => ({
            id: p._id.toString(),
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category?.name || 'General',
            stock: p.stock,
            sizes: p.sizes
        }));

        // 3. User & Order Context (Only if user is logged in)
        let userContext = null;
        let ordersContext = [];
        let recentOrdersRaw = [];
        
        if (req.user) {
            userContext = {
                name: `${req.user.name} ${req.user.surname}`,
                email: req.user.email,
                address: req.user.address,
                city: req.user.city,
                pincode: req.user.pincode,
                mobile: req.user.mobile
            };

            recentOrdersRaw = await Order.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(3);

            ordersContext = recentOrdersRaw.map(o => ({
                id: o._id.toString(),
                status: o.status,
                totalAmount: o.totalAmount,
                estimatedDelivery: o.estimatedDelivery,
                createdAt: o.createdAt,
                items: o.items.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size
                })),
                address: `${o.shippingAddress?.address || ''}, ${o.shippingAddress?.city || ''} (${o.shippingAddress?.pincode || ''})`
            }));
        }

        // Get last 6 messages to build prompt conversation history
        const conversationMemory = history.messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        // 5. System Instruction Setup (with Multilingual rules for Bhojpuri, Tamil, Hindi, Hinglish)
        const systemInstruction = `You are the friendly, intelligent AI Shopping Assistant of "SoleStreet Patna", a premium local footwear store in Patna, Bihar.
Your goal is to guide the user to the best products, handle active discounts/coupons, clarify store policies, track/modify orders, create support tickets for complaints, and handle handoffs to human agents.

Important Store Info:
- Store Name: "SoleStreet Patna"
- Active Discounts:
  * SOLESTREET: 15% off everything
  * SHOE20: 20% off footwear
  * SNEAKER10: 10% off sneakers
  * BOOTS25: 25% off boots
  * COMFY15: 15% off sandals & slippers
  * Free Shipping on orders above ₹1000!
- Delivery: 3-5 business days across India. Dispatched within 24 hours.
- Returns: 7-day hassle-free return. Email: support@solestreetpatna.com
- Refund Processing: Takes approx 24 hours after cancellation or return receipt.

Context Data:
- Logged-in User: ${userContext ? JSON.stringify(userContext) : 'Guest User (Not logged in)'}
- User's Recent Orders: ${JSON.stringify(ordersContext)}
- Categories: ${JSON.stringify(categoriesContext)}
- Retrieved Products Catalog (RAG): ${JSON.stringify(catalogContext, null, 2)}

CRITICAL MULTILINGUAL & RESPONSE RULES:
1. Language Support: Automatically detect the language or dialect of the user's message. You MUST write your entire response ("reply" field) in the EXACT same language or dialect that the user used. For example, if they ask in English, reply in English; if Hinglish, reply in Hinglish; if Hindi, reply in Hindi; if Bhojpuri, reply in Bhojpuri; if Tamil, reply in Tamil; if Bengali, reply in Bengali; if French, reply in French, etc. Do not fallback to English or Hindi if the user wrote in a different language/dialect.
2. Intent Detection & Entity Extraction: Classify user intent into one of: 'product_search', 'order_tracking', 'cancel_order', 'change_address', 'create_ticket', 'faq', 'human_handoff', 'general'.
3. Output Format: You MUST respond with a valid JSON object only. Do NOT include markdown fences (like \`\`\`json).
4. JSON fields required:
   - "reply" (string): Concise, friendly text reply in the detected language. Use bullet points or emojis where appropriate.
   - "detectedLanguage" (string): "English", "Hindi", "Hinglish", "Bhojpuri", "Tamil" etc.
   - "intent" (string): The detected intent name.
   - "productIds" (array of strings): Up to 4 matching product IDs from the catalog.
   - "action" (string or null): Action name to execute: "request_cancel_reason", "change_address", "change_profile_address", "create_ticket", "human_handoff", or null.
   - "actionData" (object or null): Payload parameters for action if triggered:
     * For "request_cancel_reason": { "orderId": "idString" }
     * For "change_address": { "orderId": "idString", "newAddress": "updated address string" }
     * For "change_profile_address": { "newAddress": "updated address details string" }
     * For "create_ticket": { "subject": "Short summary of problem", "description": "Details", "category": "Order/Refund/Delivery/Quality/Other" }
     * For "human_handoff": {}

Guidance on Account & Order Management:
- Current Saved Address: If the user asks for their current address, retrieve it from the Logged-in User profile data and display it clearly. If they want to change their profile address, prompt them to write the new address, and set action to "change_profile_address" with the updated details.
- Last Order Details: If the user asks for their last order, look at the first element (index 0) in "User's Recent Orders" (which has the latest order). Display the order ID (last 6 characters), status, amount, estimated delivery, and items.
- Cancellation Flow: If they ask to cancel an order (especially their last order):
  * If Logged in: Tell them you can assist with cancellation, identify the orderId from User's Recent Orders, and set action to "request_cancel_reason" with the orderId. Ask the user friendly: "Please provide the reason for cancellation."
  * DO NOT cancel immediately, and do not trigger "cancel_order" directly. The backend state machine will process the reason and Replace/Refund options.
- Refund Timeline: If they ask when their refund will arrive, tell them it takes approx 24 hours.`;

        let replyText = "";
        let detectedLanguage = "English";
        let intent = "general";
        let productIds = [];
        let action = null;
        let actionData = null;

        try {
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY is not defined in environment variables");
            }
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            // Build Gemini contents payload with memory
            const contentsPayload = [
                ...conversationMemory,
                {
                    role: "user",
                    parts: [{ text: systemInstruction + `\n\nUser: "${message}"\n\nRespond with valid JSON only:` }]
                }
            ];

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contentsPayload,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024
                    }
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`Gemini API error ${response.status}: ${errBody}`);
            }

            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (rawText) {
                const cleaned = rawText
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();

                const parsed = JSON.parse(cleaned);
                replyText = parsed.reply || parsed.text || "Hello! How can I help you today?";
                detectedLanguage = parsed.detectedLanguage || "English";
                intent = parsed.intent || "general";
                productIds = Array.isArray(parsed.productIds) ? parsed.productIds : [];
                action = parsed.action || null;
                actionData = parsed.actionData || null;
            }

        } catch (apiError) {
            console.error("Gemini API call failed. Using local keyword-matching NLP fallback:", apiError.message);
            
            // Fallback Logic with Tamil & Bhojpuri Keyword Support
            const text = message.toLowerCase().trim();
            
            // Bhojpuri triggers
            const isBhojpuri = text.includes('bhojpuri') || text.includes('ba') || text.includes('ka haal') || text.includes('batawa') || text.includes('kare ke');
            // Tamil triggers
            const isTamil = text.includes('tamil') || text.includes('vanakkam') || text.includes('enathu') || text.includes('tamilil');
            // Hindi triggers
            const isHindi = text.includes('kare') || text.includes('hai') || text.includes('kya') || text.includes('achha') || text.includes('bhai') || text.includes('yaar');

            let detectedLang = 'en';
            if (isBhojpuri) detectedLang = 'bho';
            else if (isTamil) detectedLang = 'tamil';
            else if (isHindi) detectedLang = 'hi';

            detectedLanguage = detectedLang === 'bho' ? 'Bhojpuri' : detectedLang === 'tamil' ? 'Tamil' : detectedLang === 'hi' ? 'Hindi/Hinglish' : 'English';

            if (text.includes('ship') || text.includes('deliver') || text.includes('delivery')) {
                intent = "faq";
                replyText = getTranslation(detectedLang, 'shipping');
            } else if (text.includes('return') || text.includes('refund') || text.includes('exchange')) {
                intent = "faq";
                replyText = getTranslation(detectedLang, 'returns');
            } else if (text.includes('discount') || text.includes('code') || text.includes('coupon') || text.includes('offer')) {
                intent = "faq";
                replyText = getTranslation(detectedLang, 'discounts');
            } else if (text.includes('order') || text.includes('track') || text.includes('status') || text.includes('cancell') || text.includes('cancel')) {
                intent = text.includes('cancel') ? "cancel_order" : "order_tracking";
                if (!req.user) {
                    replyText = getTranslation(detectedLang, 'orders_login_required');
                } else if (ordersContext.length === 0) {
                    replyText = getTranslation(detectedLang, 'orders_none');
                } else {
                    if (text.includes('cancel')) {
                        replyText = getTranslation(detectedLang, 'orders_cancel_instructions');
                    } else {
                        replyText = getTranslation(detectedLang, 'orders_tracking_instructions');
                    }
                }
            } else if (text.includes('human') || text.includes('agent') || text.includes('support') || text.includes('talk')) {
                intent = "human_handoff";
                action = "human_handoff";
            } else {
                intent = "general";
                replyText = getTranslation(detectedLang, 'general_greeting');
            }

            // Fallback product matching
            if (keywords.length > 0) {
                const fallbackProducts = await Product.find({
                    $or: [
                        { name: { $regex: keywords.join('|'), $options: 'i' } }
                    ]
                }).limit(4);
                productIds = fallbackProducts.map(p => p._id.toString());
            }
        }

        // 6. Action Execution Implementation
        let ticketId = null;
        let handoff = history.handoff || false;

        if (action && req.user) {
            try {
                if (action === "request_cancel_reason" && actionData?.orderId) {
                    history.state = "AWAITING_CANCEL_REASON";
                    history.tempData = { orderId: actionData.orderId };
                    history.markModified('tempData');
                    await history.save();
                }

                if (action === "change_profile_address" && actionData?.newAddress) {
                    const userObj = await User.findById(req.user._id);
                    if (userObj) {
                        userObj.address = actionData.newAddress;
                        if (actionData.city) userObj.city = actionData.city;
                        if (actionData.pincode) userObj.pincode = actionData.pincode;
                        await userObj.save();
                        replyText += `\n\n✅ **Profile Saved Address Updated:** Your profile default address has been updated successfully to: "${actionData.newAddress}".`;
                    }
                }

                if (action === "cancel_order" && actionData?.orderId) {
                    const orderToCancel = await Order.findOne({ _id: actionData.orderId, user: req.user._id });
                    if (orderToCancel) {
                        if (orderToCancel.status === 'Cancelled') {
                            replyText += "\n\n" + getTranslation(detectedLanguage, 'cancel_already');
                        } else {
                            orderToCancel.status = 'Cancelled';
                            await orderToCancel.save();
                            replyText += "\n\n" + getTranslation(detectedLanguage, 'cancel_success', { orderId: orderToCancel._id.toString().slice(-6) });
                        }
                    }
                }

                if (action === "change_address" && actionData?.orderId && actionData?.newAddress) {
                    const orderToUpdate = await Order.findOne({ _id: actionData.orderId, user: req.user._id });
                    if (orderToUpdate) {
                        if (orderToUpdate.status === 'Delivered' || orderToUpdate.status === 'Cancelled') {
                            replyText += "\n\n" + getTranslation(detectedLanguage, 'address_change_rejected', { status: orderToUpdate.status });
                        } else {
                            orderToUpdate.shippingAddress.address = actionData.newAddress;
                            await orderToUpdate.save();
                            replyText += "\n\n" + getTranslation(detectedLanguage, 'address_change_success', { orderId: orderToUpdate._id.toString().slice(-6), address: actionData.newAddress });
                        }
                    }
                }

                if (action === "create_ticket" && actionData) {
                    const ticketIdVal = 'SST-' + Math.floor(100000 + Math.random() * 900000);
                    const newTicket = new Ticket({
                        ticketId: ticketIdVal,
                        user: req.user._id,
                        email: req.user.email,
                        subject: actionData.subject || "Customer Complaint",
                        description: actionData.description || message,
                        category: ['Order', 'Refund', 'Delivery', 'Quality', 'Other'].includes(actionData.category) ? actionData.category : 'Other',
                        status: 'Open'
                    });
                    await newTicket.save();
                    ticketId = ticketIdVal;
                    replyText += "\n\n" + getTranslation(detectedLanguage, 'ticket_created', { ticketId: ticketIdVal, email: req.user.email });
                }

            } catch (actionErr) {
                console.error("Action execution error:", actionErr);
            }
        }

        // Apply handoff action (runs even for guest)
        if (action === "human_handoff") {
            handoff = true;
            replyText += "\n\n" + getTranslation(detectedLanguage, 'human_handoff');
        }

        // Resolve Product Documents for Frontend Cards
        let productsToReturn = [];
        const validIds = productIds.filter(id => id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));
        if (validIds.length > 0) {
            productsToReturn = await Product.find({ _id: { $in: validIds } }).populate('category', 'name');
        }

        const frontendProducts = productsToReturn.map(p => ({
            _id: p._id.toString(),
            name: p.name,
            price: p.price,
            images: p.images,
            categoryName: p.category?.name || 'General'
        }));

        // Resolve Order Details for Frontend Cards
        const frontendOrders = recentOrdersRaw.map(o => ({
            _id: o._id.toString(),
            status: o.status,
            totalAmount: o.totalAmount,
            estimatedDelivery: o.estimatedDelivery,
            createdAt: o.createdAt,
            items: o.items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size
            }))
        }));

        // Only attach orders if the query was related to cancellation, tracking, or is in active cancel dialog states
        const shouldAttachOrders = ['order_tracking', 'cancel_order'].includes(intent) ||
                                   ['request_cancel_reason', 'request_cancel_method', 'cancel_order', 'cancel_order_error'].includes(action) ||
                                   history.state !== null;
        const ordersPayload = shouldAttachOrders ? (frontendOrders || []) : [];

        // Update Chat History memory in DB
        history.messages.push({
            sender: 'user',
            text: message,
            timestamp: new Date()
        });

        history.messages.push({
            sender: 'bot',
            text: replyText,
            products: validIds,
            orders: ordersPayload,
            action: action,
            ticketId: ticketId,
            timestamp: new Date()
        });

        if (handoff) {
            history.handoff = true;
        }

        await history.save();

        // Send response
        return res.json({
            reply: replyText,
            products: frontendProducts,
            orders: ordersPayload, // Send recent orders list to frontend only when relevant
            detectedLanguage,
            intent,
            action,
            ticketId,
            handoff: history.handoff
        });

    } catch (error) {
        console.error("Chatbot Controller Error:", error);
        res.status(500).json({
            reply: "Sorry, I ran into an unexpected error: " + error.message,
            products: [],
            orders: [],
            debugError: error.message,
            debugStack: error.stack
        });
    }
};
