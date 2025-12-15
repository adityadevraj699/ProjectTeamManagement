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
  HiTrash, // NOTE: HiTrash icon is kept but the logic is removed
  HiArrowUturnLeft,
  HiClock
} from "react-icons/hi2";

// ================= CONFIG =================
const API_BASE = import.meta.env.VITE_API_URL || "http://eduproject.site/api";
const WS_ENDPOINT = import.meta.env.VITE_WS_URL || "http://eduproject.site/ws-chat";

// ================= CONSTANTS =================
const TAGS = [
  { key: "ANNOUNCEMENT", label: "@announcement", description: "Global notice" },
  { key: "IMPORTANT", label: "@important", description: "Critical info" },
  { key: "ENQUIRY", label: "@enquiry", description: "Questions" },
  { key: "PROBLEM", label: "@problem", description: "Issues/Bugs" },
];

// ================= COMPONENT: SKELETON LOADER =================
const ChatSkeleton = () => {
  return (
    <div className="space-y-4 p-3 animate-pulse opacity-50">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className={`h-10 rounded-xl ${i % 2 === 0 ? "bg-emerald-900/50 w-48" : "bg-slate-800 w-32"}`}></div>
        </div>
      ))}
    </div>
  );
};

// ================= COMPONENT: MESSAGE BUBBLE =================
const MessageBubble = ({ msg, isMine, onReply }) => {
  const isDeleted = msg.isDeleted;
  const isPending = msg.status === "sending"; 
  
  let time = "";
  try {
    time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { time = "--:--"; }

  return (
    <div className={`flex w-full mb-2 ${isMine ? "justify-end" : "justify-start"} group`}>
      <div className={`relative max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm 
        ${isMine ? "bg-emerald-700 text-white rounded-tr-none" : "bg-slate-800 text-gray-200 rounded-tl-none"}
        ${isDeleted ? "italic opacity-60 border border-red-500/30" : ""}
        ${isPending ? "opacity-80" : ""} 
      `}>
        
        {/* Reply Preview */}
        {msg.replyToContent && (
          <div className="mb-1 p-1 bg-black/20 rounded border-l-2 border-white/50 text-xs opacity-80 truncate">
            <span className="font-bold block text-[10px]">{msg.replyToSender}</span>
            {msg.replyToContent}
          </div>
        )}

        {/* Sender Name (Only in Groups/Community & Not Me) */}
        {!isMine && (
          <div className="text-[10px] font-bold text-orange-400 mb-0.5">
            {msg.senderName}
          </div>
        )}

        {/* Message Content */}
        <div className="whitespace-pre-wrap leading-relaxed break-words">
          {isDeleted ? (
            <span className="flex items-center gap-1 text-gray-300">
              <HiTrash className="w-3 h-3"/> This message was deleted
            </span>
          ) : (
            msg.content
          )}
        </div>

        {/* Footer: Time & Status Icons */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
          <span>{time}</span>
          {isMine && !isDeleted && (
            <span>
              {isPending ? (
                <HiClock className="w-3 h-3 text-gray-300 animate-pulse" /> 
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

        {/* Hover Actions (Only Reply remains) */}
        {!isDeleted && !isPending && (
          <div className={`absolute top-0 ${isMine ? "-left-10" : "-right-10"} hidden group-hover:flex bg-slate-900 rounded-md shadow-lg p-1 z-10`}>
            <button onClick={() => onReply(msg)} className="p-1.5 hover:bg-slate-700 text-gray-300 rounded" title="Reply"><HiArrowUturnLeft/></button>
            {/* 🚫 DELETION REMOVED AS REQUESTED */}
          </div>
        )}
      </div>
    </div>
  );
};

// ================= MAIN WIDGET =================
const ChatWidget = () => {
  const { user, token } = useContext(AuthContext);

  // --- STATE ---
  const [open, setOpen] = useState(true); // Default to open for desktop view
  const [view, setView] = useState("CHAT"); // Default to CHAT to show the side-by-side view initially
  const [isLoading, setIsLoading] = useState(false);
  
  const [teamList, setTeamList] = useState([]);
  const [activeChat, setActiveChat] = useState({ type: 'COMMUNITY', id: 'global', name: 'Community Global' }); // Default Chat
  const [messages, setMessages] = useState([]);
  
  const messageCache = useRef({}); 

  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);
  
  // Set default view based on screen size (Mobile < 768px uses the fixed toggle)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false); // Mobile: Start closed
    } else {
      setOpen(true); // Desktop: Start open
    }
  }, []);


  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    if (user && token && open) {
      // Teams fetch
      fetch(`${API_BASE}/team-chat/my-teams`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setTeamList(d || [])).catch(console.error);
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
        
        // Initial subscription to active chat topic if already set
        if (activeChat) {
            subscribeToActiveChat(client, activeChat);
        }
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [user, token, open]);

  // Helper function to handle chat subscription
  const subscribeToActiveChat = (client, chat) => {
    if (!chat) return;
    if (chat.type === 'TEAM') {
        return client.subscribe(`/topic/team/${chat.id}`, (m) => handleIncomingMessage(JSON.parse(m.body)));
    } else if (chat.type === 'COMMUNITY') {
        return client.subscribe(`/topic/community`, (m) => handleIncomingMessage(JSON.parse(m.body)));
    }
  };

  // --- 3. ACTIVE CHAT LOGIC ---
  useEffect(() => {
    if (!user || !activeChat) return;

    const client = stompClientRef.current;
    let sub;
    const cacheKey = `${activeChat.type}_${activeChat.id}`;

    // 1. Check Cache first
    if (messageCache.current[cacheKey]) {
      setMessages(messageCache.current[cacheKey]);
      setIsLoading(false);
    } else {
      setMessages([]); 
      setIsLoading(true);
    }

    // 2. Fetch History from Server
    const url = activeChat.type === 'COMMUNITY'
        ? `${API_BASE}/community/messages`
        : `${API_BASE}/team-chat/${activeChat.id}/messages`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        messageCache.current[cacheKey] = data; // Update Cache
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // 3. Subscribe if client is connected (or waiting for connection)
    if (client && client.connected) {
        sub = subscribeToActiveChat(client, activeChat);
    } else if (client) {
        // If client is not connected yet, the onConnect handler will set up initial subscriptions.
        // We ensure a new subscription is set up when the client eventually connects.
        // For simplicity here, we rely on the primary useEffect to handle reconnection/activation.
    }
    
    // Cleanup old subscription
    return () => { if (sub) sub.unsubscribe(); };
  }, [activeChat]);


  // --- 4. SCROLL TO BOTTOM ---
  useEffect(() => {
    if(scrollRef.current) {
        // Smooth scrolling for better UX
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]); // Trigger scroll on message update or when loading finishes


  // --- 5. LOGIC: HANDLING INCOMING MESSAGES ---
  const handleIncomingMessage = (newMsg) => {
    setMessages(prev => {
      let updatedList = [...prev];

      // CASE 1: Delete Event
      if (newMsg.isDeleted && newMsg.id) {
        updatedList = prev.map(m => m.id === newMsg.id ? { ...m, isDeleted: true, content: "🚫 This message was deleted" } : m);
      }
      // CASE 2: Read Receipt
      else if (newMsg.type === 'READ_RECEIPT') {
        updatedList = prev.map(m => m.id === newMsg.messageId ? { ...m, isRead: true, seenByNames: newMsg.seenByNames } : m);
      }
      // CASE 3: New Message
      else {
        if (newMsg.senderId === user.id) {
          // Check for pending temporary message and replace it with the confirmed message
          const tempIndex = prev.findIndex(m => m.status === "sending" && m.content === newMsg.content);
          if (tempIndex !== -1) {
            updatedList[tempIndex] = newMsg; 
          } else if (prev.some(m => m.id === newMsg.id)) {
            return prev; // Duplicate, likely due to reconnection
          } else {
            updatedList.push(newMsg);
          }
        } else {
          updatedList.push(newMsg);
        }
      }

      // Update Cache
      if (activeChat) {
        const cacheKey = `${activeChat.type}_${activeChat.id}`;
        messageCache.current[cacheKey] = updatedList;
      }
      
      return updatedList;
    });

    // Send Read Receipt
    if(activeChat && newMsg.senderId !== user.id && !newMsg.isRead && !newMsg.isDeleted) {
      stompClientRef.current.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({ messageId: newMsg.id, type: activeChat.type })
      });
    }
  };

  // --- 6. LOGIC: SEND MESSAGE (OPTIMISTIC UI) ---
  const handleSend = () => {
    if (!input.trim()) return;

    const content = input;
    const replyId = replyTo?.id || null;

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

    // Optimistic UI Update
    setMessages(prev => {
        const newList = [...prev, tempMsg];
        return newList;
    });

    setInput("");
    setReplyTo(null);
    setShowTagMenu(false);

    const payload = {
      content: content,
      senderId: user.id,
      teamId: activeChat.type === 'TEAM' ? activeChat.id : null,
      replyToId: replyId,
      type: activeChat.type,
      tag: null 
    };

    const dest = activeChat.type === 'TEAM' ? "/app/team.send" : "/app/community.send";

    if(stompClientRef.current?.connected) {
        stompClientRef.current.publish({ destination: dest, body: JSON.stringify(payload) });
    } else {
        console.error("WebSocket disconnected. Message might not send.");
    }
  };

  // 🚫 Deletion logic removed as requested (handleDelete is now absent)
  // const handleDelete = (msgId) => {...}

  // --- 7. INPUT HANDLER ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.includes("@") && !val.includes(" ")) {
      setShowTagMenu(true);
      setTagQuery(val.substring(val.indexOf("@") + 1).toLowerCase());
    } else {
      setShowTagMenu(false);
    }
  };

  const selectTag = (tagLabel) => {
    setInput(tagLabel + " ");
    setShowTagMenu(false);
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    setView("CHAT");
  };

  if (!user) return null;

  // --- RENDER ---
  return (
    <>
      {/* Fixed mobile toggle button (Show only on small screens) */}
      {window.innerWidth < 768 && (
        <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          {open ? <HiMiniXMark size={28} /> : <HiMiniChatBubbleLeftRight size={28} />}
        </button>
      )}

      <div className={`
        // Mobile fixed overlay
        ${window.innerWidth < 768 ? "fixed bottom-0 right-0 w-full h-full max-h-full" : "w-full max-w-[1200px] mx-auto my-4 h-[90vh]"}
        
        bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-[1000] transition-all duration-300
        ${window.innerWidth < 768 && !open ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}
      `}>
        
        {/* Left Pane: Group/Team List (Always visible on Desktop) */}
        <div className={`
          md:flex md:flex-col md:w-80 border-r border-slate-800 flex-shrink-0 
          ${window.innerWidth < 768 && view === "CHAT" ? "hidden" : "flex flex-col flex-1"}
        `}>
            {/* Header for List View */}
            <div className="bg-slate-900 p-3 border-b border-slate-800">
                <h3 className="text-lg font-bold text-gray-100">Messages</h3>
                <p className="text-xs text-emerald-400">Project Management Chat</p>
            </div>
            
            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                <div onClick={() => handleChatSelect({ type: 'COMMUNITY', id: 'global', name: 'Community Global' })} className="p-3 hover:bg-slate-900 rounded-lg cursor-pointer flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400"><HiMiniUsers size={20}/></div>
                    <div><h4 className="text-sm text-gray-200 font-medium">Community Global</h4><p className="text-[10px] text-gray-500">All members</p></div>
                </div>
                {teamList.map(t => (
                    <div key={t.teamId} onClick={() => handleChatSelect({ type: 'TEAM', id: t.teamId, name: t.teamName })} className="p-3 hover:bg-slate-900 rounded-lg cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400"><HiMiniUserGroup size={20}/></div>
                      <div><h4 className="text-sm text-gray-200 font-medium">{t.teamName}</h4><p className="text-[10px] text-gray-500">Project Group</p></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Pane: Chat Window (Main content on Desktop, toggleable on Mobile) */}
        <div className={`
          md:flex md:flex-col md:flex-1 w-full 
          ${window.innerWidth < 768 && view === "LIST" ? "hidden" : "flex flex-col flex-1"}
        `}>
            {/* Chat Header (Name of Active Chat) */}
            <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center gap-3 flex-shrink-0">
                {window.innerWidth < 768 && (
                    <button onClick={() => setView("LIST")} className="p-1 hover:bg-slate-800 rounded-full text-gray-400">
                        <HiChevronLeft size={20} />
                    </button>
                )}
                <div>
                    <h3 className="text-sm font-bold text-gray-100">{activeChat?.name}</h3>
                    <p className="text-[10px] text-emerald-400">
                        {activeChat?.type === 'COMMUNITY' ? 'Global Discussion' : 'Team Channel'}
                    </p>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 bg-[#0b141a] scrollbar-thin">
                {activeChat ? (
                    isLoading ? (
                        <ChatSkeleton />
                    ) : (
                        messages.map((msg, i) => (
                            <MessageBubble 
                                key={msg.id || i} 
                                msg={msg} 
                                isMine={msg.senderId === user.id} 
                                onReply={setReplyTo} 
                                // onDelete is now absent
                            />
                        ))
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">Select a group to start chatting.</div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input and Reply Area */}
            {activeChat && (
                <div className="flex flex-col flex-shrink-0">
                    {/* Reply Preview Box */}
                    {replyTo && (
                        <div className="px-3 py-2 bg-slate-900 border-l-4 border-emerald-500 flex justify-between items-center animate-in slide-in-from-bottom-2 fade-in duration-200">
                            <div className="text-xs text-gray-300">
                                <span className="text-emerald-400 font-bold block">Replying to {replyTo.senderName}</span>
                                <span className="truncate block max-w-[200px] opacity-80">{replyTo.content}</span>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-slate-800 rounded"><HiMiniXMark/></button>
                        </div>
                    )}

                    {/* Input Box */}
                    <div className="p-2 bg-slate-900 border-t border-slate-800 relative">
                        {/* Tag Menu */}
                        {showTagMenu && (
                            <div className="absolute bottom-16 left-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-48 overflow-hidden z-50">
                                {TAGS.filter(t => t.label.includes(tagQuery)).map(tag => (
                                    <div key={tag.key} onClick={() => selectTag(tag.label)} className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-xs text-gray-200 border-b border-slate-700/50 last:border-0">
                                        <div className="font-bold text-sky-400">{tag.label}</div>
                                        <div className="text-[10px] text-gray-500">{tag.description}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <textarea 
                                value={input} 
                                onChange={handleInputChange} 
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Type a message..." 
                                className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none h-11 max-h-24 overflow-y-auto scrollbar-none"
                            />
                            <button onClick={handleSend} disabled={!input.trim()} className="bg-emerald-600 p-3 rounded-full text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg">
                                <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default ChatWidget;