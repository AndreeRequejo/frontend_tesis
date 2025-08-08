export interface Paciente {
    id: number;
    nombre: string;
    edad: number;
    genero: string;
    ultimaEvaluacion: string;
}

export type PacienteFormData = Omit<Paciente, 'id'>;
