<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte del Paciente - {{ $paciente['nombre'] }} {{ $paciente['apellido'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #374151;
            background-color: #f6f8fa;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 24px;
        }
        
        .card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 18px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 16px;
            margin-top: 24px;
        }
        
        .description {
            color: #6b7280;
            font-size: 14px;
        }
        
        .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 24px;
            margin-bottom: 24px;
        }
        
        .info-item {
            margin-bottom: 0;
            display: flex;
            flex-direction: column;
        }
        
        .label {
            font-weight: bold;
            color: #374151;
            display: block;
            margin-bottom: 4px;
        }
        
        .value {
            color: #374151;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 16px;
        }
        
        .table th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .badge-leve {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .badge-moderado {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .badge-severo {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .badge-ausente {
            background-color: #f3f4f6;
            color: #374151;
        }
        
        .images-container {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .image-thumbnail {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        
        .no-data {
            color: #9ca3af;
            font-style: italic;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 11px;
        }

        .date-generated {
            margin-top: 8px;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1 class="title">Reporte del Paciente</h1>
                <p class="description">Visualiza los datos y evaluaciones del paciente</p>
            </div>
            
            <h2 class="subtitle">Datos del Paciente</h2>
            <div class="patient-info">
                <div class="info-item">
                    <span class="label">Nombre:</span>
                    <span class="value">{{ $paciente['nombre'] }} {{ $paciente['apellido'] }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Edad:</span>
                    <span class="value">{{ $paciente['edad'] }} años</span>
                </div>
                <div class="info-item">
                    <span class="label">Género:</span>
                    <span class="value">{{ $paciente['genero'] }}</span>
                </div>
                <div class="info-item">
                    <span class="label">DNI:</span>
                    <span class="value">{{ $paciente['dni'] }}</span>
                </div>
                @if(isset($paciente['telefono']) && $paciente['telefono'])
                <div class="info-item">
                    <span class="label">Teléfono:</span>
                    <span class="value">{{ $paciente['telefono'] }}</span>
                </div>
                <div class="info-item">
                    <!-- Espacio vacío para mantener la estructura del grid -->
                </div>
                @endif
            </div>
            
            <h2 class="subtitle">Evaluaciones</h2>
            @if(count($evaluaciones) > 0)
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 20%">Fecha</th>
                            <th style="width: 25%">Resultado</th>
                            <th style="width: 30%">Comentario</th>
                            <th style="width: 25%">Imagen</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($evaluaciones as $evaluacion)
                        <tr>
                            <td>{{ $evaluacion['fecha'] }}</td>
                            <td>
                                @php
                                    $resultado = strtolower($evaluacion['resultado']);
                                    $badgeClass = 'badge ';
                                    if (str_contains($resultado, 'leve')) {
                                        $badgeClass .= 'badge-leve';
                                    } elseif (str_contains($resultado, 'moderado')) {
                                        $badgeClass .= 'badge-moderado';
                                    } elseif (str_contains($resultado, 'severo')) {
                                        $badgeClass .= 'badge-severo';
                                    } elseif (str_contains($resultado, 'ausente')) {
                                        $badgeClass .= 'badge-ausente';
                                    } else {
                                        $badgeClass .= 'badge-ausente';
                                    }
                                @endphp
                                <span class="{{ $badgeClass }}">{{ $evaluacion['resultado'] }}</span>
                            </td>
                            <td>
                                @if(isset($evaluacion['comentario']) && $evaluacion['comentario'])
                                    {{ $evaluacion['comentario'] }}
                                @else
                                    <span class="no-data">Sin comentario</span>
                                @endif
                            </td>
                            <td>
                                @if(isset($evaluacion['imagenes']) && count($evaluacion['imagenes']) > 0)
                                    <div class="images-container">
                                        @foreach($evaluacion['imagenes'] as $imagen)
                                            <img src="{{ $imagen }}" alt="Imagen de evaluación" class="image-thumbnail">
                                        @endforeach
                                    </div>
                                @else
                                    <span class="no-data">Sin imágenes</span>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                    <p>No hay evaluaciones registradas para este paciente.</p>
                </div>
            @endif
        </div>
        
        <div class="footer">
            <p>Dermedic - Sistema de Clasificación de Acné Vulgar</p>
            <p class="date-generated">Reporte generado el {{ now()->format('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>