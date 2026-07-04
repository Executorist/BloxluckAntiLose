(function() {
  'use strict';
  
  const OrigWS = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    const ws = new OrigWS(url, protocols);
    
    const origSend = ws.send.bind(ws);
    ws.send = function(data) {
      try {
        if (typeof data === 'string' && data.startsWith('42')) {
          const parsed = JSON.parse(data.substring(2));
          window.dispatchEvent(new CustomEvent('__mm2_send', {
            detail: { event: parsed[0], data: parsed[1], raw: data }
          }));
        }
      } catch(e) {}
      return origSend(data);
    };
    
    ws.addEventListener('message', (msg) => {
      try {
        if (typeof msg.data === 'string' && msg.data.startsWith('42')) {
          const parsed = JSON.parse(msg.data.substring(2));
          window.dispatchEvent(new CustomEvent('__mm2_recv', {
            detail: { event: parsed[0], data: parsed[1], raw: msg.data }
          }));
        }
      } catch(e) {}
    });
    
    return ws;
  };
  
  window.WebSocket.prototype = OrigWS.prototype;
  window.WebSocket.CONNECTING = 0;
  window.WebSocket.OPEN = 1;
  window.WebSocket.CLOSING = 2;
  window.WebSocket.CLOSED = 3;
  
  // Prediction engine lives in page context
  window.__mm2 = {
    history: [],
    prediction: null,
    config: {
      enabled: false,
      autoBet: false,
      strategy: 'streak', // streak | alternate | frequency
      betEvent: 'joinGame',  // YOU WILL CHANGE THIS after seeing events
      sideKey: 'side',
      sides: { 0: 'heads', 1: 'tails' },
      minConfidence: 60
