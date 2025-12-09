// src/components/ChatWidget.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs"; // ✅ new style client
import { AuthContext } from "../context/AuthContext";

// ✅ Backend base URLs
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// WS URL direct env se, warna API_BASE se derive
const WS_ENDPOINT =
  import.meta.env.VITE_WS_URL ||
  API_BASE.replace(/\/api\/?$/, "") + "/ws-chat";

const TAGS = [
  { key: "ANNOUNCEMENT", label: "@announcement" },
  { key: "IMPORTANT", label: "@important" },
  { key: "ENQUIRY", label: "@enquiry" },
  { key: "PROBLEM", label: "@problem" },
];

const bubbleClasses = (isMine, tag) => {
  if (!tag || tag === "NORMAL") {
    return isMine
      ? "bg-sky-600 text-white rounded-br-sm"
      : "bg-slate-800/90 text-gray-100 border border-white/10 rounded-bl-sm";
  }

  switch (tag) {
    case "ANNOUNCEMENT":
      return isMine
        ? "bg-purple-600 text-white rounded-br-sm"
        : "bg-purple-900/90 text-purple-50 border border-purple-400/60 rounded-bl-sm";
    case "IMPORTANT":
      return isMine
        ? "bg-red-600 text-white rounded-br-sm"
        : "bg-red-900/90 text-red-50 border border-red-400/60 rounded-bl-sm";
    case "ENQUIRY":
      return isMine
        ? "bg-amber-500 text-black rounded-br-sm"
        : "bg-amber-900/90 text-amber-50 border border-amber-400/60 rounded-bl-sm";
    case "PROBLEM":
      return isMine
        ? "bg-orange-500 text-black rounded-br-sm"
        : "bg-orange-900/90 text-orange-50 border border-orange-400/60 rounded-bl-sm";
    default:
      return isMine
        ? "bg-sky-600 text-white rounded-br-sm"
        : "bg-slate-800/90 text-gray-100 border border-white/10 rounded-bl-sm";
  }
};

const tagBadgeStyle = (tag) => {
  switch (tag) {
    case "ANNOUNCEMENT":
      return "bg-purple-500/90 text-white";
    case "IMPORTANT":
      return "bg-red-500/90 text-white";
    case "ENQUIRY":
      return "bg-amber-400/95 text-black";
    case "PROBLEM":
      return "bg-orange-400/95 text-black";
    default:
      return "bg-slate-600/70 text-gray-100";
  }
};

const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${time} • ${date}`;
};

const ChatWidget = () => {
  const { user, token } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ---------- History load ----------
  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE}/community/messages`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setMessages(data))
      .catch((err) => console.error("Error loading messages", err));
  }, [user, token]);

  // ---------- Auto scroll ----------
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // ---------- WebSocket connect ----------
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      // ✅ Important: STOMP client new style
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      debug: () => {}, // spam band
      reconnectDelay: 5000, // auto reconnect
      onConnect: () => {
        // Messages
        client.subscribe("/topic/community", (message) => {
          const body = JSON.parse(message.body);
          setMessages((prev) => [...prev, body]);
          if (!open) setUnread((u) => u + 1);
        });

        // Notifications (future)
        client.subscribe("/topic/notifications", (message) => {
          console.log("Notification:", JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [user, token, open]);

  if (!user) return null;

  // ---------- Send message ----------
  const handleSend = () => {
    const content = input.trim();
    const client = stompClientRef.current;

    if (!content || !client || !client.connected) return;

    const payload = {
      content,
      replyToId: replyTo ? replyTo.id : null,
      senderId: user.id,
      tag: activeTag,
    };

    client.publish({
      destination: "/app/community.send",
      body: JSON.stringify(payload),
    });

    setInput("");
    setReplyTo(null);
    setActiveTag(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------- UI ----------
  return (
    <>
      {/* Floating icon */}
      <button
        onClick={() => {
          setOpen(true);
          setUnread(0);
        }}
        className="fixed bottom-5 right-5 bg-sky-600 hover:bg-sky-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl z-40"
      >
        💬
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
          <div className="flex justify-end px-4 pt-3">
            <button
              onClick={() => setOpen(false)}
              className="text-gray-200 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center pb-6 px-2 sm:px-4">
            <div className="w-[96vw] h-[80vh] bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="text-sky-400 font-semibold text-sm uppercase tracking-wide">
                      Community Help Desk
                    </div>
                    <span className="text-[10px] px-2 py-[2px] rounded-full bg-emerald-500/80 text-white font-semibold">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Project issues, announcements & Q/A in one place
                  </div>
                </div>

                <div className="text-right text-[11px] text-gray-400">
                  Logged in as{" "}
                  <span className="text-sky-300 font-semibold">
                    {user.name} ({user.role})
                  </span>
                  <div className="text-[10px] text-gray-500">
                    All messages are visible to registered users
                  </div>
                </div>
              </div>

              {/* Tag legend */}
              <div className="px-5 py-2 border-b border-white/5 bg-slate-900/70 flex flex-wrap gap-2 text-[10px] text-gray-300">
                <span className="uppercase tracking-wide text-[9px] text-gray-500 mr-1">
                  LEGEND:
                </span>
                <span className="px-2 py-[2px] rounded-full bg-purple-500/70 text-white">
                  @announcement
                </span>
                <span className="px-2 py-[2px] rounded-full bg-red-500/80 text-white">
                  @important
                </span>
                <span className="px-2 py-[2px] rounded-full bg-amber-400 text-black">
                  @enquiry
                </span>
                <span className="px-2 py-[2px] rounded-full bg-orange-400 text-black">
                  @problem
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[url('https://static.vecteezy.com/system/resources/previews/004/489/587/original/dark-gradient-blur-background-free-vector.jpg')] bg-cover bg-center">
                {messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  const tag = msg.tag || "NORMAL";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={
                          "relative max-w-[72%] rounded-2xl px-3 py-2 mb-1 cursor-pointer shadow-md " +
                          bubbleClasses(isMine, tag)
                        }
                        onClick={() => setReplyTo(msg)}
                      >
                        {tag !== "NORMAL" && (
                          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white/60 opacity-70" />
                        )}

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold opacity-95">
                              {msg.senderName} ({msg.senderRole})
                            </span>
                            {tag !== "NORMAL" && (
                              <span
                                className={
                                  "text-[10px] px-2 py-[2px] rounded-full font-semibold uppercase " +
                                  tagBadgeStyle(tag)
                                }
                              >
                                {tag.toLowerCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-75 whitespace-nowrap">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        {msg.replyToId && msg.replyToContent && (
                          <div className="mb-1 border-l-2 border-white/40 pl-2 text-[11px] italic bg-white/10 bg-opacity-20 rounded-md">
                            Replying to: {msg.replyToContent.slice(0, 90)}
                            {msg.replyToContent.length > 90 && "..."}
                          </div>
                        )}

                        <div className="whitespace-pre-wrap text-[13px] leading-snug">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply preview */}
              {replyTo && (
                <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-start justify-between text-xs text-gray-200">
                  <div className="pr-2">
                    <div className="font-semibold text-sky-300 mb-1">
                      Replying to {replyTo.senderName}
                    </div>
                    <div className="line-clamp-2 text-gray-200/90">
                      {replyTo.content}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-red-400 hover:text-red-500 ml-3"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input + tags */}
              <div className="px-4 py-2 bg-slate-900/95 border-t border-white/10">
                <div className="flex flex-wrap gap-2 mb-2">
                  {TAGS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() =>
                        setActiveTag((prev) => (prev === t.key ? null : t.key))
                      }
                      className={`text-[11px] px-3 py-1 rounded-full border transition ${
                        activeTag === t.key
                          ? "bg-sky-500 text-white border-sky-300 shadow"
                          : "bg-slate-800/80 text-gray-200 border-white/10 hover:bg-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <textarea
                    rows={1}
                    className="flex-1 bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none max-h-24"
                    placeholder="Type your message… (Enter = send, Shift+Enter = new line)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleSend}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg disabled:opacity-50"
                    disabled={!input.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
