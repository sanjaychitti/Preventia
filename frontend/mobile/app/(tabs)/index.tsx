import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import api from '../../src/lib/api';

interface Appointment {
  id: string;
  doctorName: string;
  scheduledAt: string;
  status: string;
  dailyRoomUrl: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: '#CA8A04',
  CONFIRMED: '#2563EB',
  IN_PROGRESS: '#16A34A',
  COMPLETED: '#6B7280',
  CANCELLED: '#DC2626',
};

export default function AppointmentsTab() {
  const { data, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => (await api.get('/appointments/my')).data,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <FlatList
        data={data}
        keyExtractor={(a) => a.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/appointment/${item.id}` as never)}
          >
            <View style={styles.cardRow}>
              <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
              <Text style={[styles.badge, { color: STATUS_COLORS[item.status] ?? '#374151' }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.date}>{format(new Date(item.scheduledAt), 'PPP p')}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doctorName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  badge: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: '#6B7280', marginTop: 4 },
});
