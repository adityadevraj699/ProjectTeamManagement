// src/components/ChatWidget.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "../context/AuthContext";
import {
  HiMiniChatBubbleLeftRight,
  HiMiniXMark,
} from "react-icons/hi2";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const WS_ENDPOINT =
  import.meta.env.VITE_WS_URL ||
  API_BASE.replace(/\/api\/?$/, "") + "/ws-chat";

const TAGS = [
  {
    key: "ANNOUNCEMENT",
    label: "@announcement",
    description: "Global notice for everyone",
  },
  {
    key: "IMPORTANT",
    label: "@important",
    description: "Critical info / deadlines",
  },
  {
    key: "ENQUIRY",
    label: "@enquiry",
    description: "Questions or clarifications",
  },
  {
    key: "PROBLEM",
    label: "@problem",
    description: "Issues, bugs or blockers",
  },
];

const bubbleClasses = (isMine, tag) => {
  if (!tag || tag === "NORMAL") {
    return isMine
      ? "bg-sky-600 text-white rounded-br-sm"
      : "bg-slate-800 text-gray-100 border border-white/10 rounded-bl-sm";
  }

  switch (tag) {
    case "ANNOUNCEMENT":
      return isMine
        ? "bg-purple-600 text-white rounded-br-sm"
        : "bg-purple-900 text-purple-50 border border-purple-400/60 rounded-bl-sm";
    case "IMPORTANT":
      return isMine
        ? "bg-red-600 text-white rounded-br-sm"
        : "bg-red-900 text-red-50 border border-red-400/60 rounded-bl-sm";
    case "ENQUIRY":
      return isMine
        ? "bg-amber-500 text-black rounded-br-sm"
        : "bg-amber-900 text-amber-50 border border-amber-400/60 rounded-bl-sm";
    case "PROBLEM":
      return isMine
        ? "bg-orange-500 text-black rounded-br-sm"
        : "bg-orange-900 text-orange-50 border border-orange-400/60 rounded-bl-sm";
    default:
      return isMine
        ? "bg-sky-600 text-white rounded-br-sm"
        : "bg-slate-800 text-gray-100 border border-white/10 rounded-bl-sm";
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

  // @ annotation state
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

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

  // ---------- Auto scroll to bottom on new messages ----------
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  // ---------- When open, ensure at bottom ----------
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [open]);

  // ---------- WebSocket connect ----------
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/community", (message) => {
          const body = JSON.parse(message.body);
          setMessages((prev) => [...prev, body]);
          if (!open) setUnread((u) => u + 1);
        });

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
    setShowTagMenu(false);
    setTagQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------- @ annotation detection ----------
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const atIndex = value.lastIndexOf("@");

    if (atIndex === -1) {
      setShowTagMenu(false);
      setTagQuery("");
      return;
    }

    const after = value.slice(atIndex + 1);

    if (/[\s]/.test(after)) {
      setShowTagMenu(false);
      setTagQuery("");
      return;
    }

    setShowTagMenu(true);
    setTagQuery(after.toLowerCase());
  };

  const filteredTags = TAGS.filter((t) => {
    if (!tagQuery) return true;
    return (
      t.label.toLowerCase().includes(tagQuery) ||
      t.key.toLowerCase().includes(tagQuery)
    );
  });

  const handleSelectTagFromMenu = (tagObj) => {
    setActiveTag(tagObj.key);

    setInput((prev) => {
      const atIndex = prev.lastIndexOf("@");
      if (atIndex === -1) return prev;
      const before = prev.slice(0, atIndex);
      return `${before}${tagObj.label} `;
    });

    setShowTagMenu(false);
    setTagQuery("");
  };

  const handleToggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) {
      setUnread(0);
    } else {
      setReplyTo(null);
      setShowTagMenu(false);
      setTagQuery("");
    }
  };

  const handleClosePanel = () => {
    setOpen(false);
    setReplyTo(null);
    setShowTagMenu(false);
    setTagQuery("");
  };

  // ---------- UI ----------
  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={handleToggleOpen}
        className="fixed bottom-5 right-5 bg-sky-600 hover:bg-sky-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-40 transition-transform hover:scale-105"
      >
        {open ? (
          <HiMiniXMark className="w-6 h-6" />
        ) : (
          <HiMiniChatBubbleLeftRight className="w-6 h-6" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-start sm:justify-end">
          {/* Overlay (mobile tap to close) */}
          <div
            className="absolute inset-0 bg-black/40 sm:bg-black/20"
            onClick={handleClosePanel}
          />

          {/* Card wrapper (responsive) */}
          <div className="relative w-full h-full sm:w-[50vw] sm:h-[100vh] max-w-full sm:max-w-none px-0 pb-0 sm:px-0 sm:pb-0">
            <div
              className="h-full w-full bg-slate-950 border-none rounded-none sm:border-l sm:border-slate-800 sm:rounded-none shadow-xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white text-lg">
                    <HiMiniChatBubbleLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-white">
                        Community Help Assistant
                      </h2>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Ask doubts, report issues or share quick updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[11px] text-gray-100 font-medium">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {user.role}
                    </span>
                  </div>
                  {/* Close icon inside panel header */}
                  <button
                    onClick={handleClosePanel}
                    className="p-1 rounded-full hover:bg-slate-800 text-gray-300 hover:text-white transition"
                  >
                    <HiMiniXMark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-950 scrollbar-none">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500 text-center px-6">
                    Start the conversation by typing a message below. Use{" "}
                    <span className="font-semibold mx-1">@</span>
                    to add tags like <span className="font-semibold">@announcement</span>,{" "}
                    <span className="font-semibold">@important</span>,{" "}
                    <span className="font-semibold">@enquiry</span> or{" "}
                    <span className="font-semibold">@problem</span>.
                  </div>
                )}

                {messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  const tag = msg.tag || "NORMAL";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={
                          "relative max-w-[78%] rounded-2xl px-3 py-2 mb-1 cursor-pointer shadow-sm " +
                          bubbleClasses(isMine, tag)
                        }
                        onClick={() => setReplyTo(msg)}
                      >
                        {tag !== "NORMAL" && (
                          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white/70 opacity-80" />
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
                          <span className="text-[9px] opacity-75 whitespace-nowrap">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        {msg.replyToId && msg.replyToContent && (
                          <div className="mb-1 border-l-2 border-white/40 pl-2 text-[11px] italic bg-white/10 rounded-md line-clamp-2">
                            Replying to: {msg.replyToContent}
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
                <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-start justify-between text-[11px] text-gray-200">
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
                    className="text-red-400 hover:text-red-500 ml-3 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input + @ tag menu */}
              <div className="px-3 py-2 bg-slate-950 border-t border-slate-800">
                <div className="relative flex items-end gap-2">
                  <textarea
                    rows={1}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none max-h-28 overflow-y-auto scrollbar-none"
                    placeholder="Type your message… Use @ for tags (Enter = send, Shift+Enter = new line)"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />

                  {/* @ annotation dropdown */}
                  {showTagMenu && filteredTags.length > 0 && (
                    <div className="absolute bottom-11 left-0 mb-1 w-full max-w-[260px] bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden text-xs z-10">
                      <div className="px-3 py-1 border-b border-slate-800 text-[10px] text-gray-400 bg-slate-950">
                        Select a tag for this message
                      </div>
                      <div className="max-h-40 overflow-y-auto scrollbar-none">
                        {filteredTags.map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => handleSelectTagFromMenu(t)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex flex-col gap-0.5"
                          >
                            <span className="font-medium text-gray-100">
                              {t.label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {t.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSend}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-50"
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
