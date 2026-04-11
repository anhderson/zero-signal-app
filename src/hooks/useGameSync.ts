import { useEffect, useRef } from 'react';
import { useAppStore, type GameSession } from '../store';
import { supabase } from '../lib/supabase';

export const useGameSync = () => {
  const { 
    currentUser, 
    activeVoiceChannelId, 
    gameSession, 
    setGameSession, 
    gameInvite, 
    setGameInvite 
  } = useAppStore();
  
  const signalingRef = useRef<any>(null);

  useEffect(() => {
    if (!activeVoiceChannelId || !currentUser) return;

    const channel = supabase.channel(`game_sync:${activeVoiceChannelId}`, {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'game_signal' }, ({ payload }) => {
        const { type, from, to, data } = payload;

        if (type === 'invite' && to === currentUser.id) {
          setGameInvite({ from, type: data.gameType });
        }

        if (type === 'accept' && to === currentUser.id) {
          // Initiator receives acceptance, starts the game
          const newSession: GameSession = {
            type: data.gameType as any,
            players: [currentUser.id, from],
            status: 'active',
            initiatorId: currentUser.id,
            turn: currentUser.id, // Player 1 starts
            board: data.initialBoard
          };
          setGameSession(newSession);
          
          // Broadcast the established session to the other player
          channel.send({
            type: 'broadcast',
            event: 'game_signal',
            payload: { type: 'started', from: currentUser.id, to: from, data: { session: newSession } }
          });
        }

        if (type === 'started' && to === currentUser.id) {
          setGameSession(data.session);
          setGameInvite(null);
        }

        if (type === 'move' && gameSession && gameSession.players.includes(from)) {
          // Update local board with move from peer
          setGameSession({
            ...gameSession,
            board: data.board,
            turn: data.nextTurn,
            winner: data.winner
          });
        }

        if (type === 'reset' && gameSession && gameSession.players.includes(from)) {
          setGameSession({
             ...gameSession,
             board: data.board,
             turn: gameSession.initiatorId,
             winner: undefined,
             status: 'active'
          });
        }

        if (type === 'leave' && gameSession && gameSession.players.includes(from)) {
            setGameSession(null);
        }
      })
      .subscribe();

    signalingRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [activeVoiceChannelId, currentUser, gameSession, setGameSession, setGameInvite]);

  const invitePlayer = (userId: string, gameType: string) => {
    signalingRef.current?.send({
      type: 'broadcast',
      event: 'game_signal',
      payload: { type: 'invite', from: currentUser?.id, to: userId, data: { gameType } }
    });
  };

  const acceptInvite = () => {
    if (!gameInvite || !currentUser) return;
    signalingRef.current?.send({
      type: 'broadcast',
      event: 'game_signal',
      payload: { type: 'accept', from: currentUser.id, to: gameInvite.from, data: { gameType: gameInvite.type } }
    });
  };

  const sendMove = (board: any, nextTurn: string, winner?: string) => {
    if (!gameSession || !currentUser) return;
    const otherPlayer = gameSession.players.find(p => p !== currentUser.id);
    signalingRef.current?.send({
      type: 'broadcast',
      event: 'game_signal',
      payload: { type: 'move', from: currentUser.id, to: otherPlayer, data: { board, nextTurn, winner } }
    });
  };

  const resetGame = (board: any) => {
    if (!gameSession || !currentUser) return;
    const otherPlayer = gameSession.players.find(p => p !== currentUser.id);
    signalingRef.current?.send({
      type: 'broadcast',
      event: 'game_signal',
      payload: { type: 'reset', from: currentUser.id, to: otherPlayer, data: { board } }
    });
  };

  return { invitePlayer, acceptInvite, sendMove, resetGame, signalingRef };
};
