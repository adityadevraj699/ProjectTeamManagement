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
} from "react-icons/hi2";

// ================= CONFIG =================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const WS_ENDPOINT = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws-chat";

// ================= TAGS CONSTANTS =================
const TAGS = [
  { key: "ANNOUNCEMENT", label: "@announcement", description: "Global notice" },
  { key: "IMPORTANT", label: "@important", description: "Critical info" },
  { key: "ENQUIRY", label: "@enquiry", description: "Questions" },
  { key: "PROBLEM", label: "@problem", description: "Issues/Bugs" },
];

// ================= STYLING HELPERS =================
const bubbleClasses = (isMine, tag) => {
  if (!tag || tag === "NORMAL") {
    return isMine
      ? "bg-sky-600 text-white rounded-br-none"
      : "bg-slate-800 text-gray-100 border border-white/10 rounded-bl-none";
  }
  const colors = {
    ANNOUNCEMENT: isMine ? "bg-purple-600" : "bg-purple-900 border-purple-400/30",
    IMPORTANT: isMine ? "bg-red-600" : "bg-red-900 border-red-400/30",
    ENQUIRY: isMine ? "bg-amber-600 text-white" : "bg-amber-900 border-amber-400/30",
    PROBLEM: isMine ? "bg-orange-600" : "bg-orange-900 border-orange-400/30",
  };
  return `${colors[tag] || colors.NORMAL} text-white rounded-xl ${
    isMine ? "rounded-br-none" : "rounded-bl-none"
  }`;
};

const tagBadgeStyle = (tag) => {
  const styles = {
    ANNOUNCEMENT: "bg-purple-400/20 text-purple-200",
    IMPORTANT: "bg-red-400/20 text-red-200",
    ENQUIRY: "bg-amber-400/20 text-amber-200",
    PROBLEM: "bg-orange-400/20 text-orange-200",
  };
  return styles[tag] || "bg-gray-600/30";
};

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const ChatWidget = () => {
  const { user, token } = useContext(AuthContext);

  // UI State
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("LIST"); // "LIST" or "CHAT"
  
  // Data State
  const [myTeams, setMyTeams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Chat Logic State
  const [activeChat, setActiveChat] = useState({
    type: "community", // "community" | "team"
    id: null,
    name: "Community",
  });

  // Input State
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  // Refs
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  // ================= 1. FETCH TEAMS =================
  useEffect(() => {
    if (user && token && open) {
      fetch(`${API_BASE}/team-chat/my-teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
            if(!res.ok) throw new Error("Failed to fetch teams");
            return res.json();
        })
        .then((data) => {
            // console.log("My Teams Loaded:", data);
            setMyTeams(data || []);
        })
        .catch((err) => console.error("Failed to load teams", err));
    }
  }, [user, token, open]);

  // ================= 2. LOAD HISTORY =================
  useEffect(() => {
    if (!open || view === "LIST") return;

    setMessages([]); 
    const endpoint =
      activeChat.type === "community"
        ? `${API_BASE}/community/messages`
        : `${API_BASE}/team-chat/${activeChat.id}/messages`;

    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to load messages", err));
  }, [activeChat, open, view, token]);

  // ================= 3. WEBSOCKET CONNECTION =================
  useEffect(() => {
    if (!user || !open) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // console.log("WS Connected");
        subscribeToActiveChat(client);
      },
      onStompError: (frame) => console.error("Broker error", frame),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user, token, open]);

  // Re-subscribe when active chat changes
  useEffect(() => {
    if (stompClientRef.current?.connected) {
      subscribeToActiveChat(stompClientRef.current);
    }
  }, [activeChat, view]);

  const subscribeToActiveChat = (client) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (view !== "CHAT") return;

    const topic =
      activeChat.type === "community"
        ? "/topic/community"
        : `/topic/team/${activeChat.id}`;

    // console.log("Subscribing to:", topic);

    subscriptionRef.current = client.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);
      setMessages((prev) => [...prev, body]);
    });
  };

  // ================= 4. SCROLL HANDLING =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  // ================= 5. SEND MESSAGE =================
  const handleSend = () => {
    const content = input.trim();
    if (!content || !stompClientRef.current?.connected) return;

    let finalTag = null;
    const lowerInput = content.toLowerCase();
    TAGS.forEach((t) => {
      if (lowerInput.startsWith(t.label)) finalTag = t.key;
    });

    if (activeChat.type === "community") {
      const payload = {
        content,
        senderId: user.id,
        replyToId: replyTo?.id || null,
        tag: finalTag,
      };
      stompClientRef.current.publish({
        destination: "/app/community.send",
        body: JSON.stringify(payload),
      });
    } else {
      const payload = {
        teamId: activeChat.id,
        senderId: user.id,
        content,
        tag: finalTag,
      };
      stompClientRef.current.publish({
        destination: "/app/team.send",
        body: JSON.stringify(payload),
      });
    }

    setInput("");
    setReplyTo(null);
    setShowTagMenu(false);
  };

  // ================= 6. @TAG LOGIC =================
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

  // ================= 7. RENDER HELPERS =================
  const selectChat = (type, id, name) => {
    setActiveChat({ type, id, name });
    setView("CHAT");
  };

  if(!user) return null;

  return (
    <>
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <HiMiniXMark size={28} /> : <HiMiniChatBubbleLeftRight size={28} />}
        {!open && unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
            {unreadTotal}
          </span>
        )}
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* === HEADER === */}
          <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view === "CHAT" && (
                <button
                  onClick={() => setView("LIST")}
                  className="p-1 hover:bg-slate-800 rounded-full text-gray-400"
                >
                  <HiChevronLeft size={20} />
                </button>
              )}
              
              <div className={`p-2 rounded-full ${view === 'CHAT' && activeChat.type === 'team' ? 'bg-indigo-600' : 'bg-sky-600'}`}>
                {view === "LIST" ? (
                  <HiMiniChatBubbleLeftRight className="text-white" />
                ) : activeChat.type === "community" ? (
                  <HiMiniUsers className="text-white" />
                ) : (
                  <HiMiniUserGroup className="text-white" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-100">
                  {view === "LIST" ? "Messages" : activeChat.name}
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  {view === "LIST" ? "Select a conversation" : "Online"}
                </p>
              </div>
            </div>
          </div>

          {/* === BODY: LIST VIEW === */}
          {view === "LIST" && (
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              
              {/* Community Option */}
              <div
                onClick={() => selectChat("community", null, "Community Global")}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700 transition-all"
              >
                <div className="w-10 h-10 bg-sky-900/50 rounded-full flex items-center justify-center text-sky-400">
                  <HiMiniUsers size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-200">Community Global</h4>
                  <p className="text-xs text-gray-500">Public discussion for everyone</p>
                </div>
              </div>

              <div className="px-2 mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                My Teams
              </div>

              {myTeams.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-600 italic">
                  No teams found. 
                  <br/><span className="opacity-50 text-[10px]">Logged in as: {user.role}</span>
                </div>
              ) : (
                myTeams.map((team) => (
                  <div
                    key={team.teamId}
                    onClick={() => selectChat("team", team.teamId, team.teamName)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700 transition-all"
                  >
                    <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400">
                      <HiMiniUserGroup size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">{team.teamName}</h4>
                      <p className="text-xs text-gray-500">Project Team Group</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* === BODY: CHAT VIEW === */}
          {view === "CHAT" && (
            <>
              {/* MESSAGES AREA */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <HiMiniChatBubbleLeftRight size={40} className="mb-2" />
                    <span className="text-xs">No messages yet. Start chatting!</span>
                  </div>
                )}
                
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.id;
                  const tag = msg.tag || "NORMAL";
                  
                  return (
                    <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 relative shadow-md ${bubbleClasses(isMine, tag)}`}>
                        
                        <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
                            {msg.senderName || "User"} 
                            {msg.senderRole && <span className="ml-1 opacity-70 font-normal">({msg.senderRole})</span>}
                          </span>
                          <span className="text-[9px] opacity-60">{formatTime(msg.createdAt)}</span>
                        </div>

                        {msg.replyToContent && (
                          <div className="text-[10px] bg-black/20 p-1.5 rounded mb-1 border-l-2 border-white/50 italic opacity-80 truncate">
                            Replying to: {msg.replyToContent}
                          </div>
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        {tag !== "NORMAL" && (
                          <div className={`mt-2 text-[9px] px-2 py-0.5 rounded inline-block font-semibold tracking-wider ${tagBadgeStyle(tag)}`}>
                            {tag}
                          </div>
                        )}

                        {activeChat.type === 'community' && !isMine && (
                          <button 
                            onClick={() => setReplyTo(msg)}
                            className="absolute -right-6 top-2 text-gray-600 hover:text-sky-500"
                            title="Reply"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* REPLY PREVIEW BAR */}
              {replyTo && (
                <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <div className="text-gray-300">
                    Replying to <span className="text-sky-400 font-bold">{replyTo.senderName}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-300 font-bold">Cancel</button>
                </div>
              )}

              {/* INPUT AREA */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 relative">
                {showTagMenu && (
                  <div className="absolute bottom-16 left-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-48 overflow-hidden z-50">
                    {TAGS.filter(t => t.label.includes(tagQuery)).map(tag => (
                      <div 
                        key={tag.key} 
                        onClick={() => selectTag(tag.label)}
                        className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-xs text-gray-200 border-b border-slate-700/50 last:border-0"
                      >
                        <div className="font-bold text-sky-400">{tag.label}</div>
                        <div className="text-[10px] text-gray-500">{tag.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={activeChat.type === 'community' ? "Global message (@tag...)" : "Team message..."}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-gray-500 text-white p-2 rounded-xl transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transform rotate-90">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;