import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Fab
} from '@mui/material';
import { Send, SmartToy, Close, Chat } from '@mui/icons-material';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setMessages(prev => [...prev, { text: input, isAI: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'HTTP-Referer': window.location.href,
          'X-Title': 'Medical Store Assistant'
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-distill-llama-70b:free",
          messages: [
            {
              role: "system",
              content: "You are a helpful medical store assistant. You help with inventory management, medicine information, and pharmacy operations. Keep responses professional and concise."
            },
            {
              role: "user",
              content: input
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.choices?.[0]?.message?.content) {
        setMessages(prev => [...prev, { 
          text: data.choices[0].message.content, 
          isAI: true 
        }]);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        isAI: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Fab
        color="primary"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000
        }}
      >
        <Chat />
      </Fab>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy />
          <Typography variant="h6">Medical Assistant</Typography>
        </Box>
        <IconButton 
          size="small" 
          onClick={() => setIsOpen(false)}
          sx={{ color: 'white' }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Messages */}
      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: 'background.paper',
          p: 2
        }}
      >
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            sx={{
              flexDirection: 'column',
              alignItems: msg.isAI ? 'flex-start' : 'flex-end',
              gap: 0.5,
              py: 0.5
            }}
          >
            <Box
              sx={{
                maxWidth: '80%',
                bgcolor: msg.isAI ? 'grey.100' : 'primary.main',
                color: msg.isAI ? 'text.primary' : 'white',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Typography variant="body2">
                {msg.text}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      {/* Input */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : <Send />}
              </IconButton>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default AIChat; 