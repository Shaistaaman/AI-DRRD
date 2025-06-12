import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Services
import { generateResponse, speakResponse, startVoiceRecognition } from '../services/aiService';

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your AI assistant. I can help you analyze your portfolio's climate risk exposure and provide recommendations. How can I assist you today?", 
      sender: 'ai', 
      timestamp: new Date().toISOString() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!input.trim() && !e.currentTarget.dataset.voice) return;
    
    const userMessage = e.currentTarget.dataset.voice || input;
    
    // Add user message to chat
    const newUserMessage = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get AI response
      const response = await generateResponse(userMessage);
      
      // Add AI response to chat
      const newAiMessage = {
        id: messages.length + 2,
        text: response.text,
        sender: 'ai',
        timestamp: response.timestamp
      };
      
      setMessages(prev => [...prev, newAiMessage]);
      
      // Speak response if voice is enabled
      if (voiceEnabled) {
        speakResponse(response.text);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (listening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setListening(false);
      return;
    }
    
    setListening(true);
    
    recognitionRef.current = startVoiceRecognition(
      // On result
      (transcript) => {
        setListening(false);
        handleSubmit({ preventDefault: () => {}, currentTarget: { dataset: { voice: transcript } } });
      },
      // On error
      (error) => {
        console.error('Speech recognition error:', error);
        setListening(false);
      }
    );
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    
    // Stop any ongoing speech
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating button to open assistant */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={toggleDrawer}
        component={motion.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <SmartToyIcon />
      </Fab>
      
      {/* Assistant drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">AI Assistant</Typography>
          </Box>
          <Box>
            <Tooltip title={voiceEnabled ? "Mute voice responses" : "Enable voice responses"}>
              <IconButton onClick={toggleVoice} color={voiceEnabled ? "primary" : "default"}>
                {voiceEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Messages */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 128px)'
        }}>
          <List>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatTime(message.timestamp)}
                    </Typography>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <ListItem
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress size={20} />
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        
        {/* Input */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          bgcolor: 'background.paper'
        }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Ask me about your portfolio risks..."
                variant="outlined"
                size="small"
                value={input}
                onChange={handleInputChange}
                disabled={loading || listening}
                sx={{ mr: 1 }}
              />
              <Tooltip title="Voice input">
                <IconButton 
                  color={listening ? "error" : "default"}
                  onClick={handleVoiceInput}
                  disabled={loading}
                  component={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MicIcon />
                </IconButton>
              </Tooltip>
              <IconButton 
                color="primary" 
                type="submit"
                disabled={!input.trim() || loading || listening}
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </form>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;