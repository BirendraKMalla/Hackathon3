import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*, properties(title)")
        .or(`tenant_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setConversations(data || []);

      // Auto-create conversation if coming from search
      const propertyId = searchParams.get("property");
      const ownerId = searchParams.get("owner");
      if (propertyId && ownerId && data) {
        const existing = data.find((c) => c.property_id === propertyId);
        if (existing) setActiveConv(existing.id);
        else {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({ property_id: propertyId, tenant_id: user.id, owner_id: ownerId, is_paid: true })
            .select()
            .single();
          if (newConv) {
            setActiveConv(newConv.id);
            setConversations((p) => [newConv, ...p]);
          }
        }
      }
    };
    fetchConversations();
  }, [user, searchParams]);

  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConv)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${activeConv}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConv}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as any]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeConv) return;
    setLoading(true);
    await supabase.from("messages").insert({
      conversation_id: activeConv,
      sender_id: user.id,
      content: newMessage,
    });
    setNewMessage("");
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Conversation list */}
        <div className="w-64 flex-shrink-0 space-y-2 overflow-y-auto hidden md:block">
          <h2 className="font-semibold text-sm text-muted-foreground mb-2">Conversations</h2>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          ) : conversations.map((c) => (
            <Card
              key={c.id}
              className={`cursor-pointer transition-colors ${activeConv === c.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveConv(c.id)}
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{c.properties?.title || "Property"}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Messages area */}
        <Card className="flex-1 flex flex-col">
          {!activeConv ? (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-2" />
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                      msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} disabled={loading || !newMessage.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
