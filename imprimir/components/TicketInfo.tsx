//components/TicketInfo.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTicket } from '../hooks/useTicket';

export default function TicketInfo() {
  const { ticket, loading, error } = useTicket();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!ticket) return <Text>No se encontró el ticket</Text>;

  return (
    <View>
      <Text>{ticket.data}</Text>
    </View>
  );
}