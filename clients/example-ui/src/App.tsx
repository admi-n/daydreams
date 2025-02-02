import { useState, useEffect } from "react";
import { MessagesList } from "@/components/message-list";
import { useDaydreamsWs } from "@/hooks/use-daydreams";
import { useChatHistory } from "./hooks/use-chat-history";

interface MessageType {
    type: "user" | "assistant" | "system" | "error" | "other";
    message?: string;
    error?: string;
}

const bladerunnerQuotes = [
    "I've seen things you people wouldn't believe...",
    "All those moments will be lost in time, like tears in rain",
    "More human than human is our motto",
    "Have you ever retired a human by mistake?",
    "It's too bad she won't live, but then again who does?",
    "I want more life, father",
];

function App() {
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState<MessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const { messages, sendGoal } = useDaydreamsWs();

    const { histories, loading, error } = useChatHistory();

    console.log(histories);

    // Add quote cycling effect when loading
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % bladerunnerQuotes.length);
            }, 3000); // Change quote every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    // Update synchronization effect to handle loading state
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        // Only clear loading if we received an assistant or error message
        console.log(lastMessage.type);
        if (lastMessage.type !== "user") {
            setIsLoading(false);
        }
        setAllMessages((prev: MessageType[]) => {
            // Type check lastMessage to ensure it matches MessageType
            const typedMessage: MessageType = {
                type: lastMessage.type as MessageType["type"],
                message: lastMessage.message,
                error: lastMessage.error,
            };

            if (
                prev.length > 0 &&
                JSON.stringify(prev[prev.length - 1]) ===
                    JSON.stringify(typedMessage)
            ) {
                return prev;
            }
            return [...prev, typedMessage];
        });
    }, [messages]);

    const handleSubmit = () => {
        if (!message.trim()) return;

        // Set loading before sending message
        setIsLoading(true);

        setAllMessages((prev) => [...prev, { type: "user", message: message }]);
        sendGoal(message);
        setMessage("");
    };

    return (
        <div className="flex flex-col flex-1">
            {/* Zone conversation */}
            <div className="relative flex flex-col h-[calc(100vh-4rem)] rounded-lg border border-l-0">
                {/* Liste des messages */}
                <div className="flex-1 p-4 overflow-auto">
                    <MessagesList messages={allMessages} />
                    {isLoading && (
                        <div className="flex items-center justify-center p-4 text-muted-foreground italic">
                            {bladerunnerQuotes[quoteIndex]}
                        </div>
                    )}
                </div>

                {/* Input bar */}
                <div className="border-t bg-background flex items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-8 py-8 rounded-lg bg-background text-foreground placeholder:text-primary
                           focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 
                           focus:outline-none focus:ring-2 focus:ring-primary h-full w-64"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
