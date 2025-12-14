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
  HiClock
} from "react-icons/hi2";

// ================= CONFIG =================
const API_BASE = import.meta.env.VITE_API_URL || "http://eduproject.site/api";
const WS_ENDPOINT = import.meta.env.VITE_WS_URL || "http://eduproject.site/ws-chat";

// ================= SKELETON LOADER COMPONENT =================
const ChatSkeleton = () => {
  return (
    <div className="space-y-4 p-3 animate-pulse opacity-50">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className={`h-10 rounded-xl ${i % 2 === 0 ? "bg-emerald-900/50 w-48" : "bg-slate-800 w-32"}`}></div>
        </div>
      ))}
    </div>
  );
};

// ================= MESSAGE BUBBLE COMPONENT =================
const MessageBubble = ({ msg, isMine, onReply, onDelete }) => {
  const isDeleted = msg.isDeleted;
  const isPending = msg.status === "sending";
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
                <HiClock className="w-3 h-3 text-gray-300" />
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

        {/* Hover Actions */}
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

// ================= MAIN COMPONENT =================
const ChatWidget = () => {
  const { user, token } = useContext(AuthContext);

  // --- STATE ---
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("GROUPS");
  const [view, setView] = useState("LIST");
  const [isLoading, setIsLoading] = useState(false); // ✅ Loader State
  
  // Data
  const [teamList, setTeamList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // ✅ CACHE STATE (To store messages of visited rooms)
  // Format: { 'TEAM_1': [...msgs], 'PRIVATE_2': [...msgs] }
  const messageCache = useRef({}); 

  // Input
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  // Refs
  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);

  // --- 1. INITIAL FETCH (Teams & Users) ---
  useEffect(() => {
    if (user && token && open) {
      fetch(`${API_BASE}/team-chat/my-teams`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setTeamList(d || [])).catch(console.error);

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
        client.subscribe(`/user/${user.id}/queue/messages`, (msg) => {
          handleIncomingMessage(JSON.parse(msg.body));
        });
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [user, token, open]);

  // --- 3. CHAT ROOM LOGIC (Optimized Loading) ---
  useEffect(() => {
    if (!stompClientRef.current || !activeChat || view !== "CHAT") return;

    const client = stompClientRef.current;
    let sub;
    const cacheKey = `${activeChat.type}_${activeChat.id}`;

    // ✅ STEP 1: Check Cache First
    if (messageCache.current[cacheKey]) {
      setMessages(messageCache.current[cacheKey]); // Show instantly
      setIsLoading(false);
    } else {
      setMessages([]); 
      setIsLoading(true); // Show Skeleton
    }

    // ✅ STEP 2: Fetch Latest from Server (Background Refresh)
    const url = activeChat.type === 'PRIVATE' 
      ? `${API_BASE}/chat/private/${activeChat.id}`
      : `${API_BASE}/team-chat/${activeChat.id}/messages`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        messageCache.current[cacheKey] = data; // Update Cache
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // ✅ STEP 3: Subscribe to Room
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
        scrollRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, view, isLoading]);

  // --- 5. HANDLERS ---
  const handleIncomingMessage = (newMsg) => {
    setMessages(prev => {
      let updatedList;
      
      // Handle Delete
      if(newMsg.isDeleted && newMsg.id) {
        updatedList = prev.map(m => m.id === newMsg.id ? { ...m, isDeleted: true, content: "🚫 This message was deleted" } : m);
      }
      // Handle Read Receipt
      else if(newMsg.type === 'READ_RECEIPT') {
        updatedList = prev.map(m => m.id === newMsg.messageId ? { ...m, isRead: true, seenByNames: newMsg.seenByNames } : m);
      }
      // Handle New Message
      else {
        if (newMsg.senderId === user.id) {
          // Replace temp message
          const tempIndex = prev.findIndex(m => m.status === "sending" && m.content === newMsg.content);
          if (tempIndex !== -1) {
            updatedList = [...prev];
            updatedList[tempIndex] = newMsg; 
          } else if (prev.some(m => m.id === newMsg.id)) {
            return prev; // Duplicate check
          } else {
            updatedList = [...prev, newMsg];
          }
        } else {
          updatedList = [...prev, newMsg];
        }
      }

      // ✅ Update Cache for next time
      if(activeChat) {
        const cacheKey = `${activeChat.type}_${activeChat.id}`;
        messageCache.current[cacheKey] = updatedList;
      }
      
      return updatedList;
    });
    
    // Read Receipt Logic
    if(activeChat && newMsg.senderId !== user.id && !newMsg.isRead && !newMsg.isDeleted) {
      stompClientRef.current.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({ messageId: newMsg.id, type: activeChat.type })
      });
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const content = input;
    const replyId = replyTo?.id || null;

    // Optimistic Update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: content,
      senderId: user.id,
      senderName: user.name || "Me",
      createdAt: new Date().toISOString(),
      type: activeChat.type,
      isRead: false,
      isDeleted: false,
      status: "sending",
      replyToContent: replyTo ? replyTo.content : null,
      replyToSender: replyTo ? replyTo.senderName : null
    };

    setMessages(prev => {
        const newList = [...prev, tempMsg];
        // Update cache immediately too
        const cacheKey = `${activeChat.type}_${activeChat.id}`;
        messageCache.current[cacheKey] = newList;
        return newList;
    });
    
    setInput("");
    setReplyTo(null);

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

    if(stompClientRef.current?.connected) {
        stompClientRef.current.publish({ destination: dest, body: JSON.stringify(payload) });
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
              <div className="flex border-b border-slate-800">
                <button onClick={() => setActiveTab("GROUPS")} className={`flex-1 py-3 text-xs font-bold ${activeTab === "GROUPS" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-500"}`}>Groups</button>
                <button onClick={() => setActiveTab("DIRECT")} className={`flex-1 py-3 text-xs font-bold ${activeTab === "DIRECT" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-500"}`}>Direct Messages</button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
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
                {/* ✅ Loader Condition */}
                {isLoading ? (
                  <ChatSkeleton />
                ) : (
                  messages.map((msg, i) => (
                    <MessageBubble 
                      key={msg.id || i} 
                      msg={msg} 
                      isMine={msg.senderId === user.id} 
                      onReply={setReplyTo} 
                      onDelete={handleDelete}
                    />
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              {replyTo && (
                <div className="px-3 py-2 bg-slate-900 border-l-4 border-emerald-500 flex justify-between items-center">
                  <div className="text-xs text-gray-300">
                    <span className="text-emerald-400 font-bold block">Replying to {replyTo.senderName}</span>
                    <span className="truncate block max-w-[200px]">{replyTo.content}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)}><HiMiniXMark/></button>
                </div>
              )}

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