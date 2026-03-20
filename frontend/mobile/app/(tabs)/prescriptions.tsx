import { useQuery } from '@tanstack/react-query';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import api from '../../src/lib/api';

interface Prescription {
  id: string;
  doctorName: string;
  diagnosis: string;
  fileName: string;
  createdAt: string;
}

export default function PrescriptionsTab() {
  const { data, isLoading, refetch } = useQuery<Prescription[]>({
    queryKey: ['prescriptions-all'],
    queryFn: async () => {
      // Placeholder: would paginate by recipient in real impl
      return [];
    },
  });

  const handleView = async (id: string) => {
    const res = await api.get<string>(`/prescriptions/${id}/view`);
    await Linking.openURL(res.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prescriptions</Text>
      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No prescriptions yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName}>{item.fileName}</Text>
                <Text style={styles.meta}>
                  Dr. {item.doctorName} · {format(new Date(item.createdAt), 'PP')}
                </Text>
                <Text style={styles.diagnosis} numberOfLines={2}>{item.diagnosis}</Text>
              </View>
              <Pressable onPress={() => handleView(item.id)}>
                <Text style={styles.viewBtn}>View PDF</Text>
              </Pressable>
            </View>
          </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  diagnosis: { fontSize: 13, color: '#374151', marginTop: 4 },
  viewBtn: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
