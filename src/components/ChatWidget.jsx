import React, { useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "../context/AuthContext";
import {
  HiMiniChatBubbleLeftRight,
  HiMiniXMark,
  HiMiniUsers,
  HiMiniUserGroup,
  HiChevronLeft,
  HiPaperAirplane,
  HiCheck,
  HiCheckCircle,
  HiTrash,
  HiReply,
  HiClock // Import Clock Icon for pending state
} from "react-icons/hi2";

// ================= CONFIG =================
const API_BASE = import.meta.env.VITE_API_URL || "http://eduproject.site/api";
const WS_ENDPOINT = import.meta.env.VITE_WS_URL || "http://eduproject.site/ws-chat";

// ================= TAGS CONSTANTS =================
const TAGS = [
  { key: "ANNOUNCEMENT", label: "@announcement", description: "Global notice" },
  { key: "IMPORTANT", label: "@important", description: "Critical info" },
  { key: "ENQUIRY", label: "@enquiry", description: "Questions" },
  { key: "PROBLEM", label: "@problem", description: "Issues/Bugs" },
];

// ================= HELPER COMPONENTS =================

// 1. Message Bubble Component
const MessageBubble = ({ msg, isMine, onReply, onDelete }) => {
  const isDeleted = msg.isDeleted;
  const isPending = msg.status === "sending"; // Check if message is pending
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-2 ${isMine ? "justify-end" : "justify-start"} group`}>
      <div className={`relative max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm 
        ${isMine ? "bg-emerald-700 text-white rounded-tr-none" : "bg-slate-800 text-gray-200 rounded-tl-none"}
        ${isDeleted ? "italic opacity-60 border border-red-500/30" : ""}
        ${isPending ? "opacity-70" : ""} 
      `}>
        
        {/* Reply Preview */}
        {msg.replyToContent && (
          <div className="mb-1 p-1 bg-black/20 rounded border-l-2 border-white/50 text-xs opacity-80 truncate">
            <span className="font-bold block text-[10px]">{msg.replyToSender}</span>
            {msg.replyToContent}
          </div>
        )}

        {/* Sender Name (in Group) */}
        {!isMine && msg.type !== 'PRIVATE' && (
          <div className="text-[10px] font-bold text-orange-400 mb-0.5">
            {msg.senderName}
          </div>
        )}

        {/* Content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {isDeleted ? <span className="flex items-center gap-1"><HiTrash className="w-3 h-3"/> This message was deleted</span> : msg.content}
        </div>

        {/* Footer: Time & Status */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
          <span>{time}</span>
          {isMine && !isDeleted && (
            <span>
              {isPending ? (
                <HiClock className="w-3 h-3 text-gray-300" /> // Show Clock if sending
              ) : (
                msg.isRead || (msg.seenByNames && msg.seenByNames.length > 0) ? (
                  <HiCheckCircle className="w-3 h-3 text-blue-300" title={`Seen by: ${msg.seenByNames?.join(', ') || 'User'}`} />
                ) : (
                  <HiCheck className="w-3 h-3 text-gray-300" />
                )
              )}
            </span>
          )}
        </div>

        {/* Hover Actions (Reply/Delete) - Only if sent */}
        {!isDeleted && !isPending && (
          <div className={`absolute top-0 ${isMine ? "-left-16" : "-right-16"} hidden group-hover:flex bg-slate-900 rounded-md shadow-lg p-1`}>
            <button onClick={() => onReply(msg)} className="p-1.5 hover:bg-slate-700 text-gray-300 rounded"><HiReply/></button>
            {isMine && (
              <button onClick={() => onDelete(msg.id)} className="p-1.5 hover:bg-red-900/50 text-red-400 rounded"><HiTrash/></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const { user, token } = useContext(AuthContext);

  // --- STATE ---
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("GROUPS"); // "GROUPS" or "DIRECT"
  const [view, setView] = useState("LIST"); // "LIST" or "CHAT"
  
  // Data
  const [teamList, setTeamList] = useState([]);
  const [userList, setUserList] = useState([]); // For Direct Messages
  const [activeChat, setActiveChat] = useState(null); // { id, name, type: 'TEAM'|'PRIVATE'|'COMMUNITY' }
  const [messages, setMessages] = useState([]);
  
  // Input
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  // Refs
  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    if (user && token && open) {
      // Fetch Teams
      fetch(`${API_BASE}/team-chat/my-teams`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setTeamList(d || [])).catch(console.error);

      // Fetch Available Users for DM
      fetch(`${API_BASE}/chat/available-users`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setUserList(d || [])).catch(() => setUserList([])); 
    }
  }, [user, token, open]);

  // --- 2. WEBSOCKET CONNECTION ---
  useEffect(() => {
    if (!user || !open) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to Personal Queue (For DMs and Read Receipts)
        client.subscribe(`/user/${user.id}/queue/messages`, (msg) => {
          handleIncomingMessage(JSON.parse(msg.body));
        });
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [user, token, open]);

  // --- 3. CHAT ROOM LOGIC ---
  useEffect(() => {
    if (!stompClientRef.current || !activeChat || view !== "CHAT") return;

    const client = stompClientRef.current;
    let sub;

    // Load History
    const url = activeChat.type === 'PRIVATE' 
      ? `${API_BASE}/chat/private/${activeChat.id}`
      : `${API_BASE}/team-chat/${activeChat.id}/messages`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setMessages)
      .catch(console.error);

    // Subscribe to Room
    if (activeChat.type === 'TEAM') {
      sub = client.subscribe(`/topic/team/${activeChat.id}`, (m) => handleIncomingMessage(JSON.parse(m.body)));
    } else if (activeChat.type === 'COMMUNITY') {
      sub = client.subscribe(`/topic/community`, (m) => handleIncomingMessage(JSON.parse(m.body)));
    }

    return () => { if (sub) sub.unsubscribe(); };
  }, [activeChat, view]);

  // --- 4. AUTO SCROLL ---
  useEffect(() => {
    if(scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  // --- 5. HANDLERS ---
  
  const handleIncomingMessage = (newMsg) => {
    setMessages(prev => {
      // 1. DELETE Event
      if(newMsg.isDeleted && newMsg.id) {
        return prev.map(m => m.id === newMsg.id ? { ...m, isDeleted: true, content: "🚫 This message was deleted" } : m);
      }
      
      // 2. READ RECEIPT Event
      if(newMsg.type === 'READ_RECEIPT') {
        return prev.map(m => m.id === newMsg.messageId ? { ...m, isRead: true, seenByNames: newMsg.seenByNames } : m);
      }

      // 3. NEW MESSAGE (Optimistic UI Handling)
      // Agar ye message MERA hai, toh check karo kya mere pass "sending" wala version hai?
      if (newMsg.senderId === user.id) {
        // Find if we have a temporary message with same content
        const tempIndex = prev.findIndex(m => m.status === "sending" && m.content === newMsg.content);
        
        if (tempIndex !== -1) {
          // Replace temporary message with real one from server (Updates ID and Status)
          const newArr = [...prev];
          newArr[tempIndex] = newMsg; 
          return newArr;
        }
        
        // Agar duplicate hone ka dar hai (e.g. fast network), check by ID
        if (prev.some(m => m.id === newMsg.id)) return prev;
      }

      // Normal message from others
      return [...prev, newMsg];
    });
    
    // Send Read Receipt if active and not mine
    if(activeChat && newMsg.senderId !== user.id) {
      stompClientRef.current.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({ messageId: newMsg.id, type: activeChat.type })
      });
    }
  };

  // 🔥 UPDATED: Send with Optimistic UI (Instant Show)
  const handleSend = () => {
    if (!input.trim()) return;

    const content = input;
    const replyId = replyTo?.id || null;

    // 1. Create Temporary Message
    const tempMsg = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: content,
      senderId: user.id,
      senderName: user.name || "Me",
      createdAt: new Date().toISOString(),
      type: activeChat.type,
      isRead: false,
      isDeleted: false,
      status: "sending", // Special flag
      replyToContent: replyTo ? replyTo.content : null,
      replyToSender: replyTo ? replyTo.senderName : null
    };

    // 2. Update UI Immediately
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    setReplyTo(null);

    // 3. Send to Server
    const payload = {
      content: content,
      senderId: user.id,
      recipientId: activeChat.type === 'PRIVATE' ? activeChat.id : null,
      teamId: activeChat.type === 'TEAM' ? activeChat.id : null,
      replyToId: replyId,
      type: activeChat.type
    };

    const dest = activeChat.type === 'PRIVATE' ? "/app/private.send" : 
                 activeChat.type === 'TEAM' ? "/app/team.send" : "/app/community.send";

    if(stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({ destination: dest, body: JSON.stringify(payload) });
    } else {
        console.error("WebSocket not connected");
        // Optional: Mark message as failed
    }
  };

  const handleDelete = (msgId) => {
    if(!confirm("Delete for everyone?")) return;
    stompClientRef.current.publish({
      destination: "/app/chat.delete",
      body: JSON.stringify({ messageId: msgId, type: activeChat.type, userId: user.id })
    });
  };

  // --- RENDER ---
  if (!user) return null;

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
        {open ? <HiMiniXMark size={28} /> : <HiMiniChatBubbleLeftRight size={28} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40">
          
          {/* Header */}
          <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center gap-3">
            {view === "CHAT" && (
              <button onClick={() => setView("LIST")} className="p-1 hover:bg-slate-800 rounded-full text-gray-400">
                <HiChevronLeft size={20} />
              </button>
            )}
            <div>
              <h3 className="text-sm font-bold text-gray-100">
                {view === "LIST" ? "Messages" : activeChat?.name}
              </h3>
              <p className="text-[10px] text-emerald-400">
                {view === "CHAT" && activeChat?.type === 'PRIVATE' ? "Online" : "Project Management Chat"}
              </p>
            </div>
          </div>

          {/* List View */}
          {view === "LIST" && (
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                <button 
                  onClick={() => setActiveTab("GROUPS")} 
                  className={`flex-1 py-3 text-xs font-bold ${activeTab === "GROUPS" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-500"}`}
                >
                  Groups
                </button>
                <button 
                  onClick={() => setActiveTab("DIRECT")} 
                  className={`flex-1 py-3 text-xs font-bold ${activeTab === "DIRECT" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-500"}`}
                >
                  Direct Messages
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeTab === "GROUPS" ? (
                  <>
                    <div onClick={() => { setActiveChat({ type: 'COMMUNITY', id: 'global', name: 'Community Global' }); setView('CHAT'); }} className="p-3 hover:bg-slate-900 rounded-lg cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400"><HiMiniUsers size={20}/></div>
                      <div><h4 className="text-sm text-gray-200 font-medium">Community Global</h4></div>
                    </div>
                    {teamList.map(t => (
                      <div key={t.teamId} onClick={() => { setActiveChat({ type: 'TEAM', id: t.teamId, name: t.teamName }); setView('CHAT'); }} className="p-3 hover:bg-slate-900 rounded-lg cursor-pointer flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400"><HiMiniUserGroup size={20}/></div>
                        <div><h4 className="text-sm text-gray-200 font-medium">{t.teamName}</h4></div>
                      </div>
                    ))}
                  </>
                ) : (
                  userList.length === 0 ? <div className="text-center text-xs text-gray-500 mt-4">No contacts available.</div> :
                  userList.map(u => (
                    <div key={u.id} onClick={() => { setActiveChat({ type: 'PRIVATE', id: u.id, name: u.name }); setView('CHAT'); }} className="p-3 hover:bg-slate-900 rounded-lg cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-bold">{u.name[0]}</div>
                      <div>
                        <h4 className="text-sm text-gray-200 font-medium">{u.name}</h4>
                        <p className="text-[10px] text-gray-500">{u.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat View */}
          {view === "CHAT" && (
            <>
              <div className="flex-1 overflow-y-auto p-3 bg-[#0b141a] scrollbar-thin">
                {messages.map((msg, i) => (
                  <MessageBubble 
                    key={msg.id || i} // Use ID if available, else index
                    msg={msg} 
                    isMine={msg.senderId === user.id} 
                    onReply={setReplyTo} 
                    onDelete={handleDelete}
                  />
                ))}
                <div ref={scrollRef} />
              </div>

              {/* Reply Preview */}
              {replyTo && (
                <div className="px-3 py-2 bg-slate-900 border-l-4 border-emerald-500 flex justify-between items-center">
                  <div className="text-xs text-gray-300">
                    <span className="text-emerald-400 font-bold block">Replying to {replyTo.senderName}</span>
                    <span className="truncate block max-w-[200px]">{replyTo.content}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)}><HiMiniXMark/></button>
                </div>
              )}

              {/* Input */}
              <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2 items-end">
                <textarea 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Type a message..." 
                  className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none h-11 max-h-24"
                />
                <button onClick={handleSend} disabled={!input.trim()} className="bg-emerald-600 p-3 rounded-full text-white hover:bg-emerald-500 disabled:opacity-50">
                  <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;