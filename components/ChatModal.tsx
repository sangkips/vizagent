// 'use client';

// import { useState, useEffect, useRef } from 'react';

// interface ChatMessage {
//   role: 'user' | 'assistant';
//   content: string;
// }

// interface ChatResponse {
//   response: string;
//   visualization?: string;
//   columns?: string[];
// }

// interface ChatModalProps {
//   documentId: string;
//   onClose: () => void;
// }

// export default function ChatModal({ documentId, onClose }: ChatModalProps) {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [visualization, setVisualization] = useState<string | null>(null);
//   const [columns, setColumns] = useState<string[]>([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Scroll to the bottom of the messages when they update
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Fetch chat history on mount
//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       try {
//         const response = await fetch(`http://localhost:8000/api/chat/${documentId}/history`);
//         if (!response.ok) throw new Error('Failed to fetch chat history');
//         const history: ChatMessage[] = await response.json();
//         setMessages(history);
//       } catch (error) {
//         console.error('Error fetching chat history:', error);
//         setMessages([{ role: 'assistant', content: 'Error: Could not load chat history.' }]);
//       }
//     };

//     fetchChatHistory();
//   }, [documentId]);

//   // Handle generating visualization or sending message
//   const handleGenerate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const newMessage: ChatMessage = { role: 'user', content: input };
//     setMessages((prev) => [...prev, newMessage]);
//     setInput('');
//     setIsLoading(true);
//     setVisualization(null);
//     setColumns([]);

//     try {
//       const response = await fetch(`http://localhost:8000/api/chat/${documentId}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: newMessage.content }),
//       });

//       if (!response.ok) throw new Error('Failed to send message');

//       const data: ChatResponse = await response.json();
//       const assistantMessage: ChatMessage = {
//         role: 'assistant',
//         content: data.response || 'Visualization generated successfully.',
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//       setVisualization(data.visualization || null);
//       setColumns(data.columns || []);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages((prev) => [
//         ...prev,
//         { role: 'assistant', content: 'Error: Could not process your request.' },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDownload = () => {
//   if (visualization) {
//     const filename = input.trim() ? `${input.trim().replace(/ /g, '_')}.png` : 'visualization.png';
//     const link = document.createElement('a');
//     link.href = `data:image/png;base64,${visualization}`;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }
// };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg w-full max-w-2xl p-6 flex flex-col h-[80vh]">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">AI Presentation Assistant</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         {/* Prompt Input and Generate Button */}
//         <div className="mb-4 p-4 bg-gray-50 rounded-lg">
//           <p className="text-sm text-gray-600 mb-2">
//             Generate executive-ready visualizations with natural language
//           </p>
//           <form onSubmit={handleGenerate} className="flex gap-2">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Visualize quarterly revenue by region"
//               className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               disabled={isLoading}
//             />
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
//               disabled={isLoading}
//             >
//               {isLoading ? 'Generating...' : 'Generate'}
//             </button>
//           </form>
//         </div>

//         {/* Chat Messages */}
//         <div className="flex-1 overflow-y-auto border p-4 rounded-lg mb-4">
//           {messages.length === 0 ? (
//             <p className="text-gray-500">No messages yet. Enter a prompt to start!</p>
//           ) : (
//             messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
//               >
//                 <span
//                   className={`inline-block p-2 rounded-lg ${
//                     msg.role === 'user'
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 text-black'
//                   }`}
//                 >
//                   {msg.content}
//                 </span>
//               </div>
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Visualization Section */}
//         {visualization && (
//           <div className="p-4 bg-gray-50 rounded-lg">
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="text-lg font-semibold">Visualization results</h3>
//               <button
//                 onClick={handleDownload}
//                 className="text-blue-500 hover:underline"
//                 disabled={!visualization}
//               >
//                 Download
//               </button>
             
//             </div>
//             <img
//               src={`data:image/png;base64,${visualization}`}
//               alt="Visualization"
//               className="w-full h-auto rounded-lg"
//             />
//             {columns.length > 0 && (
//               <p className="mt-2 text-sm text-gray-600">
//                 Available columns: {columns.join(', ')}
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }