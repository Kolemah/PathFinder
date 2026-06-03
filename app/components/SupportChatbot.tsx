"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Mail, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

const quickQuestions = [
  "How does payment clearance work?",
  "How do I withdraw?",
  "Why is KYC needed?",
  "How do invoices work?",
];

function botReply(message: string) {
  const text = message.toLowerCase();

  if (text.includes("withdraw") || text.includes("payout")) {
    return "You can request payout from your Wallet when your available naira balance is at least NGN 10,000 and your KYC is approved.";
  }

  if (text.includes("kyc") || text.includes("verify")) {
    return "KYC helps PathPayX protect sellers and buyers. You can use the app before KYC, but payout is locked until verification is approved.";
  }

  if (text.includes("invoice")) {
    return "Create an invoice from the Invoices page, share the payment link with your client, and track the payment status from your dashboard.";
  }

  if (
    text.includes("clearance") ||
    text.includes("pending") ||
    text.includes("3 days") ||
    text.includes("release")
  ) {
    return "Client payments stay pending for 3 days. After that, PathPayX removes the 10% platform fee, converts the payment to naira using the current rate, and adds it to your available balance.";
  }

  if (text.includes("restricted") || text.includes("terminated")) {
    return "Restricted accounts can log in but cannot create invoices or request payouts. Terminated accounts are permanently suspended. Please contact help@pathpayx.com for review.";
  }

  return "I can help with invoices, payments, KYC, wallet balance, payouts, and account status. For human support, email help@pathpayx.com.";
}

export default function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Hi, I am PathPayX support. Ask me about invoices, payments, KYC, wallet, or payouts.",
    },
  ]);

  const nextId = useMemo(
    () => messages.reduce((largest, message) => Math.max(largest, message.id), 0) + 1,
    [messages]
  );

  function sendMessage(messageText: string) {
    const trimmed = messageText.trim();

    if (!trimmed) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nextId,
        from: "user",
        text: trimmed,
      },
      {
        id: nextId + 1,
        from: "bot",
        text: botReply(trimmed),
      },
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="support-chatbot">
      {open ? (
        <section className="support-chatbot-panel" aria-label="PathPayX support chat">
          <div className="support-chatbot-header">
            <div>
              <span>
                <Bot size={18} />
              </span>
              <strong>PathPayX Help</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div className="support-chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`support-chatbot-message ${
                  message.from === "user" ? "support-chatbot-message-user" : ""
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="support-chatbot-quick">
            {quickQuestions.map((question) => (
              <button key={question} type="button" onClick={() => sendMessage(question)}>
                {question}
              </button>
            ))}
          </div>

          <a className="support-chatbot-email" href="mailto:help@pathpayx.com">
            <Mail size={16} /> Email help@pathpayx.com
          </a>

          <form className="support-chatbot-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question..."
            />
            <button type="submit" aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="support-chatbot-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open support chat"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
