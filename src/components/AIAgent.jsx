import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';

const AIAgent = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Bonjour ! Je suis l\'assistant IA de Briwel DODAHO. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    const userMessage = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Clé API Gemini manquante dans la configuration.');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "Tu es l'assistant virtuel IA sur le portfolio de Briwel DODAHO, un développeur Full-Stack diplômé en Génie Logiciel, expert en React, NestJS, Flutter et PostgreSQL. Ton rôle est de répondre aux visiteurs de façon concise, polie et professionnelle en te basant sur ces infos. Ne donne pas de code sauf si on te le demande. Le projet phare de Briwel est le 'Chœur Hangbé' (une plateforme pour la gestion et vente de partitions). Il est ouvert aux opportunités en CDI, freelance, ou collaborations techniques."
            }]
          },
          contents: [{
            parts: [{
              text: userText
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API Gemini');
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const botResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: "Désolé, je n'ai pas pu formuler de réponse." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "Une erreur est survenue lors de la connexion à l'IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="text-purple-500" />
        <h3 className="text-xl font-bold text-white">Assistant IA</h3>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-3 bg-gray-900 rounded-xl text-white border border-white/10"
          placeholder="Posez une question..."
        />
        <button onClick={handleSend} disabled={isLoading} className={`p-3 rounded-xl text-white ${isLoading ? 'bg-purple-600/50 cursor-not-allowed' : 'bg-purple-600'}`}>
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default AIAgent;