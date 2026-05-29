const Product = require('../models/Product');
const Category = require('../models/Category');

exports.handleChatQuery = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ reply: "Please enter a message." });
        }

        const apiKey = process.env.GEMINI_API_KEY || "AIzaSyD9UOE3mr1A37M77sK-H_HWsi2jQbGVDt8";

        // Fetch database context
        const [categories, products] = await Promise.all([
            Category.find({}),
            Product.find({}).populate('category', 'name')
        ]);

        const catalogContext = products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category?.name || 'General',
            stock: p.stock,
            sizes: p.sizes
        }));

        const categoriesContext = categories.map(c => c.name);

        const systemInstruction = `You are the friendly, intelligent AI Shopping Assistant of "SoleStreet Patna", a premium local footwear store in Patna, Bihar.
Your goal is to guide the user to the best products, handle active discounts/coupons, and clarify store policies.

Important Info:
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

Current catalog:
${JSON.stringify(catalogContext, null, 2)}

Categories: ${JSON.stringify(categoriesContext)}

CRITICAL INSTRUCTIONS:
1. You MUST respond with a valid JSON object containing exactly two fields: "reply" (string) and "productIds" (array of strings).
2. Do NOT include any markdown code fences or extra text outside the JSON.
3. "reply" should be friendly, concise, and helpful. Use bullet points or emojis.
4. "productIds" should be an array of up to 4 matching product _id strings from the catalog above. Use [] if none match.

Example valid response:
{"reply": "Here are some great running shoes! 🏃", "productIds": ["507f1f77bcf86cd799439011"]}`;

        let replyText = "";
        let productIds = [];

        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: systemInstruction + `\n\nUser: "${message}"\n\nRespond with valid JSON only:` }]
                        }
                    ],
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
                // Strip markdown code fences if present
                const cleaned = rawText
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();

                const parsed = JSON.parse(cleaned);
                replyText = parsed.reply || parsed.text || String(parsed);
                productIds = Array.isArray(parsed.productIds) ? parsed.productIds : [];
            }

        } catch (apiError) {
            console.error("Gemini API call failed, falling back to intelligent NLP query logic:", apiError.message);

            const text = message.toLowerCase().trim();
            
            // Default reply selection
            if (text.includes('ship') || text.includes('deliver') || text.includes('delivery') || text.includes('track')) {
                replyText = "📦 **SoleStreet Patna Shipping Policy:**\n• We deliver across India in **3-5 business days**.\n• Orders are dispatched within **24 hours**.\n• **FREE shipping** on all orders above ₹1000! (Standard shipping of ₹99 applies below that).";
            } else if (text.includes('return') || text.includes('refund') || text.includes('exchange') || text.includes('cancel')) {
                replyText = "↩️ **Returns & Refund Policy:**\n• We offer a **7-day hassle-free return and exchange policy** on all unused items.\n• To initiate a return, email us at **support@solestreetpatna.com** with your Order ID.\n• Refund is credited to original payment source within 5-7 business days of warehouse inspection.";
            } else if (text.includes('discount') || text.includes('promo') || text.includes('code') || text.includes('offer') || text.includes('coupon')) {
                replyText = "🎉 **Active Promo Codes & Offers:**\n• **SOLESTREET** — 15% OFF everything in your cart!\n• **SHOE20** — 20% OFF our high-quality footwear catalog!\n• **SNEAKER10** — 10% OFF premium sneakers!\n• **BOOTS25** — 25% OFF all leather boots!\n• **COMFY15** — 15% OFF comfortable daily wear sandals!\n• _Get free shipping auto-applied on checkout for orders over ₹1000!_";
            } else if (text.includes('contact') || text.includes('support') || text.includes('help') || text.includes('phone') || text.includes('email')) {
                replyText = "📞 **SoleStreet Patna Customer Support:**\n• Email us anytime at **support@solestreetpatna.com**.\n• Our support desk is open **Mon–Sat, 9 AM – 6 PM IST**.\n• We typically respond within 2-4 business hours! We're here to help you.";
            } else if (text.includes('price') || text.includes('cheap') || text.includes('affordable') || text.includes('cost')) {
                replyText = "💸 **SoleStreet Patna Pricing:**\n• We bring you top-quality footwear starting at just ₹199!\n• Apply the **SOLESTREET** coupon at checkout to save an extra 15% off your total purchase.";
            } else {
                replyText = "👋 **Hi! I am your SoleStreet Patna AI Assistant.** 🤖\n\nI can help you:\n• Search catalog products (try typing 'shoes', 'mojaris', 'sneakers', or product names)\n• Check delivery rates & policies\n• Find active coupon codes & discounts\n• Guide you through returns or payment queries.\n\n_What would you like to explore today?_";
            }

            // Fallback product matching
            const keywords = text.split(/\s+/).filter(k => k.length > 2);
            if (keywords.length > 0) {
                const matchedProducts = products.filter(p => {
                    const name = p.name.toLowerCase();
                    const desc = p.description ? p.description.toLowerCase() : '';
                    const cat = p.category?.name ? p.category.name.toLowerCase() : '';
                    return keywords.some(kw => name.includes(kw) || desc.includes(kw) || cat.includes(kw));
                }).slice(0, 4);

                if (matchedProducts.length > 0) {
                    productIds = matchedProducts.map(p => p._id.toString());
                    replyText = `🔍 **I searched our catalog and found some matching items you'll love!** 🛍️\n\n${replyText}`;
                }
            }
        }

        // Fetch product details for productIds
        let productsToReturn = [];
        if (productIds && productIds.length > 0) {
            const validIds = productIds.filter(id => id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));
            if (validIds.length > 0) {
                productsToReturn = await Product.find({ _id: { $in: validIds } }).populate('category', 'name');
            }
        }

        const frontendProducts = productsToReturn.map(p => ({
            _id: p._id.toString(),
            name: p.name,
            price: p.price,
            images: p.images,
            categoryName: p.category?.name || 'General'
        }));

        return res.json({
            reply: replyText,
            products: frontendProducts
        });

    } catch (error) {
        console.error("Chatbot Controller General Error:", error);
        res.status(500).json({ 
            reply: "Sorry, I ran into an error. Please try again in a moment.", 
            products: [] 
        });
    }
};
