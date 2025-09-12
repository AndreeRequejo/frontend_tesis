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
  page: { padding: 24, fontSize: 12 },
  section: { marginBottom: 16 },
  title: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 6, fontWeight: 'bold' },
  table: { width: 'auto', marginBottom: 12 },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, borderBottom: '1px solid #ccc', padding: 4 },
  image: { width: 60, height: 60, marginRight: 4, borderRadius: 6, border: '1px solid #ccc' },
});

export const ReportePDF: React.FC<ReportePDFProps> = ({ paciente, evaluaciones }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Reporte del Paciente</Text>
        <Text><Text style={styles.subtitle}>Nombre:</Text> {paciente.nombre} {paciente.apellido}</Text>
        <Text><Text style={styles.subtitle}>Edad:</Text> {paciente.edad}</Text>
        <Text><Text style={styles.subtitle}>Género:</Text> {paciente.genero}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Evaluaciones</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Fecha</Text>
            <Text style={styles.tableCell}>Resultado</Text>
            <Text style={styles.tableCell}>Imágenes</Text>
          </View>
          {evaluaciones.map(ev => (
            <View style={styles.tableRow} key={ev.id}>
              <Text style={styles.tableCell}>{ev.fecha}</Text>
              <Text style={styles.tableCell}>{ev.resultado}</Text>
              <View style={styles.tableCell}>
                {ev.imagenes && ev.imagenes.length > 0 ? (
                  <>
                    {ev.imagenes.map((img, idx) => (
                      <Image key={idx} src={img} style={styles.image} />
                    ))}
                  </>
                ) : (
                  <Text style={{ color: '#888' }}>Sin imágenes</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
