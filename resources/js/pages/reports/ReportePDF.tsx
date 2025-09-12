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
});

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
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Fecha</Text>
            <Text style={styles.tableCell}>Resultado</Text>
            <Text style={styles.tableCellLast}>Imágenes</Text>
          </View>
          {evaluaciones.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>-</Text>
              <Text style={styles.tableCell}>-</Text>
              <Text style={styles.tableCellLast}>Sin evaluaciones</Text>
            </View>
          )}
          {evaluaciones.map((ev, idx) => (
            <View style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={ev.id}>
              <Text style={styles.tableCell}>{ev.fecha}</Text>
              <Text style={styles.tableCell}>{ev.resultado}</Text>
              <View style={styles.tableCellLast}>
                {ev.imagenes && ev.imagenes.length > 0 ? (
                  <>
                    {ev.imagenes.map((img, i) => (
                      <Image key={i} src={img} style={styles.image} />
                    ))}
                  </>
                ) : (
                  <Text style={styles.noImage}>Sin imágenes</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
