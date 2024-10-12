import React, { useState, useRef } from 'react';
import { Box, Button, Text, VStack, Input, Image, useColorModeValue } from '@chakra-ui/react';
import { MessageCircle, X, Send, Image as ImageIcon } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Initialize the AI model using Vite's environment variable syntax
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const chatBoxRef = useRef(null);

  const bgColor = useColorModeValue("gray.50", "gray.700");
  const userMsgBg = useColorModeValue("blue.500", "blue.200");
  const userMsgColor = useColorModeValue("white", "gray.800");
  const aiMsgBg = useColorModeValue("gray.200", "gray.600");
  const aiMsgColor = useColorModeValue("black", "white");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (input.trim() === '' && !selectedImage) return;

    const newMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiMessage;
      if (selectedImage) {
        const imageData = await readFileAsBase64(selectedImage);
        const result = await model.generateContent([
          input || "What's in this image?",
          {
            inlineData: {
              data: imageData,
              mimeType: selectedImage.type
            }
          }
        ]);
        aiMessage = { type: 'ai', content: result.response.text() };
      } else {
        const result = await model.generateContent(input);
        aiMessage = { type: 'ai', content: result.response.text() };
      }
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages(prev => [...prev, { type: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    }

    setIsLoading(false);
    setSelectedImage(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const renderMessage = (msg) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(msg.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(msg.content.slice(lastIndex, match.index));
      }
      const language = match[1] || 'javascript';
      const code = match[2].trim();
      parts.push(
        <SyntaxHighlighter 
          language={language} 
          style={tomorrow}
          customStyle={{
            margin: '10px 0',
            borderRadius: '4px',
            maxWidth: '100%',
            overflowX: 'auto'
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < msg.content.length) {
      parts.push(msg.content.slice(lastIndex));
    }

    return (
      <Box
        bg={msg.type === 'user' ? userMsgBg : aiMsgBg}
        color={msg.type === 'user' ? userMsgColor : aiMsgColor}
        px={3}
        py={2}
        borderRadius="lg"
        maxWidth="80%"
        overflowX="auto"
      >
        {parts.map((part, index) => 
          typeof part === 'string' ? (
            <Text key={index} whiteSpace="pre-wrap">{part}</Text>
          ) : (
            <Box key={index}>{part}</Box>
          )
        )}
      </Box>
    );
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex={1000}>
      {isOpen ? (
        <VStack
          bg={bgColor}
          boxShadow="md"
          borderRadius="md"
          p={4}
          spacing={4}
          align="stretch"
          width="400px"
          height="600px"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">Gemini AI Chat</Text>
            <Button size="sm" onClick={toggleChat} variant="ghost">
              <X size={20} />
            </Button>
          </Box>
          <Box 
            flex={1} 
            overflowY="auto" 
            bg={useColorModeValue("white", "gray.800")} 
            p={2} 
            borderRadius="md"
            ref={chatBoxRef}
          >
            {messages.map((msg, index) => (
              <Box key={index} mb={4} textAlign={msg.type === 'user' ? 'right' : 'left'}>
                {renderMessage(msg)}
              </Box>
            ))}
            {selectedImage && (
              <Box textAlign="right" mb={2}>
                <Image src={URL.createObjectURL(selectedImage)} maxHeight="100px" display="inline-block" borderRadius="md" />
              </Box>
            )}
            {isLoading && <Text>AI is thinking...</Text>}
          </Box>
          <Box display="flex">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current.click()} ml={2}>
              <ImageIcon size={20} />
            </Button>
            <Button onClick={handleSend} ml={2}>
              <Send size={20} />
            </Button>
          </Box>
        </VStack>
      ) : (
        <Button
          onClick={toggleChat}
          borderRadius="full"
          width="60px"
          height="60px"
          bg="blue.500"
          color="white"
          _hover={{ bg: 'blue.600' }}
        >
          <MessageCircle size={24} />
        </Button>
      )}
    </Box>
  );
};

export default ChatBot;