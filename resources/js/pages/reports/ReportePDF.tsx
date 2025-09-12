import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import React from 'react';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  genero: string;
}

interface Evaluacion {
  id: number;
  fecha: string;
  resultado: string;
  comentario?: string;
  imagenes?: string[];
}

interface ReportePDFProps {
  paciente: Paciente;
  evaluaciones: Evaluacion[];
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 12,
    backgroundColor: '#f6f8fa',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1pt solid #e5e7eb',
    boxShadow: '0 2px 8px #0001',
    padding: 18,
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
    marginRight: 4,
  },
  info: {
    color: '#374151',
    marginBottom: 2,
    fontWeight: 'medium',
  },
  table: {
    width: '100%',
    borderRadius: 8,
    border: '1pt solid #e5e7eb',
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    borderRight: '1pt solid #e5e7eb',
    borderBottom: '1pt solid #e5e7eb',
    padding: 6,
    fontSize: 11,
    color: '#374151',
  },
  tableCellLast: {
    flex: 1,
    borderBottom: '1pt solid #e5e7eb',
    padding: 6,
    fontSize: 11,
    color: '#374151',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 4,
    borderRadius: 6,
    border: '1pt solid #e5e7eb',
  },
  noImage: {
    color: '#888',
    fontSize: 10,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  badgeLeve: {
    backgroundColor: '#4caf50',
  },
  badgeModerada: {
    backgroundColor: '#ff9800',
  },
  badgeSevera: {
    backgroundColor: '#d32f2f',
  },
});

const getBadgeStyle = (resultado: string) => {
  if (resultado.toLowerCase().includes('leve')) return [styles.badge, styles.badgeLeve];
  if (resultado.toLowerCase().includes('moderado')) return [styles.badge, styles.badgeModerada];
  if (resultado.toLowerCase().includes('severo')) return [styles.badge, styles.badgeSevera];
  return styles.badge;
};

export const ReportePDF: React.FC<ReportePDFProps> = ({ paciente, evaluaciones }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Reporte del Paciente</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Nombre: <Text style={styles.info}>{paciente.nombre} {paciente.apellido}</Text></Text>
          <Text style={styles.label}>Edad: <Text style={styles.info}>{paciente.edad} años</Text></Text>
          <Text style={styles.label}>Género: <Text style={styles.info}>{paciente.genero}</Text></Text>
        </View>
        <Text style={styles.subtitle}>Evaluaciones</Text>
        {evaluaciones.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.info}>Sin evaluaciones</Text>
          </View>
        )}
        {evaluaciones.map((ev) => (
          <View style={styles.card} key={ev.id}>
            {/* Primera fila: fecha y severidad tipo badge */}
            <View style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'center' }}>
              <Text style={styles.label}>Fecha: <Text style={styles.info}>{ev.fecha}</Text></Text>
              <View style={{ flex: 1 }} />
              <Text style={getBadgeStyle(ev.resultado)}>
                {ev.resultado}
              </Text>
            </View>
            {/* Segunda fila: comentario si existe */}
            {ev.comentario && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.label}>Comentario: <Text style={styles.info}>{ev.comentario}</Text></Text>
              </View>
            )}
            {/* Fila de imágenes */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {ev.imagenes && ev.imagenes.length > 0 ? (
                ev.imagenes.map((img, i) => (
                  <Image key={i} src={img} style={styles.image} />
                ))
              ) : (
                <Text style={styles.noImage}>Sin imágenes</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
