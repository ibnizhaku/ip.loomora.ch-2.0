import { useState, useRef, useEffect } from "react";
import { Send, Smile, AtSign, Reply, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeamMember {
  initials: string;
  name: string;
  role: string;
}

interface Reaction {
  emoji: string;
  users: string[];
}

interface ChatMessage {
  id: string;
  user: TeamMember;
  content: string;
  timestamp: string;
  reactions: Reaction[];
  replyTo?: {
    id: string;
    user: string;
    preview: string;
  };
}

interface ProjectChatProps {
  team: TeamMember[];
}

const availableEmojis = ["👍", "❤️", "🎉", "🚀", "👀", "💡", "✅", "🔥"];

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    user: { initials: "MK", name: "Michael Keller", role: "Project Manager" },
    content: "Guten Morgen Team! Wie ist der Stand beim Checkout-Prozess?",
    timestamp: "09:15",
    reactions: [{ emoji: "👍", users: ["Anna Schmidt", "Thomas Müller"] }],
  },
  {
    id: "2",
    user: { initials: "AS", name: "Anna Schmidt", role: "Lead Developer" },
    content: "Bin gerade dabei die Validierung fertigzustellen. Sollte heute Nachmittag fertig sein. @Thomas Müller kannst du schon mal die Payment-Schnittstelle vorbereiten?",
    timestamp: "09:22",
    reactions: [{ emoji: "🚀", users: ["Michael Keller"] }],
  },
  {
    id: "3",
    user: { initials: "TM", name: "Thomas Müller", role: "Backend Developer" },
    content: "Ja klar, bin schon dran! Die Stripe-Integration läuft bereits im Testmodus.",
    timestamp: "09:28",
    reactions: [{ emoji: "✅", users: ["Anna Schmidt"] }, { emoji: "🎉", users: ["Lisa Weber"] }],
    replyTo: {
      id: "2",
      user: "Anna Schmidt",
      preview: "...kannst du schon mal die Payment-Schnittstelle vorbereiten?",
    },
  },
  {
    id: "4",
    user: { initials: "LW", name: "Lisa Weber", role: "UI Designer" },
    content: "Ich habe die finalen Designs für die Erfolgsseite hochgeladen. Bitte schaut mal drüber! 🎨",
    timestamp: "10:05",
    reactions: [{ emoji: "❤️", users: ["Anna Schmidt", "Michael Keller", "Thomas Müller"] }],
  },
  {
    id: "5",
    user: { initials: "MK", name: "Michael Keller", role: "Project Manager" },
    content: "Super Arbeit Team! @Lisa Weber die Designs sehen fantastisch aus. Kunde wird begeistert sein! 🙌",
    timestamp: "10:15",
    reactions: [],
  },
];

export function ProjectChat({ team }: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (member: TeamMember) => {
    const lastAtIndex = newMessage.lastIndexOf("@");
    const beforeAt = newMessage.slice(0, lastAtIndex);
    setNewMessage(`${beforeAt}@${member.name} `);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: { initials: "DU", name: "Du", role: "Aktueller Benutzer" },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            user: replyingTo.user.name,
            preview: replyingTo.content.slice(0, 50) + (replyingTo.content.length > 50 ? "..." : ""),
          }
        : undefined,
    };

    setMessages([...messages, message]);
    setNewMessage("");
    setReplyingTo(null);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes("Du")) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions
                .map((r) =>
                  r.emoji === emoji
                    ? { ...r, users: r.users.filter((u) => u !== "Du") }
                    : r
                )
                .filter((r) => r.users.length > 0),
            };
          } else {
            // Add to existing reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji ? { ...r, users: [...r.users, "Du"] } : r
              ),
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: ["Du"] }],
          };
        }
      })
    );
  };

  const renderMessageContent = (content: string) => {
    // Highlight @mentions
    const parts = content.split(/(@\w+(?:\s\w+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const memberName = part.slice(1);
        const isMember = team.some((m) => m.name === memberName);
        return (
          <span
            key={index}
            className={cn(
              "font-medium px-1 rounded",
              isMember ? "bg-primary/10 text-primary" : ""
            )}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-border bg-card">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="group flex gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {message.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.user.name}</span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>

                {/* Reply Reference */}
                {message.replyTo && (
                  <div className="flex items-center gap-2 mt-1 mb-2 pl-3 border-l-2 border-primary/30 text-xs text-muted-foreground">
                    <Reply className="h-3 w-3" />
                    <span className="font-medium">{message.replyTo.user}:</span>
                    <span className="truncate">{message.replyTo.preview}</span>
                  </div>
                )}

                {/* Message Content */}
                <p className="text-sm mt-1 leading-relaxed">
                  {renderMessageContent(message.content)}
                </p>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => addReaction(message.id, reaction.emoji)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all hover:scale-105",
                          reaction.users.includes("Du")
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted/50 border-border hover:border-primary/30"
                        )}
                        title={reaction.users.join(", ")}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="font-medium">{reaction.users.length}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Smile className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="flex gap-1">
                        {availableEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className="p-1.5 hover:bg-muted rounded transition-all hover:scale-110"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setReplyingTo(message)}
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>Kopieren</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Löschen</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-2">
          <Reply className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground">Antwort auf </span>
            <span className="text-xs font-medium">{replyingTo.user.name}</span>
            <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border relative">
        {/* Mention Dropdown */}
        {showMentions && filteredTeam.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-lg border border-border bg-popover p-2 shadow-lg">
            <p className="text-xs text-muted-foreground mb-2 px-2">Team erwähnen</p>
            {filteredTeam.map((member) => (
              <button
                key={member.initials}
                onClick={() => insertMention(member)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Nachricht schreiben... (@ zum Erwähnen)"
              className="min-h-[44px] max-h-[120px] resize-none pr-20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="flex gap-1">
                    {availableEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewMessage(newMessage + emoji)}
                        className="p-1.5 hover:bg-muted rounded transition-all hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowMentions(!showMentions)}
              >
                <AtSign className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <Button onClick={sendMessage} disabled={!newMessage.trim()} className="h-[44px]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
